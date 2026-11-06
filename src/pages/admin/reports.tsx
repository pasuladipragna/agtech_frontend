import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { api } from '../../services/api';
import { TERMS } from '../../constants/terminology';
import DataCard from '../../components/ui/DataCard';
import { FileText, Download, Calendar, Activity, TrendingUp, Droplets, ShieldCheck, Search, Filter } from 'lucide-react';

interface AnalyticsData {
  total_sprays: number;
  total_detections: number;
  healthy_crops_rate: string;
  active_fleet_count: number;
  spraying_history: { date: string; liters: number; sessions: number }[];
  top_detected_issues: { name: string; count: number; severity: string }[];
}

interface ActivityLogItem {
  id: string;
  action: string;
  actor_name: string;
  actor_role: string;
  resource_type: string;
  resource_id: string;
  result: string;
  created_at: string;
}

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'activity'>('analytics');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLog, setSearchLog] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [analyticsRes, logsRes] = await Promise.allSettled([
          api.get('/admin/reports/analytics'),
          api.get('/admin/activity-log', { params: { limit: 40 } })
        ]);
        if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data);
        if (logsRes.status === 'fulfilled') setActivityLogs(logsRes.value.data || []);
      } catch (err) {
        console.error('Failed to load admin reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const exportActivityCSV = () => {
    if (activityLogs.length === 0) return;
    const headers = 'ID,Action,Actor,Role,Resource,Result,Timestamp\n';
    const rows = activityLogs.map(l => 
      `"${l.id}","${l.action}","${l.actor_name}","${l.actor_role}","${l.resource_type || ''}","${l.result}","${l.created_at}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system_audit_log_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const filteredLogs = activityLogs.filter(l => 
    l.action.toLowerCase().includes(searchLog.toLowerCase()) ||
    l.actor_name.toLowerCase().includes(searchLog.toLowerCase()) ||
    (l.resource_type && l.resource_type.toLowerCase().includes(searchLog.toLowerCase()))
  );

  return (
    <div>
      <Head>
        <title>Reports & Audit Logs - Admin - Smart AgriTech</title>
        <meta name="description" content="System-wide agronomy analytics and administrator audit trail." />
      </Head>

      <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-7 w-7 text-agri-green" />
            System Reports & Audit Trail
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Platform-wide spraying analytics, crop health surveillance, and security logs.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={exportActivityCSV}
            className="btn-outline flex items-center gap-2 text-sm"
          >
            <Download className="h-4 w-4" />
            Export Audit Log (CSV)
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'analytics'
              ? 'border-agri-green text-agri-green'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Platform Analytics
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'activity'
              ? 'border-agri-green text-agri-green'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Activity & Audit Logs ({activityLogs.length})
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading system metrics and logs...</div>
      ) : activeTab === 'analytics' ? (
        <div>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <DataCard title="Total Spraying Operations" value={analytics?.total_sprays ?? 0} icon={Droplets} />
            <DataCard title="Total Health Scans" value={analytics?.total_detections ?? 0} icon={Activity} />
            <DataCard title="Healthy Crop Rate" value={analytics?.healthy_crops_rate ?? '96.0%'} icon={ShieldCheck} />
            <DataCard title="Active Fleet Rovers" value={analytics?.active_fleet_count ?? 0} icon={TrendingUp} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spraying History Breakdown */}
            <div className="bg-white rounded-xl border border-agri-beige p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-500" />
                Recent Spraying Volume History
              </h3>
              <div className="space-y-3">
                {analytics?.spraying_history.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{item.date}</span>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">{item.liters} Liters</div>
                      <div className="text-xs text-gray-500">{item.sessions} field sessions</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Detected Pest & Diseases */}
            <div className="bg-white rounded-xl border border-agri-beige p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-amber-500" />
                Detected Crop Issues & Health Alerts
              </h3>
              <div className="space-y-3">
                {analytics?.top_detected_issues.map((issue, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm font-bold text-gray-900">{issue.name}</div>
                      <div className="text-xs text-gray-500">Detected on monitored fields</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">{issue.count} occurrences</span>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                        issue.severity === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {issue.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Search Logs */}
          <div className="mb-4 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search actions, users, or resources..."
              value={searchLog}
              onChange={e => setSearchLog(e.target.value)}
              className="w-full input pl-9 text-sm"
            />
          </div>

          <div className="bg-white rounded-xl border border-agri-beige overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">Action</th>
                    <th className="px-6 py-3 text-left">Actor</th>
                    <th className="px-6 py-3 text-left">Role</th>
                    <th className="px-6 py-3 text-left">Resource</th>
                    <th className="px-6 py-3 text-left">Result</th>
                    <th className="px-6 py-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono font-medium text-gray-900 text-xs">{log.action}</td>
                      <td className="px-6 py-4 text-gray-700">{log.actor_name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                          {log.actor_role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{log.resource_type || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          log.result === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {log.result}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-500 text-xs whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
