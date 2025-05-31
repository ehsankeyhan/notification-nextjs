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

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Service Worker: Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message',
    icon: '/icon.png',
    badge: '/icon.png',
    tag: 'notification-1',
    data: payload.data || {},
    requireInteraction: true, // Keep notification visible until user interacts
    actions: [
      {
        action: 'open',
        title: 'Open'
      }
    ]
  };

  console.log('Service Worker: Showing notification:', notificationTitle);
  
  return self.registration.showNotification(notificationTitle, notificationOptions)
    .then(() => {
      console.log('Service Worker: Notification shown successfully');
    })
    .catch(error => {
      console.error('Service Worker: Error showing notification:', error);
    });
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('Service Worker: Notification click received');
  
  event.notification.close();
  
  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({
      type: "window"
    }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url === '/' && 'focus' in client)
          return client.focus();
      }
      if (clients.openWindow)
        return clients.openWindow('/');
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