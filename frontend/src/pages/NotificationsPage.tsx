import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { INotification } from '@shared/types';
import { Bell, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { DiyaIcon } from '../components/layout/IndianMotifs';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ success: boolean; notifications: INotification[] }>('/notifications')
      .then((res) => {
        if (res.success && res.notifications) {
          setNotifications(res.notifications);
        }
      })
      .catch((err) => console.error('Failed to load notifications:', err))
      .finally(() => setLoading(false));
  }, []);

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-read', {});
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-utsav-gold/30 pb-4">
        <div className="flex items-center space-x-2">
          <Bell className="w-6 h-6 text-utsav-saffron" />
          <h1 className="font-heading text-2xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
            Auspicious Updates & Notifications
          </h1>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold hover:underline"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="p-12 rounded-3xl bg-utsav-beige-100 dark:bg-utsav-maroon-900 border border-utsav-gold/30 text-center space-y-3">
          <DiyaIcon className="w-10 h-10 mx-auto" />
          <h3 className="font-heading text-sm font-bold">All Caught Up!</h3>
          <p className="text-xs text-gray-500">You will receive alerts on RSVP entries, payments, and live broadcasts here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-4 rounded-2xl border transition-all flex items-start space-x-3 ${
                notif.isRead
                  ? 'bg-white dark:bg-utsav-maroon-950/60 border-utsav-gold/20 text-gray-500'
                  : 'bg-utsav-ivory dark:bg-utsav-maroon-900 border-utsav-gold/60 shadow-md text-utsav-brown dark:text-utsav-ivory'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-utsav-maroon-800 text-utsav-gold flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs sm:text-sm text-utsav-maroon-800 dark:text-utsav-gold">
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-gray-400">
                    {new Date(notif.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
