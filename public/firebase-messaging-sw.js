importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');
importScripts('https://cdn.jsdelivr.net/npm/dexie@3.2.4/dist/dexie.min.js');

console.log('Service Worker: Initializing Firebase');

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyDcXhxdqvehmZ1XRugk1gfmySx4fSfxiv4",
  authDomain: "cassett-ad190.firebaseapp.com",
  projectId: "cassett-ad190",
  storageBucket: "cassett-ad190.firebasestorage.app",
  messagingSenderId: "1038684508536",
  appId: "1:1038684508536:web:938bfbcc6b96aa57c7b88d",
  measurementId: "G-3095W4P676"
});

// Initialize Messaging
const messaging = firebase.messaging();

// Set up Dexie database

// Handle background message
messaging.onBackgroundMessage(function (payload) {
  const db = new Dexie('notification');
  db.version(1).stores({ notif: '++id,item' });

  const notifItem = { id: 1, item: payload };
  db.notif.put(notifItem);

  console.log("Received background message ", payload);
});
