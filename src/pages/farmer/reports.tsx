import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { api } from '../../services/api';
import { TERMS } from '../../constants/terminology';
import EmptyState from '../../components/ui/EmptyState';
import { FileText, Download, Calendar, Loader2, BarChart3, TrendingUp } from 'lucide-react';

interface Report {
  id: number;
  title: string;
  type: 'FARM_SUMMARY' | 'CROP_HEALTH' | 'SPRAYING' | 'ROVER_ACTIVITY' | 'CUSTOM';
  period_start: string;
  period_end: string;
  generated_at: string;
  status: 'READY' | 'GENERATING' | 'FAILED';
  download_url?: string;
  summary?: Record<string, any>;
}

const REPORT_TYPES: { value: string; label: string; description: string }[] = [
  { value: 'FARM_SUMMARY', label: 'Farm Summary', description: 'Overall farm performance overview' },
  { value: 'CROP_HEALTH', label: `${TERMS.cropHealth} Report`, description: 'Health alerts, detected problems, trend analysis' },
  { value: 'SPRAYING', label: `${TERMS.spraying} Log`, description: 'All spray sessions, products used, area covered' },
  { value: 'ROVER_ACTIVITY', label: `${TERMS.rover} Activity`, description: 'Rover movement logs, battery cycles, commands' },
];

const TYPE_CONFIG: Record<string, { color: string; icon: React.ElementType }> = {
  FARM_SUMMARY: { color: 'bg-green-100 text-green-800', icon: BarChart3 },
  CROP_HEALTH: { color: 'bg-amber-100 text-amber-800', icon: TrendingUp },
  SPRAYING: { color: 'bg-blue-100 text-blue-800', icon: FileText },
  ROVER_ACTIVITY: { color: 'bg-purple-100 text-purple-800', icon: FileText },
  CUSTOM: { color: 'bg-gray-100 text-gray-800', icon: FileText },
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'FARM_SUMMARY',
    period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    period_end: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/farmer/reports');
        setReports(response.data || []);
      } catch {
        // Non-critical failure — page still useful for generating new reports
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const generateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const response = await api.post('/farmer/reports/generate', formData);
      setReports(prev => [response.data, ...prev]);
      setShowForm(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to generate report.');
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = async (report: Report) => {
    if (report.download_url) {
      window.open(report.download_url, '_blank');
      return;
    }
    try {
      const response = await api.get(`/farmer/reports/${report.id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.title.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Failed to download report.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-agri-green" />
        Loading reports...
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>{TERMS.reports} - Smart AgriTech</title>
        <meta name="description" content="Generate and download farm reports covering crop health, spraying operations, and rover activity." />
      </Head>

      <div className="mb-8 flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-7 w-7 text-agri-green" />
            {TERMS.reports}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Generate and download detailed reports for your {TERMS.farm.toLowerCase()} operations.
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary" disabled={showForm}>
          <FileText className="h-4 w-4" />
          Generate Report
        </button>
      </div>

      {/* Generate Form */}
      {showForm && (
        <div className="mb-8 bg-white rounded-xl border border-agri-beige shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Generate New Report</h2>
          <form onSubmit={generateReport} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {REPORT_TYPES.map(rt => (
                  <label
                    key={rt.value}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.type === rt.value
                        ? 'border-agri-green bg-green-50 ring-1 ring-agri-green'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={rt.value}
                      checked={formData.type === rt.value}
                      onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}
                      className="mt-1 text-agri-green"
                    />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{rt.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{rt.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period Start</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.period_start}
                    onChange={e => setFormData(p => ({ ...p, period_start: e.target.value }))}
                    className="w-full input pl-9"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period End</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.period_end}
                    onChange={e => setFormData(p => ({ ...p, period_end: e.target.value }))}
                    className="w-full input pl-9"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={generating}>
                {generating ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
                ) : (
                  <><FileText className="h-4 w-4" />Generate</>
                )}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reports List */}
      {reports.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={`No ${TERMS.reports} Yet`}
          description="Generate your first report to get a detailed view of your farm operations."
          action={{ label: 'Generate First Report', onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-agri-beige shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {reports.map(report => {
              const config = TYPE_CONFIG[report.type] || TYPE_CONFIG.CUSTOM;
              const IconComp = config.icon;
              return (
                <div key={report.id} className="px-6 py-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-agri-green/10 rounded-lg">
                      <IconComp className="h-5 w-5 text-agri-green" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{report.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.color}`}>
                          {report.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(report.period_start).toLocaleDateString()} – {new Date(report.period_end).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-xs text-gray-400 hidden sm:block">
                      Generated {new Date(report.generated_at).toLocaleDateString()}
                    </p>
                    {report.status === 'GENERATING' ? (
                      <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Generating...
                      </span>
                    ) : report.status === 'READY' ? (
                      <button
                        onClick={() => downloadReport(report)}
                        className="btn-outline btn-sm flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </button>
                    ) : (
                      <span className="text-xs text-red-500 font-medium">Failed</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
