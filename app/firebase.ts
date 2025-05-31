import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

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
let messaging: Messaging | null = null;
if (typeof window !== 'undefined') {
  try {
    // Register service worker first
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
          
          // Check if the service worker is active
          if (registration.active) {
            console.log('Service Worker is active');
          } else {
            console.log('Service Worker is not active yet');
          }
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    messaging = getMessaging(app);
    console.log('Firebase messaging initialized successfully');
    
    // Set up message listener
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      
      // Show notification manually for foreground messages
      if (payload.notification) {
        const { title, body } = payload.notification;
        if (title && body) {
          const notificationOptions = {
            body,
            icon: '/icon.png',
            badge: '/icon.png',
            tag: 'notification-1',
            requireInteraction: true,
            actions: [
              {
                action: 'open',
                title: 'Open'
              }
            ]
          };
          
          new Notification(title, notificationOptions);
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
    // Check if we're in Safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    console.log('Browser is Safari:', isSafari);

    // Get service worker registration
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      console.error('No service worker registration found');
      return null;
    }

    // For Safari, ensure the service worker is active
    if (isSafari && !registration.active) {
      console.log('Waiting for service worker to become active...');
      await new Promise(resolve => {
        registration.addEventListener('activate', resolve, { once: true });
      });
    }
    
    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration
    });
    
    if (currentToken) {
      console.log('FCM Token:', currentToken);
    } else {
      console.log('No FCM token available');
    }
    
    return currentToken;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return null;
  }
};

export { messaging }; 