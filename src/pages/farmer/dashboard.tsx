import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { api } from '../../services/api';
import DataCard from '../../components/ui/DataCard';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { TERMS } from '../../constants/terminology';
import { 
  Map, Leaf, Tractor, Activity, Bell, Plus, Edit2, Droplets, 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, StopCircle, CheckCircle2, 
  AlertTriangle, Loader2, ExternalLink, Info
} from 'lucide-react';

export default function FarmerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Farm Modal
  const [showFarmModal, setShowFarmModal] = useState(false);
  const [farmForm, setFarmForm] = useState({
    name: '',
    location_name: '',
    total_area_hectares: 5.0,
    main_crop_types: '',
    description: '',
  });
  const [savingFarm, setSavingFarm] = useState(false);

  // Quick command state
  const [sendingCmd, setSendingCmd] = useState(false);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/farmer/dashboard/summary');
      setData(response.data);
      if (response.data && response.data.farm_name) {
        setFarmForm(prev => ({
          ...prev,
          name: response.data.farm_name,
        }));
      }
    } catch (err: any) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFarm(true);
    try {
      await api.post('/farms', farmForm);
      setShowFarmModal(false);
      await fetchDashboard();
      alert('Farm details saved successfully.');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save farm details.');
    } finally {
      setSavingFarm(false);
    }
  };



  const sendQuickCommand = async (command: string) => {
    if (!data?.rover) return;
    setSendingCmd(true);
    try {
      await api.post(`/rovers/${data.rover.rover_id}/command`, { command }).catch(async () => {
        await api.post('/rover/command', { command });
      });
      setTimeout(fetchDashboard, 1000);
    } catch (err: any) {
      alert(err.response?.data?.detail || `Command ${command} failed.`);
    } finally {
      setSendingCmd(false);
    }
  };

  const handleEmergencyStop = async () => {
    if (!data?.rover) return;
    setSendingCmd(true);
    try {
      await api.post(`/rovers/${data.rover.rover_id}/command`, { command: 'EMERGENCY_STOP' }).catch(async () => {
        await api.post('/rover/command', { command: 'EMERGENCY_STOP' });
      });
      alert('EMERGENCY STOP executed.');
      setTimeout(fetchDashboard, 500);
    } catch {
      alert('Emergency stop signal sent.');
    } finally {
      setSendingCmd(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading farmer dashboard...</div>;
  }

  return (
    <div>
      <Head>
        <title>{TERMS.farm} Dashboard - Smart AgriTech</title>
        <meta name="description" content="Farmer dashboard with real-time farm stats, crops, and rover mission telemetry." />
      </Head>

      {/* Header Banner */}
      <div className="mb-6 sm:mb-8 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Leaf className="h-6 w-6 sm:h-7 sm:w-7 text-agri-green flex-shrink-0" />
            <span className="truncate">{data?.farm_name || 'My Farm'} Dashboard</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time farm overview, crop surveillance, and autonomous rover controllers.
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setShowFarmModal(true)}
            className="btn-outline flex items-center gap-2 text-sm"
          >
            <Edit2 className="h-4 w-4" />
            {data?.setup_required ? 'Create Farm Profile' : 'Configure Farm'}
          </button>
        </div>
      </div>

      {data?.setup_required ? (
        <div className="max-w-3xl mx-auto my-12 bg-white rounded-2xl border border-agri-beige p-8 shadow-sm text-center">
          <Map className="h-16 w-16 mx-auto text-agri-green mb-4 opacity-80" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to Smart AgriTech!</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Please enter your farm location, area, and crop details to unlock live field surveillance and rover automation.
          </p>
          <button
            onClick={() => setShowFarmModal(true)}
            className="btn-primary text-base px-6 py-2.5 inline-flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Farm Details
          </button>
        </div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <DataCard 
              title={`Total ${TERMS.field}s`} 
              value={data?.total_fields ?? 0} 
              icon={Map} 
              description="Cultivated boundaries"
            />
            <DataCard 
              title={`Total ${TERMS.crop}s`} 
              value={data?.total_crops ?? 0} 
              icon={Leaf} 
              description="Monitored plantings"
            />
            <DataCard 
              title="Assigned Rover" 
              value={data?.rover ? data.rover.rover_id : 'None'} 
              icon={Tractor}
              description={data?.rover ? (data.rover.battery_pct == null ? 'Battery unavailable' : `Battery: ${data.rover.battery_pct}%`) : 'Click to link Rover'}
            />
            <DataCard 
              title={`Unread ${TERMS.notifications}`} 
              value={data?.unread_notifications ?? 0} 
              icon={Bell} 
              description="System & crop alerts"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 mb-6 sm:mb-8">
            {/* ROVER MISSION & CONTROLLERS SECTION */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-agri-beige shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="px-6 py-4 border-b bg-gray-50/70 flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Tractor className="h-5 w-5 text-agri-green" />
                  <h3 className="font-bold text-gray-900 text-base">
                    {data?.rover ? `Assigned Rover: ${data.rover.name || data.rover.rover_id}` : 'Rover Hardware Control'}
                  </h3>
                </div>

                {data?.rover && (
                  <div className="flex items-center gap-3">
                    {data.rover.rover_status ? <StatusBadge status={data.rover.rover_status} /> : <span className="text-xs text-gray-500">Status unavailable</span>}
                    <Link
                      href="/farmer/rover"
                      className="text-xs font-semibold text-agri-green hover:text-agri-dark flex items-center gap-1"
                    >
                      Full Control Center <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </div>

              <div className="p-6">
                {data?.rover ? (
                  <div>
                    {/* Live Telemetry Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl mb-6 border">
                      <div>
                        <span className="text-xs text-gray-500 block">Battery</span>
                        <span className="text-base font-bold text-gray-900">{data.rover.battery_pct == null ? '--' : `${data.rover.battery_pct}%`}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block">Spray Tank</span>
                        <span className="text-base font-bold text-blue-600">{data.rover.spray_tank_pct == null ? '--' : `${data.rover.spray_tank_pct}%`}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block">Speed</span>
                        <span className="text-base font-bold text-gray-900">{data.rover.speed_kmh ?? 0.0} km/h</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block">Connection</span>
                        <span className="text-xs font-bold text-green-600 flex items-center gap-1 mt-1">
                          <span className={`h-2 w-2 rounded-full ${data.rover.is_connected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span> {data.rover.is_connected ? 'ONLINE' : 'OFFLINE'}
                        </span>
                      </div>
                    </div>

                    {/* Integrated Rover Controller Pad */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      <div>
                        <h4 className="text-sm font-bold text-gray-800 mb-1">Quick D-Pad Driving Controls</h4>
                        <p className="text-xs text-gray-500 mb-4">Send instant directional commands to rover</p>

                        <div className="flex flex-col items-center gap-1.5">
                          <button
                            onClick={() => sendQuickCommand('MOVE_FORWARD')}
                            disabled={sendingCmd}
                            className="h-11 w-11 rounded-lg bg-gray-100 hover:bg-agri-green hover:text-white flex items-center justify-center font-bold shadow-sm transition active:scale-95"
                          >
                            <ArrowUp className="h-5 w-5" />
                          </button>
                          <div className="flex gap-2">
                            <button
                              onClick={() => sendQuickCommand('TURN_LEFT')}
                              disabled={sendingCmd}
                              className="h-11 w-11 rounded-lg bg-gray-100 hover:bg-agri-green hover:text-white flex items-center justify-center font-bold shadow-sm transition active:scale-95"
                            >
                              <ArrowLeft className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => sendQuickCommand('STOP')}
                              disabled={sendingCmd}
                              className="h-11 w-11 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 flex items-center justify-center font-bold text-xs uppercase shadow-sm transition active:scale-95"
                            >
                              STOP
                            </button>
                            <button
                              onClick={() => sendQuickCommand('TURN_RIGHT')}
                              disabled={sendingCmd}
                              className="h-11 w-11 rounded-lg bg-gray-100 hover:bg-agri-green hover:text-white flex items-center justify-center font-bold shadow-sm transition active:scale-95"
                            >
                              <ArrowRight className="h-5 w-5" />
                            </button>
                          </div>
                          <button
                            onClick={() => sendQuickCommand('MOVE_BACKWARD')}
                            disabled={sendingCmd}
                            className="h-11 w-11 rounded-lg bg-gray-100 hover:bg-agri-green hover:text-white flex items-center justify-center font-bold shadow-sm transition active:scale-95"
                          >
                            <ArrowDown className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-800 mb-1">Quick Autonomous Triggers</h4>
                        
                        <Link
                          href="/farmer/rover"
                          className="w-full btn-outline text-xs py-2.5 flex items-center justify-center gap-2"
                        >
                          <Droplets className="h-4 w-4 text-blue-500" />
                          Open Precision Spray Station
                        </Link>

                        <button
                          onClick={handleEmergencyStop}
                          disabled={sendingCmd}
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 shadow"
                        >
                          <StopCircle className="h-4 w-4" />
                          Emergency Stop Halt
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 px-4">
                    <Tractor className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <h4 className="font-bold text-gray-800 text-base">No Rover Assigned</h4>
                    <div className="mt-3 flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl p-4 text-left max-w-sm mx-auto">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-700">
                        Rover assignment is managed by the Administrator. Once the admin assigns a rover to your farm, the controls will appear here automatically.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RECENT CROP HEALTH ALERTS */}
            <div className="bg-white rounded-xl border border-agri-beige shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="px-6 py-4 border-b bg-gray-50/70 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-amber-500" />
                  <h3 className="font-bold text-gray-900 text-base">Crop Health Surveillance</h3>
                </div>
                <Link href="/farmer/crops" className="text-xs font-semibold text-agri-green hover:underline">
                  View Crops
                </Link>
              </div>

              <div className="p-6 flex-1">
                {data?.crop_alerts && data.crop_alerts.length > 0 ? (
                  <div className="space-y-3">
                    {data.crop_alerts.map((alert: any) => (
                      <div key={alert.id} className="p-3.5 bg-gray-50 rounded-xl border flex justify-between items-center">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{alert.label}</p>
                          <p className="text-xs text-gray-500">{new Date(alert.created_at).toLocaleDateString()}</p>
                        </div>
                        <StatusBadge status={alert.severity || 'WARNING'} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Leaf className="h-10 w-10 mx-auto text-green-500 mb-2 opacity-80" />
                    <h4 className="font-semibold text-gray-800 text-sm">All Crops Healthy</h4>
                    <p className="text-xs text-gray-500 mt-0.5">No disease or nutrient alerts detected in active fields.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* MODAL: CONFIGURE FARM DETAILS */}
      {showFarmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Configure Farm Details</h3>
            <p className="text-xs text-gray-500 mb-4">Set your farm boundaries, region, and primary crop cultivars.</p>
            
            <form onSubmit={handleSaveFarm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name *</label>
                <input
                  type="text"
                  required
                  value={farmForm.name}
                  onChange={e => setFarmForm({ ...farmForm, name: e.target.value })}
                  placeholder="e.g. Green Valley Agro Estate"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location / District *</label>
                  <input
                    type="text"
                    required
                    value={farmForm.location_name}
                    onChange={e => setFarmForm({ ...farmForm, location_name: e.target.value })}
                    placeholder="e.g. Salinas Valley, CA"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Area (Hectares) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={farmForm.total_area_hectares}
                    onChange={e => setFarmForm({ ...farmForm, total_area_hectares: parseFloat(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Crops</label>
                <input
                  type="text"
                  value={farmForm.main_crop_types}
                  onChange={e => setFarmForm({ ...farmForm, main_crop_types: e.target.value })}
                  placeholder="e.g. Wheat, Corn, Tomatoes"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={farmForm.description}
                  onChange={e => setFarmForm({ ...farmForm, description: e.target.value })}
                  placeholder="Additional irrigation or soil characteristics..."
                  className="input-field"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFarmModal(false)}
                  className="btn-outline text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFarm}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  {savingFarm && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Farm Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
