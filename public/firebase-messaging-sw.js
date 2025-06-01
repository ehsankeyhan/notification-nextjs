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

console.log('Service Worker: Firebase initialized');

const messaging = firebase.messaging();

// Keep track of shown notifications to prevent duplicates
const shownNotifications = new Set();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  // Create a unique message ID
  const messageId = payload.data?.messageId || payload.messageId || JSON.stringify(payload);

  // Check if we've already shown this notification
  if (shownNotifications.has(messageId)) {
    console.log('Duplicate notification, skipping:', messageId);
    return;
  }

  // Add to shown notifications
  shownNotifications.add(messageId);

  // Clean up old notifications (keep last 100)
  if (shownNotifications.size > 100) {
    const oldestNotification = Array.from(shownNotifications)[0];
    shownNotifications.delete(oldestNotification);
  }

  // Customize notification here
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
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

  // Show the notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);

  event.notification.close();

  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({
      type: "window"
    })
    .then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Handle push event (for Safari)
self.addEventListener('push', function(event) {
  console.log('Service Worker: Push event received');
  
  if (event.data) {
    try {
      const data = event.data.json();
      console.log('Service Worker: Push data:', data);
      
      const notificationTitle = data.notification?.title || 'New Message';
      const notificationOptions = {
        body: data.notification?.body || 'You have a new message',
        icon: '/icon.png',
        badge: '/icon.png',
        tag: 'notification-1',
        data: data.data || {},
        requireInteraction: true,
        actions: [
          {
            action: 'open',
            title: 'Open'
          }
        ]
      };

      event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions)
          .then(() => {
            console.log('Service Worker: Push notification shown successfully');
          })
          .catch(error => {
            console.error('Service Worker: Error showing push notification:', error);
          })
      );
    } catch (error) {
      console.error('Service Worker: Error processing push data:', error);
    }
  }
});

// Log when the service worker is installed
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Log when the service worker is activated
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  // Claim all clients to ensure the service worker is in control
  event.waitUntil(clients.claim());
}); 