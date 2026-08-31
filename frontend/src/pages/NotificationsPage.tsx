import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { INotification } from '@shared/types';
import { Bell, CheckCircle2, Clock, Trash2, ArrowLeft } from 'lucide-react';
import { DiyaIcon, MandalaCorner } from '../components/layout/IndianMotifs';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
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
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/dashboard'))}
          className="flex items-center space-x-2 text-xs font-bold text-utsav-maroon-900 dark:text-utsav-gold hover:underline cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>← Back to Dashboard</span>
        </button>

        <span className="text-[11px] font-semibold text-gray-500">
          UtsavMitra Real-Time Broadcasts
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-utsav-gold/30 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-utsav-maroon-800 text-utsav-gold border border-utsav-gold/40 shadow-md">
            <Bell className="w-6 h-6 text-utsav-gold" />
          </div>
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
              Auspicious Updates & Notifications
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Live RSVP check-ins, payment escrow confirmations, and celebration alerts.
            </p>
          </div>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 rounded-xl gold-gradient-btn text-xs font-bold shadow-md cursor-pointer"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-16 text-center text-gray-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="p-12 rounded-3xl bg-utsav-beige-100 dark:bg-utsav-maroon-900 border border-utsav-gold/30 text-center space-y-3 shadow-md">
          <DiyaIcon className="w-10 h-10 mx-auto" />
          <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">All Caught Up!</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">You will receive alerts on RSVP entries, payments, and live broadcasts here.</p>
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
              <div className="w-8 h-8 rounded-xl bg-utsav-maroon-800 text-utsav-gold flex items-center justify-center shrink-0 shadow-xs">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs sm:text-sm text-utsav-maroon-800 dark:text-utsav-gold">
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {new Date(notif.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs leading-relaxed">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
