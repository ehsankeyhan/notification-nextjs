'use client'

import { useState, useEffect } from 'react'
import { subscribeUser, unsubscribeUser } from './actions'
import { getFCMToken, messaging } from './firebase'
import { onMessage } from 'firebase/messaging'

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<string>('default')
  const [isSafari, setIsSafari] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Function to check existing token
  const checkExistingToken = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return null;

      const currentToken = await getFCMToken();
      if (currentToken) {
        setToken(currentToken);
        await subscribeUser(currentToken);
      }
      return currentToken;
    } catch (error) {
      console.error('Error checking existing token:', error);
      return null;
    }
  };

  useEffect(() => {
    const checkSupport = async () => {
      const safariCheck = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      setIsSafari(safariCheck);
      console.log('Browser is Safari:', safariCheck);
      
      // Check current permission status
      if ('permissions' in navigator) {
        const permissionStatus = await navigator.permissions.query({ name: 'notifications' });
        setPermissionStatus(permissionStatus.state);
        
        // If permission is already granted, try to get the token
        if (permissionStatus.state === 'granted') {
          await checkExistingToken();
        }
        
        permissionStatus.onchange = () => {
          setPermissionStatus(permissionStatus.state);
          // If permission changes to granted, try to get the token
          if (permissionStatus.state === 'granted') {
            checkExistingToken();
          } else if (permissionStatus.state === 'denied') {
            setToken(null);
          }
        };
      }
      
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        setIsSupported(true);
      } else {
        console.log('Push notifications not supported');
        setIsSupported(false);
      }
    };
    
    checkSupport();
  }, []);

  async function requestPermission() {
    try {
      setError(null);
      const permission = await Notification.requestPermission();
      console.log('Permission status:', permission);
      setPermissionStatus(permission);
      
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        setError('Notification permission was denied');
        return false;
      }

      // If permission is granted, try to get the token
      await checkExistingToken();
      return true;
    } catch (err) {
      console.error('Error requesting permission:', err);
      setError('Failed to request notification permission');
      return false;
    }
  }

  async function initializeFCM() {
    try {
      setError(null);
      
      // First request permission
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        return;
      }

      // Check if service worker is registered
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        console.error('No service worker registration found');
        setError('Service worker not registered');
        return;
      }

      const currentToken = await getFCMToken();
      if (currentToken) {
        setToken(currentToken);
        await subscribeUser(currentToken);
      } else {
        console.log('Failed to get FCM token');
        setError('Failed to generate FCM token');
      }
      
    } catch (error) {
      console.error('Error initializing FCM:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        setError(error.message);
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
      try {
        await unsubscribeUser(token);
        setToken(null);
        setError(null);
      } catch (error) {
        console.error('Error unsubscribing:', error);
        setError('Failed to unsubscribe from notifications');
      }
    }
  }

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>
  }

  return (
    <div>
      <h3>Push Notifications</h3>
      {error && (
        <div style={{ 
          padding: '10px', 
          margin: '10px 0', 
          backgroundColor: '#ffebee', 
          color: '#c62828',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}
      {token ? (
        <>
          <p>You are subscribed to push notifications.</p>
          <button onClick={unsubscribeFromPush}>Unsubscribe</button>
        </>
      ) : (
        <>
          <p>You are not subscribed to push notifications.</p>
          {isSafari ? (
            <div>
              <p style={{ color: '#666', fontSize: '0.9em' }}>
                Safari requires explicit permission for notifications. Click the button below to enable:
              </p>
              <button 
                onClick={initializeFCM}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007AFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Enable Notifications
              </button>
            </div>
          ) : (
            <button onClick={initializeFCM}>Subscribe</button>
          )}
        </>
      )}
      
      {/* Debug Information */}
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h4>Debug Information</h4>
        <p>Browser Support: {isSupported ? '✅ Supported' : '❌ Not Supported'}</p>
        <p>Browser Type: {isSafari ? 'Safari' : 'Other'}</p>
        <p>Permission Status: {permissionStatus}</p>
        <p>Token Status: {token ? '✅ Token Generated' : '❌ No Token'}</p>
        <p>User Agent: {navigator.userAgent}</p>
      </div>
    </div>
  )
}