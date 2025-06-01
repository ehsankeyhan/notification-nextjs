import { NextResponse } from 'next/server';
import { getAllTokens } from '@/app/actions';

export async function POST(request: Request) {
  try {
    const { title, body, data } = await request.json();
    const { tokens } = await getAllTokens();

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ error: 'No tokens available' }, { status: 400 });
    }

    // Send notification to each token
    const notifications = tokens.map(async (token) => {
      const message = {
        message: {
          token,
          notification: {
            title,
            body
          },
          data: {
            ...data,
            timestamp: new Date().toISOString()
          },
          apns: {
            payload: {
              aps: {
                'content-available': 1,
                'mutable-content': 1,
                sound: "default"
              }
            },
            headers: {
              "apns-priority": "10",
              "apns-push-type": "alert"
            }
          }
        }
      };

      const response = await fetch('https://fcm.googleapis.com/v1/projects/cassett-ad190/messages:send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.FIREBASE_SERVER_KEY}`
        },
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        throw new Error(`Failed to send notification: ${response.statusText}`);
      }

      return response.json();
    });

    await Promise.all(notifications);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
} 