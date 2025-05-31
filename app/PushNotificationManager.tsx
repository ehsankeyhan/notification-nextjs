'use client'

import { useState, useEffect } from 'react'
import { subscribeUser, unsubscribeUser } from './actions'
import { getFCMToken, messaging } from './firebase'
import { onMessage } from 'firebase/messaging'

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      initializeFCM()
    }
  }, [])

  async function initializeFCM() {
    try {
      // Request notification permission first
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        console.log('Notification permission denied')
        return
      }

      const currentToken = await getFCMToken()
      if (currentToken) {
        setToken(currentToken)
        await subscribeUser(currentToken)
      }
      console.log(currentToken);
      
    } catch (error) {
      console.error('Error initializing FCM:', error)
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
    </div>
  )
}