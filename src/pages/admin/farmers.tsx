import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { api } from '../../services/api';
import { TERMS } from '../../constants/terminology';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import { Users, Search, Ban, RotateCcw, MapPin, Phone, Mail, Calendar, CheckCircle, XCircle, Clock, UserPlus, Loader2 } from 'lucide-react';

interface Farmer {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  is_active: boolean;
  farm_name?: string;
  farm_location?: string;
  created_at: string;
  last_login?: string;
}

interface RegistrationRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  farm_name: string;
  farm_location: string;
  farm_area_hectares?: number;
  main_crops?: string;
  status: string;
  submitted_at: string;
}

export default function AdminFarmersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'farmers' | 'requests'>('farmers');
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<string>('ALL');
  const [processing, setProcessing] = useState<string | null>(null);
  const [approvalModalReq, setApprovalModalReq] = useState<RegistrationRequest | null>(null);
  const [approvalUsername, setApprovalUsername] = useState('');
  const [approvalPassword, setApprovalPassword] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [farmersRes, reqsRes] = await Promise.allSettled([
        api.get('/admin/farmers'),
        api.get('/admin/registrations')
      ]);
      if (farmersRes.status === 'fulfilled') setFarmers(farmersRes.value.data || []);
      if (reqsRes.status === 'fulfilled') setRequests(reqsRes.value.data || []);
    } catch { /* handle */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const tab = router.query.tab;
    if (tab === 'requests') {
      setActiveTab('requests');
    } else if (tab === 'farmers') {
      setActiveTab('farmers');
    }
  }, [router.query.tab]);

  useEffect(() => {
    fetchAll();
    const interval = window.setInterval(fetchAll, 15000);
    return () => window.clearInterval(interval);
  }, []);

  const toggleFarmerStatus = async (farmer: Farmer) => {
    if (!confirm(`${farmer.is_active ? 'Deactivate' : 'Activate'} account for ${farmer.full_name}?`)) return;
    setProcessing(farmer.id);
    try {
      await api.patch(`/admin/farmers/${farmer.id}`, { is_active: !farmer.is_active });
      setFarmers(prev => prev.map(f => f.id === farmer.id ? { ...f, is_active: !f.is_active } : f));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update farmer status.');
    } finally {
      setProcessing(null);
    }
  };

  const deleteFarmer = async (farmer: Farmer) => {
    if (!confirm(`Delete farmer account for ${farmer.full_name}? This action cannot be undone.`)) return;
    setProcessing(farmer.id);
    try {
      await api.delete(`/admin/farmers/${farmer.id}`);
      setFarmers(prev => prev.filter(f => f.id !== farmer.id));
      setRequests(prev => prev.filter(r => r.email !== farmer.email));
      alert(`Farmer ${farmer.full_name} deleted successfully.`);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete farmer.');
    } finally {
      setProcessing(null);
    }
  };

  const handleApproveClick = (req: RegistrationRequest) => {
    setApprovalModalReq(req);
    setApprovalUsername(req.email); // Default username is their email
    setApprovalPassword('');
  };

  const submitApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvalModalReq) return;

    setProcessing(approvalModalReq.id);
    try {
      await api.patch(`/admin/registrations/${approvalModalReq.id}/status`, { 
        status: 'APPROVED',
        assigned_username: approvalUsername || undefined,
        assigned_password: approvalPassword || undefined
      });
      await fetchAll();
      alert(`Farmer registration approved. Credentials sent to ${approvalModalReq.email}.`);
      setApprovalModalReq(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to approve request.');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectRequest = async (id: string) => {
    const reason = prompt('Please enter rejection reason:');
    if (reason === null) return;
    setProcessing(id);
    try {
      await api.patch(`/admin/registrations/${id}/status`, { 
        status: 'REJECTED',
        rejection_reason: reason || 'Application requirements not met'
      });
      await fetchAll();
      alert('Registration request rejected.');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to reject request.');
    } finally {
      setProcessing(null);
    }
  };

  const filteredFarmers = farmers.filter(f => {
    const matchesSearch = f.full_name.toLowerCase().includes(search.toLowerCase()) || 
                          f.email.toLowerCase().includes(search.toLowerCase()) ||
                          (f.farm_name && f.farm_name.toLowerCase().includes(search.toLowerCase()));
    if (!matchesSearch) return false;
    if (filterActive === 'ACTIVE') return f.is_active;
    if (filterActive === 'INACTIVE') return !f.is_active;
    return true;
  });

  const pendingRequests = requests.filter(r => r.status === 'PENDING' || r.status === 'UNDER_REVIEW');

  return (
    <div>
      <Head>
        <title>Manage {TERMS.farmer}s - Admin - Smart AgriTech</title>
        <meta name="description" content="View registered farmers and review new farmer registration applications." />
      </Head>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-7 w-7 text-agri-green" />
          {TERMS.farmer}s & Registrations Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Supervise active farmer accounts, inspect assigned farms, and review registration requests.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('farmers')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'farmers'
              ? 'border-agri-green text-agri-green'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="h-4 w-4" />
          Active {TERMS.farmer} Accounts ({farmers.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'border-agri-green text-agri-green'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserPlus className="h-4 w-4" />
          Registration Requests
          {pendingRequests.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'farmers' ? (
        <div>
          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
            <div className="relative flex-1 min-w-[240px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${TERMS.farmer.toLowerCase()}s by name, email or farm...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full input pl-9 text-sm"
              />
            </div>
            <div className="flex gap-2">
              {['ALL', 'ACTIVE', 'INACTIVE'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterActive(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    filterActive === s
                      ? 'bg-agri-green text-white border-agri-green'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-agri-green'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading farmers...</div>
          ) : filteredFarmers.length === 0 ? (
            <EmptyState
              icon={Users}
              title={`No ${TERMS.farmer}s Found`}
              description={`No farmers match your current filter criteria.`}
            />
          ) : (
            <div className="bg-white rounded-xl border border-agri-beige overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3 text-left">{TERMS.farmer}</th>
                      <th className="px-6 py-3 text-left">Contact</th>
                      <th className="px-6 py-3 text-left">Assigned {TERMS.farm}</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Joined</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {filteredFarmers.map(f => (
                      <tr key={f.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{f.full_name}</div>
                          <div className="text-xs text-gray-500">{f.email}</div>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-600">{f.phone || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-800">{f.farm_name || 'None'}</div>
                          <div className="text-xs text-gray-400">{f.farm_location || ''}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            f.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {f.is_active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {f.created_at ? new Date(f.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => toggleFarmerStatus(f)}
                              disabled={processing === f.id}
                              className={`text-xs font-medium px-3 py-1 rounded border transition-colors ${
                                f.is_active 
                                  ? 'text-red-600 border-red-200 hover:bg-red-50' 
                                  : 'text-green-600 border-green-200 hover:bg-green-50'
                              }`}
                            >
                              {processing === f.id ? 'Updating...' : f.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => deleteFarmer(f)}
                              disabled={processing === f.id}
                              className="text-xs font-medium px-3 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                            >
                              {processing === f.id ? 'Processing...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Requests Tab */}
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading registration requests...</div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-agri-beige">
              <CheckCircle className="h-12 w-12 mx-auto text-agri-green mb-3 opacity-80" />
              <h3 className="text-lg font-semibold text-gray-800">No Pending Applications</h3>
              <p className="text-sm text-gray-500 mt-1">All farmer registration applications have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(req => (
                <div key={req.id} className="bg-white rounded-xl border border-agri-beige p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-base">{req.full_name}</h3>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        req.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        req.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 space-y-0.5">
                      <div><span className="font-medium text-gray-700">Email:</span> {req.email} • <span className="font-medium text-gray-700">Phone:</span> {req.phone}</div>
                      <div><span className="font-medium text-gray-700">Farm:</span> {req.farm_name} ({req.farm_location}) • {req.farm_area_hectares || 0} ha</div>
                      {req.main_crops && <div><span className="font-medium text-gray-700">Main Crops:</span> {req.main_crops}</div>}
                      <div className="text-gray-400 text-[11px] mt-1">Submitted on {new Date(req.submitted_at).toLocaleString()}</div>
                    </div>
                  </div>

                  {req.status === 'PENDING' && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveClick(req)}
                        disabled={processing === req.id}
                        className="btn-primary text-xs py-2 px-4 flex items-center gap-1"
                      >
                        <CheckCircle className="h-4 w-4" /> Approve & Create
                      </button>
                      <button
                        onClick={() => handleRejectRequest(req.id)}
                        disabled={processing === req.id}
                        className="btn-outline text-red-600 border-red-200 hover:bg-red-50 text-xs py-2 px-3 flex items-center gap-1"
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Approval Modal */}
      {approvalModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Approve Farmer Registration</h3>
              <button onClick={() => setApprovalModalReq(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitApproval} className="p-6 space-y-4">
              <p className="text-sm text-gray-600 mb-2">
                Assign credentials for <strong>{approvalModalReq.full_name}</strong>. These will be sent via SMS/Email automatically.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={approvalUsername}
                  onChange={e => setApprovalUsername(e.target.value)}
                  className="w-full input-field"
                  placeholder="e.g. john_farmer (or leave as email)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="text"
                  required
                  value={approvalPassword}
                  onChange={e => setApprovalPassword(e.target.value)}
                  className="w-full input-field"
                  placeholder="Assign a secure password..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
                <button type="button" onClick={() => setApprovalModalReq(null)} className="btn-outline">Cancel</button>
                <button type="submit" disabled={processing !== null} className="btn-primary flex items-center gap-2">
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Approve & Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
