import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { api } from '../../services/api';
import { TERMS } from '../../constants/terminology';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import {
  Tractor, Plus, Link2, Unlink, X, Search, Battery,
  Wifi, WifiOff, Loader2, CheckCircle2, AlertCircle, Info
} from 'lucide-react';

interface Rover {
  id: string;
  rover_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  is_connected: boolean;
  rover_status: string;
  battery_pct?: number;
  spray_tank_pct?: number;
  farm_name?: string;
  farm_id?: string;
  farmer_name?: string;
  created_at?: string;
}

interface Farm {
  id: string;
  name: string;
  farmer_name?: string;
  location_name?: string;
}

export default function AdminRoversPage() {
  const [rovers, setRovers] = useState<Rover[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Register Modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerForm, setRegisterForm] = useState({ rover_id: '', name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState('');

  // Assign Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTarget, setAssignTarget] = useState<Rover | null>(null);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

  const fetchAll = async () => {
    try {
      const [roversRes, farmsRes] = await Promise.allSettled([
        api.get('/admin/rovers'),
        api.get('/admin/farms'),
      ]);
      if (roversRes.status === 'fulfilled') setRovers(roversRes.value.data || []);
      if (farmsRes.status === 'fulfilled') setFarms(farmsRes.value.data || []);
    } catch { /* */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setSubmitting(true);
    try {
      await api.post('/admin/rovers', {
        rover_id: registerForm.rover_id.trim().toUpperCase(),
        name: registerForm.name.trim() || undefined,
        description: registerForm.description.trim() || undefined,
      });
      setShowRegisterModal(false);
      setRegisterForm({ rover_id: '', name: '', description: '' });
      await fetchAll();
    } catch (err: any) {
      setRegisterError(err.response?.data?.detail || 'Failed to register rover.');
    } finally {
      setSubmitting(false);
    }
  };

  const openAssign = (rover: Rover) => {
    setAssignTarget(rover);
    setSelectedFarmId(rover.farm_id || '');
    setAssignError('');
    setAssignSuccess('');
    setShowAssignModal(true);
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTarget) return;
    setAssignError('');
    setAssignSuccess('');
    setAssigning(true);
    try {
      await api.post('/admin/assign-rover', {
        rover_id: assignTarget.rover_id,
        farm_id: selectedFarmId,
      });
      setAssignSuccess(`Rover assigned successfully!`);
      await fetchAll();
      setTimeout(() => setShowAssignModal(false), 1200);
    } catch (err: any) {
      setAssignError(err.response?.data?.detail || 'Assignment failed.');
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async (rover: Rover) => {
    if (!confirm(`Unassign rover "${rover.rover_id}" from "${rover.farm_name}"?`)) return;
    try {
      await api.delete(`/admin/rovers/${rover.id}/unassign`);
      await fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to unassign rover.');
    }
  };

  const filtered = rovers.filter(r =>
    !search ||
    r.rover_id.toLowerCase().includes(search.toLowerCase()) ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.farm_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.farmer_name?.toLowerCase().includes(search.toLowerCase())
  );

  const assignedCount = rovers.filter(r => r.farm_name).length;
  const unassignedCount = rovers.length - assignedCount;

  return (
    <div>
      <Head>
        <title>Manage {TERMS.rover}s — Admin — Smart AgriTech</title>
        <meta name="description" content="Register rovers and assign them to farmer farms." />
      </Head>

      {/* Header */}
      <div className="mb-8 flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tractor className="h-7 w-7 text-agri-green" />
            {TERMS.rover} Fleet Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Register hardware units and assign them to farmer {TERMS.farm.toLowerCase()}s. Only admins can link rovers.
          </p>
        </div>
        <button
          id="btn-register-rover"
          onClick={() => { setRegisterForm({ rover_id: '', name: '', description: '' }); setRegisterError(''); setShowRegisterModal(true); }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          Register New {TERMS.rover}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-agri-beige p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Rovers</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{rovers.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-agri-beige p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Assigned</p>
          <p className="text-3xl font-bold text-agri-green mt-1">{assignedCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-agri-beige p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Unassigned</p>
          <p className="text-3xl font-bold text-amber-500 mt-1">{unassignedCount}</p>
        </div>
      </div>

      {/* Admin Notice */}
      <div className="mb-6 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-800 text-sm">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <span>
          <strong>Admin-only action:</strong> Farmers cannot assign rovers themselves. You must register the rover hardware ID here and assign it to the correct farm.
        </span>
      </div>

      {/* Search */}
      <div className="mb-6 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          id="search-rovers"
          type="text"
          placeholder="Search by rover ID, name, or farm..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full input pl-9"
        />
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Tractor className="h-5 w-5 text-agri-green" />
                Register New {TERMS.rover}
              </h2>
              <button onClick={() => setShowRegisterModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleRegister} className="p-6 space-y-4">
              {registerError && (
                <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {registerError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hardware ID <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-rover-hardware-id"
                  type="text"
                  value={registerForm.rover_id}
                  onChange={e => setRegisterForm(p => ({ ...p, rover_id: e.target.value }))}
                  className="w-full input uppercase"
                  placeholder="e.g. ROVER-4WD-001"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">This is the unique hardware identifier of the physical rover unit.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  id="input-rover-name"
                  type="text"
                  value={registerForm.name}
                  onChange={e => setRegisterForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full input"
                  placeholder="e.g. AgriBot Unit 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={registerForm.description}
                  onChange={e => setRegisterForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full input"
                  rows={2}
                  placeholder="Optional notes about this rover"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1" disabled={submitting}>
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Registering...</> : 'Register Rover'}
                </button>
                <button type="button" onClick={() => setShowRegisterModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && assignTarget && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Link2 className="h-5 w-5 text-agri-green" />
                Assign {assignTarget.rover_id} to Farm
              </h2>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAssign} className="p-6 space-y-4">
              {assignError && (
                <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {assignError}
                </div>
              )}
              {assignSuccess && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  {assignSuccess}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Farm <span className="text-red-500">*</span>
                </label>
                {farms.length === 0 ? (
                  <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    No farms are registered yet. Farmers must add their farm details first.
                  </p>
                ) : (
                  <select
                    id="select-assign-farm"
                    value={selectedFarmId}
                    onChange={e => setSelectedFarmId(e.target.value)}
                    className="w-full input"
                    required
                  >
                    <option value="">— Select a farm —</option>
                    {farms.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} {f.farmer_name ? `(${f.farmer_name})` : ''} {f.location_name ? `— ${f.location_name}` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={assigning || farms.length === 0 || !selectedFarmId}
                >
                  {assigning ? <><Loader2 className="h-4 w-4 animate-spin" />Assigning...</> : 'Assign Rover'}
                </button>
                <button type="button" onClick={() => setShowAssignModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rover List */}
      {loading ? (
        <div className="py-12 text-center text-gray-400 flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading {TERMS.rover.toLowerCase()}s...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Tractor}
          title={`No ${TERMS.rover}s Registered`}
          description={`Register hardware units to assign them to ${TERMS.farm.toLowerCase()}s and enable remote operation.`}
          action={{ label: `Register First ${TERMS.rover}`, onClick: () => setShowRegisterModal(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(rover => (
            <div key={rover.id} className="bg-white rounded-xl border border-agri-beige shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2.5 bg-agri-green/10 rounded-xl">
                    <Tractor className="h-6 w-6 text-agri-green" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {rover.is_connected
                      ? <Wifi className="h-4 w-4 text-green-500" />
                      : <WifiOff className="h-4 w-4 text-gray-400" />
                    }
                    <StatusBadge status={rover.rover_status || 'OFFLINE'} />
                  </div>
                </div>
                <h3 className="font-bold text-gray-900">{rover.rover_id}</h3>
                <p className="text-sm text-gray-500">{rover.name}</p>

                {rover.farm_name ? (
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 text-xs text-agri-green font-medium bg-agri-green/10 rounded-full px-2.5 py-0.5">
                      <CheckCircle2 className="h-3 w-3" />
                      {rover.farm_name}
                    </span>
                    {rover.farmer_name && (
                      <p className="text-xs text-gray-400 mt-1">Farmer: {rover.farmer_name}</p>
                    )}
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium bg-amber-50 rounded-full px-2.5 py-0.5 mt-2">
                    <AlertCircle className="h-3 w-3" />
                    Unassigned
                  </span>
                )}

                {(rover.battery_pct !== null && rover.battery_pct !== undefined) && (
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-xs text-gray-500">Battery</p>
                      <p className="font-semibold text-gray-900 text-sm flex items-center gap-1">
                        <Battery className="h-3.5 w-3.5" />
                        {rover.battery_pct}%
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-xs text-gray-500">{TERMS.sprayTank}</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {rover.spray_tank_pct !== undefined ? `${rover.spray_tank_pct}%` : '--'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50 flex items-center gap-3">
                <button
                  id={`btn-assign-rover-${rover.id}`}
                  onClick={() => openAssign(rover)}
                  className="text-sm text-agri-green hover:underline flex items-center gap-1 font-medium"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  {rover.farm_name ? 'Reassign' : 'Assign to Farm'}
                </button>
                {rover.farm_name && (
                  <button
                    onClick={() => handleUnassign(rover)}
                    className="text-sm text-red-500 hover:underline flex items-center gap-1 font-medium ml-auto"
                  >
                    <Unlink className="h-3.5 w-3.5" />
                    Unassign
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
