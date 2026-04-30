importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD-gd0peUY_1eXJC8dfd9x0wSOWnZTOJc4",
  authDomain: "ai-studio-applet-webapp-a0e8c.firebaseapp.com",
  projectId: "ai-studio-applet-webapp-a0e8c",
  storageBucket: "ai-studio-applet-webapp-a0e8c.firebasestorage.app",
  messagingSenderId: "617256015761",
  appId: "1:617256015761:web:4f5b3aeca7ca5e83a92c30"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
