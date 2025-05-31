import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDcXhxdqvehmZ1XRugk1gfmySx4fSfxiv4",
  authDomain: "cassett-ad190.firebaseapp.com",
  projectId: "cassett-ad190",
  storageBucket: "cassett-ad190.firebasestorage.app",
  messagingSenderId: "1038684508536",
  appId: "1:1038684508536:web:938bfbcc6b96aa57c7b88d",
  measurementId: "G-3095W4P676"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize messaging only on the client side
let messaging: any = null;
if (typeof window !== 'undefined') {
  try {
    // Register service worker first
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    messaging = getMessaging(app);
    console.log('Firebase messaging initialized successfully');
    
    // Request notification permission
    Notification.requestPermission().then((permission) => {
      console.log('Notification permission:', permission);
    });
    
    // Set up message listener
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      
      // Show notification manually for foreground messages
      if (payload.notification) {
        const { title, body } = payload.notification;
        if (title && body) {
          new Notification(title, {
            body,
            icon: '/icon.png',
            badge: '/icon.png',
            tag: 'notification-1'
          });
        }
      }
    });
  } catch (error) {
    console.error('Error initializing Firebase messaging:', error);
  }
}

export const getFCMToken = async () => {
  if (!messaging) {
    console.log('Messaging not initialized');
    return null;
  }
  
  try {
    // Check notification permission first
    const permission = await Notification.requestPermission();
    console.log('Notification permission status:', permission);
    
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }
    
    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: await navigator.serviceWorker.getRegistration()
    });
    
    if (currentToken) {
      console.log('FCM Token:', currentToken);
      // You can send this token to your server here
    } else {
      console.log('No FCM token available');
    }
    
    return currentToken;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

export { messaging }; 