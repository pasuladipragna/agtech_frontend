import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { api } from '../../services/api';
import { TERMS } from '../../constants/terminology';
import DataCard from '../../components/ui/DataCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { Users, Map, Tractor, ShieldCheck, Activity, Clock, CheckCircle, XCircle } from 'lucide-react';

interface AdminStats {
  total_farmers: number;
  total_farms: number;
  total_rovers: number;
  pending_registrations: number;
  active_rovers: number;
  alerts_today: number;
  spraying_sessions_today: number;
}

interface PendingRegistration {
  id: number;
  farmer_name: string;
  email: string;
  district: string;
  created_at: string;
}

interface RecentActivity {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  type: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pending, setPending] = useState<PendingRegistration[]>([]);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, pendingRes, activityRes] = await Promise.allSettled([
          api.get('/admin/dashboard/summary'),
          api.get('/admin/registrations', { params: { status: 'PENDING', limit: 5 } }),
          api.get('/admin/activity-log', { params: { limit: 8 } }),
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (pendingRes.status === 'fulfilled') setPending(pendingRes.value.data || []);
        if (activityRes.status === 'fulfilled') setActivity(activityRes.value.data || []);
      } catch { /* non-critical */ }
      finally { setLoading(false); }
    };

    fetchAll();
    const interval = window.setInterval(fetchAll, 15000);
    return () => window.clearInterval(interval);
  }, []);

  const approveRegistration = async (id: number) => {
    try {
      await api.post(`/admin/registrations/${id}/approve`);
      setPending(prev => prev.filter(r => r.id !== id));
      setStats(prev => prev ? { ...prev, pending_registrations: prev.pending_registrations - 1, total_farmers: prev.total_farmers + 1 } : prev);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to approve registration.');
    }
  };

  const rejectRegistration = async (id: number) => {
    if (!confirm('Reject this registration request?')) return;
    try {
      await api.post(`/admin/registrations/${id}/reject`);
      setPending(prev => prev.filter(r => r.id !== id));
      setStats(prev => prev ? { ...prev, pending_registrations: prev.pending_registrations - 1 } : prev);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to reject registration.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading administration dashboard...</div>;
  }

  return (
    <div>
      <Head>
        <title>Admin Dashboard - Smart AgriTech</title>
        <meta name="description" content="Smart AgriTech administrator dashboard — system overview, pending registrations, and activity." />
      </Head>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Administration Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">System overview and pending actions.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <DataCard title={`Total ${TERMS.farmer}s`} value={stats?.total_farmers ?? '--'} icon={Users} />
        <DataCard title={`Total ${TERMS.farm}s`} value={stats?.total_farms ?? '--'} icon={Map} />
        <DataCard title={`Total ${TERMS.rover}s`} value={stats?.total_rovers ?? '--'} icon={Tractor} />
        <DataCard
          title={`Pending ${TERMS.registrationRequest}s`}
          value={stats?.pending_registrations ?? '--'}
          icon={ShieldCheck}
          description={stats?.pending_registrations ? 'Requires review' : 'None pending'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Registrations */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-agri-beige shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-agri-green" />
              Pending {TERMS.registrationRequest}s
            </h3>
            <Link href="/admin/registrations" className="text-xs text-agri-green hover:underline">
              View All →
            </Link>
          </div>
          {pending.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <CheckCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No pending registration requests.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {pending.map(reg => (
                <div key={reg.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                  <Link href="/admin/farmers?tab=requests" className="flex-1 min-w-0 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{reg.farmer_name}</p>
                      <p className="text-xs text-gray-500">{reg.email} · {reg.district}</p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(reg.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => approveRegistration(reg.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-800 hover:bg-green-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      <CheckCircle className="h-3 w-3" /> {TERMS.approve}
                    </button>
                    <button
                      onClick={() => rejectRegistration(reg.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-800 hover:bg-red-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      <XCircle className="h-3 w-3" /> {TERMS.reject}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-agri-beige shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-agri-green" />
              Recent Activity
            </h3>
            <Link href="/admin/activity-log" className="text-xs text-agri-green hover:underline">
              View All →
            </Link>
          </div>
          {activity.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No recent activity.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {activity.map(item => (
                <div key={item.id} className="px-5 py-3">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.action}</p>
                  <div className="flex justify-between mt-0.5">
                    <p className="text-xs text-gray-500 truncate">{item.user}</p>
                    <p className="text-xs text-gray-400 flex-shrink-0">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Admin Links */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: `Manage ${TERMS.farmer}s`, href: '/admin/farmers', icon: Users },
          { label: `Manage ${TERMS.rover}s`, href: '/admin/rovers', icon: Tractor },
          { label: 'Spray Products', href: '/admin/products', icon: Activity },
          { label: 'Activity Log', href: '/admin/activity-log', icon: Activity },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white border border-agri-beige rounded-xl p-5 flex items-center gap-3 hover:border-agri-green hover:shadow-md transition-all group"
          >
            <div className="p-2 bg-agri-green/10 rounded-lg group-hover:bg-agri-green/20 transition-colors">
              <link.icon className="h-5 w-5 text-agri-green" />
            </div>
            <span className="text-sm font-medium text-gray-700">{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
