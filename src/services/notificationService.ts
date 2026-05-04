import { getToken, onMessage } from 'firebase/messaging';
import { messaging, db, auth } from './firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

export const notificationService = {
  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: 'BP2W6PyFWmj-sLDOMmaGbImgSmwsN29eXM9wN3AUBhAYurx0LCKDK5DfNAmjZ0TdsT6DU775xpGFTAyQUDjslZM' 
        });
        
        if (token && auth.currentUser) {
          // Store token in user profile
          const userRef = doc(db, 'users', auth.currentUser.uid);
          await updateDoc(userRef, {
            fcmTokens: arrayUnion(token)
          });
          return token;
        }
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
    return null;
  },

  onMessageListener() {
    return new Promise((resolve) => {
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    });
  }
};
