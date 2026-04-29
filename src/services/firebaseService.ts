import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  serverTimestamp,
  type Firestore,
  onSnapshot,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firebaseService = {
  // --- Auth & Users ---
  async createUserProfile(uid: string, data: { email: string, name: string, role: 'instructor' | 'student' | 'admin', status?: 'active' | 'pending' | 'blocked' }) {
    const path = `users/${uid}`;
    const admins = ['thelo.tech2714@gmail.com', 'jeferson.executiva.net@gmail.com'];
    const finalRole = admins.includes(data.email.toLowerCase()) ? 'admin' : data.role;
    
    try {
      await setDoc(doc(db, 'users', uid), {
        ...data,
        role: finalRole,
        uid,
        status: data.status || (finalRole === 'admin' ? 'active' : 'pending'),
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getUserProfile(uid: string) {
    const path = `users/${uid}`;
    try {
      const docSnap = await getDoc(doc(db, 'users', uid));
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  // --- Instructors ---
  async registerInstructor(uid: string, data: { phone: string, plan: string, paymentStatus?: 'pending' | 'approved' | 'rejected' }) {
    const path = `instructors/${uid}`;
    try {
      await setDoc(doc(db, 'instructors', uid), {
        userId: uid,
        phone: data.phone,
        plan: data.plan,
        paymentStatus: data.paymentStatus || 'pending',
        updatedAt: serverTimestamp(),
      });
      
      // Create payment approval request
      await setDoc(doc(db, 'payment_approvals', uid), {
        instructorId: uid,
        plan: data.plan,
        status: data.paymentStatus || 'pending',
        createdAt: serverTimestamp(),
      });

      // Notify Admin
      const notifId = `notif_${Date.now()}`;
      await setDoc(doc(db, 'notifications', notifId), {
        toId: 'admin',
        title: 'Novo Instrutor Cadastrado',
        message: `O instrutor ${uid} se cadastrou no plano ${data.plan}.`,
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // --- Messaging ---
  async sendMessage(toId: string, fromName: string, content: string, type: 'support' | 'chat' = 'chat') {
    const fromId = auth.currentUser?.uid;
    if (!fromId) throw new Error('Unauthenticated');
    const id = `msg_${Date.now()}`;
    try {
      await setDoc(doc(db, 'messages', id), {
        fromId,
        fromName,
        toId,
        content,
        type,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `messages/${id}`);
    }
  },

  // --- Notifications ---
  async getNotifications(toId: string, callback: (notifications: any[]) => void) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('toId', '==', toId),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(notifications);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'notifications');
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    }
  },

  async createNotification(toId: string, title: string, message: string) {
    const id = `notif_${Date.now()}`;
    try {
      await setDoc(doc(db, 'notifications', id), {
        toId,
        title,
        message,
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `notifications/${id}`);
    }
  },

  async markNotificationRead(id: string) {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notifications/${id}`);
    }
  },

  async markAllNotificationsRead(toId: string) {
    try {
      const q = query(collection(db, 'notifications'), where('toId', '==', toId), where('read', '==', false));
      const querySnapshot = await getDocs(q);
      const promises = querySnapshot.docs.map(d => updateDoc(doc(db, 'notifications', d.id), { read: true }));
      await Promise.all(promises);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'notifications/all');
    }
  },

  // --- Admin Logic ---
  async getPendingApprovals() {
    const path = 'payment_approvals';
    try {
      const q = query(collection(db, 'payment_approvals'), where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async approveInstructor(instructorId: string) {
    try {
      // 1. Update user status to active
      await updateDoc(doc(db, 'users', instructorId), {
        status: 'active'
      });
      
      // 2. Update instructor payment status
      await updateDoc(doc(db, 'instructors', instructorId), {
        paymentStatus: 'approved'
      });
      
      // 3. Update payment approval record
      await updateDoc(doc(db, 'payment_approvals', instructorId), {
        status: 'approved'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `approve/${instructorId}`);
    }
  },

  // --- Students ---
  async releaseStudentAccess(studentId: string) {
    try {
      await updateDoc(doc(db, 'students', studentId), {
        accessReleased: true
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `students/${studentId}`);
    }
  },

  // --- Instructor Management ---
  async getInstructors() {
    const path = 'users';
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'instructor'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  // --- User Management ---
  async getAllUsers() {
    const path = 'users';
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getUsersByRole(role: string) {
    const path = 'users';
    try {
      const q = query(collection(db, 'users'), where('role', '==', role));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async updateUserStatus(uid: string, status: 'active' | 'blocked' | 'pending') {
    try {
      await updateDoc(doc(db, 'users', uid), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  },

  async updateUserProfile(uid: string, data: { name?: string, photoURL?: string }) {
    try {
      await updateDoc(doc(db, 'users', uid), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  },

  async getInstructorDetails(uid: string) {
    try {
      const docSnap = await getDoc(doc(db, 'instructors', uid));
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
       handleFirestoreError(error, OperationType.GET, `instructors/${uid}`);
    }
  },

  async updateInstructorProfile(uid: string, data: { phone?: string, plan?: string, experiencia?: string, especialidade?: string }) {
    try {
      await updateDoc(doc(db, 'instructors', uid), {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `instructors/${uid}`);
    }
  },

  async saveProgressPhoto(studentId: string, url: string, type: 'before' | 'after') {
    const id = `photo_${Date.now()}`;
    try {
      await setDoc(doc(db, 'progress_photos', id), {
        studentId,
        url,
        type,
        date: serverTimestamp()
      });
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `progress_photos/${id}`);
    }
  },

  async getProgressPhotos(studentId: string) {
    try {
      const q = query(
        collection(db, 'progress_photos'), 
        where('studentId', '==', studentId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'progress_photos');
    }
  },

  // --- Student Registration by Instructor ---
  async registerStudent(instructorId: string, data: { name: string, email: string, plan: string }) {
    const studentUid = `stu_${Date.now()}`;
    try {
      // 1. Create a "shadow" user record in users collection
      await setDoc(doc(db, 'users', studentUid), {
        uid: studentUid,
        email: data.email,
        name: data.name,
        role: 'student',
        status: 'active',
        createdAt: serverTimestamp()
      });

      // 2. Create record in students collection
      await setDoc(doc(db, 'students', studentUid), {
        userId: studentUid,
        instructorId: instructorId,
        accessReleased: true,
        status: 'active',
        plan: data.plan,
        createdAt: serverTimestamp()
      });

      return studentUid;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `students/${studentUid}`);
    }
  }
};
