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
  limit,
  increment
} from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from './firebase';

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
  const errInfo: any = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path,
    timestamp: new Date().toISOString()
  };
  
  // Remote logging for production debugging
  if (auth.currentUser) {
    import('firebase/firestore').then(({ addDoc, collection, serverTimestamp }) => {
      addDoc(collection(db, 'system_logs'), {
        ...errInfo,
        serverTime: serverTimestamp(),
        userAgent: navigator.userAgent
      }).catch(console.error);
    });
  }

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
        points: 0,
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
  async getStudentsByInstructor(instructorId: string, callback: (students: any[]) => void) {
    try {
      const q = query(
        collection(db, 'students'),
        where('instructorId', '==', instructorId),
        orderBy('createdAt', 'desc')
      );

      return onSnapshot(q, async (snapshot) => {
        const studentDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const students = await Promise.all(studentDocs.map(async (s: any) => {
          const userSnap = await getDoc(doc(db, 'users', s.userId));
          return {
            ...s,
            ...(userSnap.exists() ? userSnap.data() : {})
          };
        }));
        callback(students);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'students');
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'students');
    }
  },

  async deleteStudent(studentId: string) {
    try {
      await updateDoc(doc(db, 'students', studentId), { status: 'deleted', instructorId: null });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `students/${studentId}`);
    }
  },

  async updateStudentStatus(studentId: string, status: 'active' | 'blocked') {
    try {
      await updateDoc(doc(db, 'students', studentId), { status });
      await updateDoc(doc(db, 'users', studentId), { status });
    } catch (error) {
       handleFirestoreError(error, OperationType.UPDATE, `students/${studentId}`);
    }
  },

  async registerStudent(instructorId: string, data: { name: string, email: string, plan: string }) {
    const studentUid = `stu_${Date.now()}`;
    try {
      await setDoc(doc(db, 'users', studentUid), {
        uid: studentUid,
        email: data.email,
        name: data.name,
        role: 'student',
        status: 'active',
        points: 0,
        createdAt: serverTimestamp()
      });

      await setDoc(doc(db, 'students', studentUid), {
        userId: studentUid,
        instructorId: instructorId,
        accessReleased: true,
        status: 'active',
        plan: data.plan,
        points: 0,
        createdAt: serverTimestamp()
      });

      return studentUid;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `students/${studentUid}`);
    }
  },

  async saveStudentWorkout(studentId: string, workout: any) {
    const path = `workouts/${studentId}`;
    try {
      await setDoc(doc(db, 'workouts', studentId), {
        studentId,
        workout,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // --- Leveling & Ranking ---
  calculateLevel(points: number) {
    const levels = [
      { lvl: 1, min: 0 },
      { lvl: 2, min: 1000 },
      { lvl: 3, min: 2500 },
      { lvl: 4, min: 5000 },
      { lvl: 5, min: 10000 },
      { lvl: 6, min: 20000 },
      { lvl: 7, min: 40000 },
      { lvl: 8, min: 80000 },
      { lvl: 9, min: 150000 },
      { lvl: 10, min: 300000 },
    ];
    
    let currentLevel = 1;
    let nextLevelExp = levels[1].min;
    
    for (let i = 0; i < levels.length; i++) {
       if (points >= levels[i].min) {
         currentLevel = levels[i].lvl;
         nextLevelExp = levels[i+1]?.min || levels[i].min * 2;
       } else {
         break;
       }
    }
    
    const progress = ((points - (levels[currentLevel - 1]?.min || 0)) / (nextLevelExp - (levels[currentLevel - 1]?.min || 0))) * 100;

    return {
      level: currentLevel,
      points,
      nextLevelExp,
      progress: Math.min(Math.max(progress, 0), 100)
    };
  },

  async completeWorkoutSession(studentId: string, sessionData: any) {
    const id = `sess_${Date.now()}`;
    try {
      const { writeBatch, doc, serverTimestamp, increment } = await import('firebase/firestore');
      const batch = writeBatch(db);
      
      batch.set(doc(db, 'workout_sessions', id), {
        id,
        studentId,
        ...sessionData,
        createdAt: serverTimestamp(),
      });
      
      const rewardPoints = sessionData.rewardPoints || 100;

      // Atomic Increments - Matches security rules (only up to 1000 per update)
      batch.update(doc(db, 'students', studentId), {
        points: increment(rewardPoints),
        updatedAt: serverTimestamp()
      });
      
      batch.update(doc(db, 'users', studentId), {
        points: increment(rewardPoints),
        updatedAt: serverTimestamp()
      });
      
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `workout_sessions/${id}`);
    }
  },

  async getStudentWorkout(studentId: string) {
    const path = `workouts/${studentId}`;
    try {
      const docSnap = await getDoc(doc(db, 'workouts', studentId));
      return docSnap.exists() ? docSnap.data()?.workout : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  },

  // --- Plans Management ---
  async getPlans() {
    try {
      const q = query(collection(db, 'plans'), orderBy('price', 'asc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'plans');
    }
  },

  async savePlan(plan: any) {
    const id = plan.id || `plan_${Date.now()}`;
    try {
      await setDoc(doc(db, 'plans', id), {
        ...plan,
        id,
        updatedAt: serverTimestamp(),
        createdAt: plan.createdAt || serverTimestamp()
      }, { merge: true });
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `plans/${id}`);
    }
  },

  async deletePlan(id: string) {
    try {
      // Actually we prefer soft-delete by deactivating
      await updateDoc(doc(db, 'plans', id), { active: false });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `plans/${id}`);
    }
  },

  async seedInitialPlans() {
    try {
      const existing = await this.getPlans();
      if (existing && existing.length > 0) return;

      const initialPlans = [
        {
          id: 'basic',
          name: 'Plano Básico',
          price: 0,
          currency: 'BRL',
          features: ['Acesso limitado', 'Até 5 alunos', 'Suporte básico'],
          active: true
        },
        {
          id: 'pro',
          name: 'Plano Pro',
          price: 29.90,
          currency: 'BRL',
          features: ['Alunos ilimitados', 'Acesso à IA', 'Relatórios avançados', 'Suporte prioritário'],
          active: true
        },
        {
          id: 'premium',
          name: 'Plano Premium',
          price: 59.90,
          currency: 'BRL',
          features: ['Tudo do Pro', 'IA Generativa Avançada', 'Customização de marca', 'Consultoria'],
          active: true
        }
      ];

      for (const plan of initialPlans) {
        await this.savePlan(plan);
      }
    } catch (error) {
      console.error('Error seeding plans:', error);
    }
  }
};
