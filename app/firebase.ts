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
      // Check if service worker is already registered
      navigator.serviceWorker.getRegistration()
        .then((registration) => {
          if (!registration) {
            // Only register if not already registered
            return navigator.serviceWorker.register('/firebase-messaging-sw.js', {
              scope: '/'
            })
              .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
                
                // Check if the service worker is active
                if (registration.active) {
                  console.log('Service Worker is active');
                } else {
                  console.log('Service Worker is not active yet');
                }
              });
          } else {
            console.log('Service Worker already registered');
          }
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    messaging = getMessaging(app);
    console.log('Firebase messaging initialized successfully');
    
    // Set up message listener with deduplication
    const processedMessages = new Set();
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      
      // Create a unique message ID
      const messageId = payload.data?.messageId || payload.messageId || JSON.stringify(payload);
      
      // Check if we've already processed this message
      if (processedMessages.has(messageId)) {
        console.log('Duplicate message received, skipping:', messageId);
        return;
      }
      
      // Add message to processed set
      processedMessages.add(messageId);
      
      // Clean up old message IDs (keep last 100)
      if (processedMessages.size > 100) {
        const oldestMessage = Array.from(processedMessages)[0];
        processedMessages.delete(oldestMessage);
      }
      
      // Show notification manually for foreground messages
      if (payload.notification) {
        const { title, body } = payload.notification;
        if (title && body) {
          // Check if notification permission is granted
          if (Notification.permission === 'granted') {
            const notificationOptions = {
              body,
              icon: '/icon.png',
              badge: '/icon.png',
              tag: messageId, // Use messageId as tag to prevent duplicate notifications
              requireInteraction: true,
              actions: [
                {
                  action: 'open',
                  title: 'Open'
                }
              ],
              data: payload.data || {} // Include any additional data
            };
            
            // Check if a notification with this tag already exists
            const existingNotification = document.querySelector(`[data-notification-tag="${messageId}"]`);
            if (!existingNotification) {
              new Notification(title, notificationOptions);
            }
          }
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