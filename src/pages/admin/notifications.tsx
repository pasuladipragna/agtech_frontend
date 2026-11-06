import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { api } from '../../services/api';
import { Bell, Send, CheckCircle2, AlertTriangle, Info, Radio, Loader2 } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  created_at: string;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState<'ALL' | 'FARMER'>('ALL');
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await api.post('/admin/notifications/broadcast', {
        title,
        message,
        target_role: targetRole,
      });
      setSuccessMsg(res.data.message || 'Broadcast message sent successfully.');
      setTitle('');
      setMessage('');
      fetchNotifications();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to send broadcast.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <Head>
        <title>Notifications & Broadcasts - Admin - Smart AgriTech</title>
        <meta name="description" content="Send system-wide broadcasts and monitor alerts across the platform." />
      </Head>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="h-7 w-7 text-agri-green" />
          Broadcast Center & Alerts
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Dispatch critical weather advisories, platform maintenance notes, and agronomy alerts to farmers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Broadcast Sender Form */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-agri-beige p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Radio className="h-5 w-5 text-agri-green" />
            New Broadcast Announcement
          </h2>

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2 border border-green-200">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2 border border-red-200">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
              <select
                value={targetRole}
                onChange={e => setTargetRole(e.target.value as any)}
                className="input-field"
              >
                <option value="ALL">All Active Users</option>
                <option value="FARMER">Farmers Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alert Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Severe Wind Advisory for Spraying"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message Content *</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Provide detailed instructions or notice to users..."
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full btn-primary flex justify-center items-center gap-2"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send Broadcast
            </button>
          </form>
        </div>

        {/* Recent System Alerts Log */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-agri-beige p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Recent Notification Stream
          </h2>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading alerts stream...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
              No recent notifications generated.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {notifications.map(notif => (
                <div key={notif.id} className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{notif.title}</h4>
                    <span className="text-xs text-gray-400">
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{notif.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
