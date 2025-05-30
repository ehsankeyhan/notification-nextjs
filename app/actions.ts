'use server'
 
import webpush, { PushSubscription } from 'web-push'
 
webpush.setVapidDetails(
  'mailto: <ehsan_keyhan@yahoo.com>',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)
 
export async function subscribeUser(sub: PushSubscription) {
  // In a production environment, you would want to store the subscription in a database
  // For example: await db.subscriptions.create({ data: sub })
  console.log('Received subscription:', sub);
  return { success: true }
}
 
export async function unsubscribeUser() {
  // In a production environment, you would want to remove the subscription from the database
  // For example: await db.subscriptions.delete({ where: { ... } })
  return { success: true }
}
 
export async function sendNotification(message: string, sub: PushSubscription) {
  if (!sub) {
    throw new Error('No subscription available')
  }
 
  try {
    await webpush.sendNotification(
      sub,
      JSON.stringify({
        title: 'Test Notification',
        body: message,
        icon: '/icon.png',
      })
    )
    return { success: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}