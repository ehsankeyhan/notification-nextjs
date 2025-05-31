'use client'

import { useState, useEffect } from 'react'
import { subscribeUser, unsubscribeUser } from './actions'
import { getFCMToken, messaging } from './firebase'
import { onMessage } from 'firebase/messaging'

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<string>('default')

  useEffect(() => {
    const checkSupport = async () => {
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      console.log('Browser is Safari:', isSafari);
      
      // Check current permission status
      if ('permissions' in navigator) {
        const permissionStatus = await navigator.permissions.query({ name: 'notifications' });
        setPermissionStatus(permissionStatus.state);
        
        permissionStatus.onchange = () => {
          setPermissionStatus(permissionStatus.state);
        };
      }
      
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        setIsSupported(true);
        try {
          await initializeFCM();
        } catch (error) {
          console.error('Failed to initialize FCM:', error);
        }
      } else {
        console.log('Push notifications not supported');
        setIsSupported(false);
      }
    };
    
    checkSupport();
  }, []);

  async function initializeFCM() {
    try {
      // Request notification permission first
      const permission = await Notification.requestPermission();
      console.log('Permission status:', permission);
      setPermissionStatus(permission);
      
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return;
      }

      // Check if service worker is registered
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        console.error('No service worker registration found');
        return;
      }

      const currentToken = await getFCMToken();
      if (currentToken) {
        setToken(currentToken);
        await subscribeUser(currentToken);
      } else {
        console.log('Failed to get FCM token');
      }
      
    } catch (error) {
      console.error('Error initializing FCM:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
    }

    // Handle foreground messages
    if (messaging) {
      onMessage(messaging, (payload) => {
        console.log('Message received:', payload)
        // You can show a custom notification here if needed
      })
    }
  }

  async function unsubscribeFromPush() {
    if (token) {
      await unsubscribeUser(token)
      setToken(null)
    }
  }

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>
  }

  return (
    <div>
      <h3>Push Notifications</h3>
      {token ? (
        <>
          <p>You are subscribed to push notifications.</p>
          <button onClick={unsubscribeFromPush}>Unsubscribe</button>
        </>
      ) : (
        <>
          <p>You are not subscribed to push notifications.</p>
          <button onClick={initializeFCM}>Subscribe</button>
        </>
      )}
      
      {/* Debug Information */}
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h4>Debug Information</h4>
        <p>Browser Support: {isSupported ? '✅ Supported' : '❌ Not Supported'}</p>
        <p>Permission Status: {permissionStatus}</p>
        <p>Token Status: {token ? '✅ Token Generated' : '❌ No Token'}</p>
        <p>User Agent: {navigator.userAgent}</p>
      </div>
    </div>
  )
}