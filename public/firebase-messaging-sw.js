
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

console.log('Service Worker: Starting initialization');

firebase.initializeApp({
  apiKey: "AIzaSyDcXhxdqvehmZ1XRugk1gfmySx4fSfxiv4",
  authDomain: "cassett-ad190.firebaseapp.com",
  projectId: "cassett-ad190",
  storageBucket: "cassett-ad190.firebasestorage.app",
  messagingSenderId: "1038684508536",
  appId: "1:1038684508536:web:938bfbcc6b96aa57c7b88d",
  measurementId: "G-3095W4P676"
});

// const messaging = firebase.messaging();

// // Handle background messages
// messaging.onBackgroundMessage((payload) => {
//   const notification = payload.notification;
//   const options = {
//     body: notification?.body,
//     icon: '/icon.png', // replace with your icon path
//   };

//   self.registration.showNotification(notification?.title || 'Notification', options);
// });
// firebase.messaging().onBackgroundMessage((payload) => {
//   console.log(
//     '[firebase-messaging-sw.js] Received background message ',
//     payload
//   );
//   // Customize notification here
//   const notificationTitle = 'Background Message Title';
//   const notificationOptions = {
//     body: 'Background Message body.',
//     icon: payload.notification.image
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });
firebase.messaging().onBackgroundMessage( function ({ data,notification }) {
  console.log(data,notification);
  
  if (notification && notification.title) {
    const notificationTitle = data.title;
    const notificationOptions = {
      body: notification.body,
      icon: notification.image
    };

    self.registration?.showNotification(notificationTitle, notificationOptions);
  }
})
