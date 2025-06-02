'use client';

import { useEffect, useState } from 'react';
import Dexie, { Table } from 'dexie';
import Image from 'next/image';

interface Notification {
  id?: number;
  item: any;
  timestamp: string;
}

class NotificationDatabase extends Dexie {
  notif!: Table<Notification>;

  constructor() {
    super('notification');
    this.version(1).stores({
      notif: '++id,item,timestamp'
    });
  }
}

export default function NotificationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    const fetchLastNotification = async () => {
      try {
        const db = new NotificationDatabase();
        const lastNotification = await db.notif
          .reverse()
          .first();

        if (lastNotification) {
          setNotification(lastNotification);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Error fetching notification:', error);
      }
    };

    fetchLastNotification();
  }, []);

  const handleClose = async () => {
    if (notification?.id) {
      try {
        const db = new NotificationDatabase();
        await db.notif.delete(notification.id);
        console.log('Notification deleted successfully');
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
    setIsOpen(false);
    setNotification(null);
  };

  if (!isOpen || !notification) return null;

  const imageUrl = notification.item?.notification?.image || 
                  notification.item?.data?.image || 
                  notification.item?.data?.imageUrl;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {notification.item?.notification?.title || 'New Notification'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {imageUrl && (
          <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt="Notification image"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <p className="text-gray-600 mb-4">
          {notification.item?.notification?.body || notification.item?.data?.message || 'No message content'}
        </p>
      </div>
    </div>
  );
} 