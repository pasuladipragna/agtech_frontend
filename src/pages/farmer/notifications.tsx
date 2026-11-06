import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { api } from '../../services/api';
import { TERMS } from '../../constants/terminology';
import EmptyState from '../../components/ui/EmptyState';
import { Bell, CheckCheck, AlertTriangle, Info, Tractor, Leaf, Droplets, Filter } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'ALERT' | 'INFO' | 'WARNING' | 'SUCCESS';
  category: 'CROP_HEALTH' | 'ROVER' | 'SPRAYING' | 'SYSTEM' | 'WEATHER';
  is_read: boolean;
  created_at: string;
}

const TYPE_STYLES: Record<string, { bg: string; icon: React.ElementType; iconColor: string }> = {
  ALERT: { bg: 'bg-red-50 border-red-200', icon: AlertTriangle, iconColor: 'text-red-500' },
  WARNING: { bg: 'bg-amber-50 border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-500' },
  INFO: { bg: 'bg-blue-50 border-blue-200', icon: Info, iconColor: 'text-blue-500' },
  SUCCESS: { bg: 'bg-green-50 border-green-200', icon: CheckCheck, iconColor: 'text-green-500' },
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  CROP_HEALTH: Leaf,
  ROVER: Tractor,
  SPRAYING: Droplets,
  SYSTEM: Bell,
  WEATHER: Bell,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await api.get('/farmer/notifications');
        setNotifications(response.data || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const markRead = async (id: number) => {
    try {
      await api.patch(`/farmer/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.post('/farmer/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {
      alert('Failed to mark all as read.');
    } finally {
      setMarkingAll(false);
    }
  };

  const displayed = filter === 'UNREAD' ? notifications.filter(n => !n.is_read) : notifications;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading {TERMS.notifications.toLowerCase()}...</div>;
  }

  return (
    <div>
      <Head>
        <title>{TERMS.notifications} - Smart AgriTech</title>
        <meta name="description" content="View and manage your farm notifications and system alerts." />
      </Head>

      <div className="mb-6 sm:mb-8 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-6 w-6 sm:h-7 sm:w-7 text-agri-green flex-shrink-0" />
            {TERMS.notifications}
            {unreadCount > 0 && (
              <span className="ml-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Farm alerts, rover updates, and system messages.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={markingAll}
            className="btn-outline flex items-center gap-2 w-full sm:w-auto"
          >
            <CheckCheck className="h-4 w-4" />
            {markingAll ? 'Marking...' : 'Mark All Read'}
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex items-center gap-1 border-b border-gray-200">
        {[
          { key: 'ALL', label: `All (${notifications.length})` },
          { key: 'UNREAD', label: `Unread (${unreadCount})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              filter === tab.key
                ? 'border-agri-green text-agri-green'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Notifications"
          description="You're all caught up! New alerts from your farm will appear here."
        />
      ) : (
        <div className="space-y-3">
          {displayed.map(notif => {
            const style = TYPE_STYLES[notif.type] || TYPE_STYLES.INFO;
            const NotifIcon = style.icon;
            const CatIcon = CATEGORY_ICONS[notif.category] || Bell;

            return (
              <div
                key={notif.id}
                className={`flex gap-4 p-4 rounded-xl border transition-all ${
                  notif.is_read ? 'bg-white border-gray-100 opacity-70' : `${style.bg} border shadow-sm`
                }`}
                onClick={() => !notif.is_read && markRead(notif.id)}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`p-2 rounded-lg bg-white/70`}>
                    <NotifIcon className={`h-5 w-5 ${style.iconColor}`} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <CatIcon className="h-3.5 w-3.5 text-gray-400" />
                      <p className="font-semibold text-gray-900 text-sm">{notif.title}</p>
                      {!notif.is_read && (
                        <span className="h-2 w-2 rounded-full bg-agri-green flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(notif.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      {notif.category.replace('_', ' ')}
                    </span>
                    {!notif.is_read && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markRead(notif.id); }}
                        className="text-xs text-agri-green hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
