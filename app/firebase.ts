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

const app = initializeApp(firebaseConfig);

let messaging: Messaging | null = null;

if (typeof window !== 'undefined') {
  try {
    const isIOSStandalone =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      window.matchMedia('(display-mode: standalone)').matches;

    console.log('Is iOS Standalone:', isIOSStandalone);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (!registration) {
          navigator.serviceWorker
            .register('/firebase-messaging-sw.js', { scope: '/' })
            .then((reg) => console.log('Service Worker registered:', reg.scope))
            .catch((err) => console.error('Service Worker registration failed:', err));
        } else {
          console.log('Service Worker already registered');
        }
      });
    }

    messaging = getMessaging(app);
    console.log('Firebase messaging initialized');

    const processedMessages = new Set<string>();

    onMessage(messaging, (payload) => {
      console.log('Foreground message:', payload);

      const messageId =
        payload.data?.messageId || payload.messageId || JSON.stringify(payload);

      if (processedMessages.has(messageId)) {
        console.log('Duplicate message skipped:', messageId);
        return;
      }

      processedMessages.add(messageId);
      // if (processedMessages.size > 100) {
      //   processedMessages.delete(processedMessages.values().next().value);
      // }

      const { title, body } = payload.notification || {};
      if (title && body && Notification.permission === 'granted' && !isIOSStandalone) {
        new Notification(title as string, {
          body,
          icon: '/icon.png',
          badge: '/icon.png',
          tag: messageId || '', // ensure it's a string
          requireInteraction: true,
          data: { ...payload.data, from: 'firebase' }
        });
      }
      
    });
  } catch (error) {
    console.error('Firebase messaging init error:', error);
  }
}

export const getFCMToken = async (): Promise<string | null> => {
  if (!messaging) {
    console.log('Messaging not initialized');
    return null;
  }

  try {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    console.log('Is Safari:', isSafari);

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      console.error('No service worker registration found');
      return null;
    }

    if (isSafari && !registration.active) {
      console.log('Waiting for service worker to activate...');
      await new Promise((resolve) =>
        registration.addEventListener('activate', resolve, { once: true })
      );
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    console.log(token ? 'FCM Token:' : 'No FCM token available', token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    if (error instanceof Error) {
      console.error({
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return null;
  }
};

export { messaging };
