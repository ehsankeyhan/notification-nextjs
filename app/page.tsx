'use client'
import { useEffect, useState } from "react"
import { PushNotificationManager } from "./PushNotificationManager"
import { messaging } from "./firebase"
import { onMessage, MessagePayload } from "firebase/messaging"

// Define types for notification data
interface NotificationData {
  timestamp: string;
  source: 'firebase' | 'service-worker';
  data: MessagePayload | Record<string, unknown>;
}

function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
 
  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream
    )
 
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
  }, [])
 
  if (isStandalone) {
    return null // Don't show install button if already installed
  }
 
  return (
    <div>
      <h3>Install App</h3>
      <button>Add to Home Screen</button>
      {isIOS && (
        <p>
          To install this app on your iOS device, tap the share button
          <span role="img" aria-label="share icon">
            {' '}
            ⎋{' '}
          </span>
          and then &quot;Add to Home Screen&quot;
          <span role="img" aria-label="plus icon">
            {' '}
            ➕{' '}
          </span>.
        </p>
      )}
    </div>
  )
}

function NotificationDebugger() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [deviceInfo, setDeviceInfo] = useState({
    userAgent: '',
    isIOS: false,
    isStandalone: false,
    isSafari: false
  })

  useEffect(() => {
    // Set device info
    const userAgent = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(userAgent)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent)

    setDeviceInfo({
      userAgent,
      isIOS,
      isStandalone,
      isSafari
    })

    // Listen for notifications
    if (messaging) {
      onMessage(messaging, (payload) => {
        console.log('Received message:', payload)
        const newNotification: NotificationData = {
          timestamp: new Date().toISOString(),
          source: 'firebase',
          data: payload
        }
        setNotifications(prev => [newNotification, ...prev].slice(0, 10))
      })
    }

    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Service Worker message:', event.data)
        const newNotification: NotificationData = {
          timestamp: new Date().toISOString(),
          source: 'service-worker',
          data: event.data
        }
        setNotifications(prev => [newNotification, ...prev].slice(0, 10))
      })
    }
  }, [])

  const sendTestNotification = async () => {
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Notification',
          body: `Test sent at ${new Date().toLocaleTimeString()}`,
          data: {
            messageId: `test-${Date.now()}`,
            from: 'push'
          }
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to send notification')
      }
      
      console.log('Test notification sent successfully')
    } catch (error) {
      console.error('Error sending test notification:', error)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Notification Debugger</h2>
      
      {/* Device Information */}
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Device Information</h3>
        <pre className="text-sm">
          {JSON.stringify(deviceInfo, null, 2)}
        </pre>
      </div>

      {/* Test Notification Button */}
      <div className="mb-4">
        <button
          onClick={sendTestNotification}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Send Test Notification
        </button>
      </div>

      {/* Notification History */}
      <div className="mb-4">
        <h3 className="font-bold mb-2">Notification History</h3>
        <div className="space-y-2">
          {notifications.map((notification, index) => (
            <div key={index} className="p-2 bg-gray-100 rounded">
              <div className="text-sm text-gray-500">
                {new Date(notification.timestamp).toLocaleString()}
              </div>
              <div className="font-bold">Source: {notification.source}</div>
              <pre className="text-sm mt-1">
                {JSON.stringify(notification.data, null, 2)}
              </pre>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="text-gray-500">No notifications received yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
 
export default function Page() {
  return (
    <div>
      <PushNotificationManager />
      <NotificationDebugger />
      <InstallPrompt />
    </div>
  )
}
