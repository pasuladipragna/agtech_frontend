import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { api } from '../../services/api';
import { TERMS } from '../../constants/terminology';
import EmptyState from '../../components/ui/EmptyState';
import DataCard from '../../components/ui/DataCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { 
  Tractor, Video, AlertTriangle, Battery, Navigation, Crosshair, StopCircle,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Pause, RotateCcw, Droplets,
  Sliders, ShieldAlert, Sparkles, CheckCircle2, Eye, Compass
} from 'lucide-react';

export default function RoverPage() {
  const [roverData, setRoverData] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sendingCommand, setSendingCommand] = useState(false);
  const [lastAction, setLastAction] = useState('');

  // Spray station states
  const [pumpOn, setPumpOn] = useState(false);
  const [solenoidOpen, setSolenoidOpen] = useState(false);
  const [sprayHeightCm, setSprayHeightCm] = useState(45);
  const [nozzleAngle, setNozzleAngle] = useState(30);
  const [activeTab, setActiveTab] = useState<'control' | 'spraying' | 'detection'>('control');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [detectionResult, setDetectionResult] = useState<any>(null);
  const [laneTestResult, setLaneTestResult] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const startLaptopCamera = async () => {
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Laptop camera access is unavailable in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      setCameraError('Camera permission was denied or no laptop camera was found.');
    }
  };

  const stopLaptopCamera = () => {
    cameraStreamRef.current?.getTracks().forEach(track => track.stop());
    cameraStreamRef.current = null;
    setCameraActive(false);
  };

  const captureLaptopFrame = (): Promise<Blob | null> => new Promise(resolve => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth) {
      resolve(null);
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob(resolve, 'image/jpeg', 0.9);
  });

  const analyzeLaptopFrame = async () => {
    const frame = await captureLaptopFrame();
    if (!frame) {
      setCameraError('Start the laptop camera and wait for a frame before capturing.');
      return;
    }
    const payload = new FormData();
    payload.append('file', frame, 'laptop-camera.jpg');
    if (selectedFieldId) payload.append('field_id', selectedFieldId);
    try {
      const response = await api.post('/crop-health/analyze-image', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDetectionResult(response.data);
    } catch (err: any) {
      setCameraError(err.response?.data?.detail || 'Disease detection failed.');
    }
  };

  const runLaneCameraTest = async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth) {
      setCameraError('Start the laptop camera and wait for a frame before testing lane detection.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(video, 0, 0);
    const image = context.getImageData(0, Math.floor(canvas.height * 0.55), canvas.width, Math.floor(canvas.height * 0.45));
    const brightColumns: number[] = [];
    for (let x = 0; x < image.width; x += 4) {
      let brightPixels = 0;
      for (let y = 0; y < image.height; y += 4) {
        const index = (y * image.width + x) * 4;
        const brightness = (image.data[index] + image.data[index + 1] + image.data[index + 2]) / 3;
        if (brightness > 175) brightPixels += 1;
      }
      if (brightPixels >= 2) brightColumns.push(x);
    }
    const midpoint = image.width / 2;
    const leftBoundary = brightColumns.some(x => x < midpoint * 0.8);
    const rightBoundary = brightColumns.some(x => x > midpoint * 1.2);
    setLaneTestResult(
      leftBoundary && rightBoundary
        ? 'Laptop-camera test detected two bright lane boundaries.'
        : 'Laptop-camera frame captured, but two lane boundaries were not detected.'
    );
  };

  const fetchRoverAndFields = async () => {
    try {
      const [roverRes, fieldsRes] = await Promise.allSettled([
        api.get('/farmer/rover'),
        api.get('/fields')
      ]);

      if (roverRes.status === 'fulfilled') {
        setRoverData(roverRes.value.data);
      }
      if (fieldsRes.status === 'fulfilled' && fieldsRes.value.data) {
        setFields(fieldsRes.value.data);
        if (fieldsRes.value.data.length > 0 && !selectedFieldId) {
          setSelectedFieldId(fieldsRes.value.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load rover data:', err);
      setError('Failed to connect to rover telemetry stream.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoverAndFields();
    const interval = setInterval(fetchRoverAndFields, 5000);
    return () => {
      clearInterval(interval);
      stopLaptopCamera();
    };
  }, []);

  const sendRoverCmd = async (command: string, params: any = {}) => {
    if (!roverData) return;
    setSendingCommand(true);
    setLastAction(`Executed: ${command}`);
    try {
      await api.post(`/rovers/${roverData.rover_id}/command`, { command, params }).catch(async () => {
        // Fallback generic command router
        await api.post('/rover/command', { command, params });
      });
      setTimeout(fetchRoverAndFields, 1000);
    } catch (err: any) {
      alert(err.response?.data?.detail || `Failed to dispatch ${command}`);
    } finally {
      setSendingCommand(false);
    }
  };

  const handleEmergencyStop = async () => {
    if (!roverData) return;
    setSendingCommand(true);
    try {
      await api.post(`/rovers/${roverData.rover_id}/command`, {
        command: 'EMERGENCY_STOP',
        params: { reason: 'Operator Emergency Halt' }
      }).catch(async () => {
        await api.post('/rover/command', { command: 'EMERGENCY_STOP', params: {} });
      });
      setPumpOn(false);
      setSolenoidOpen(false);
      setLastAction('EMERGENCY STOP TRIGGERED');
      setTimeout(fetchRoverAndFields, 500);
    } catch (err: any) {
      alert('CRITICAL: Emergency stop signal failed. Check direct hardware link.');
    } finally {
      setSendingCommand(false);
    }
  };

  const handleStartSpraying = async () => {
    if (!roverData || !selectedFieldId) {
      alert('Please select a target field before starting spray session.');
      return;
    }
    setSendingCommand(true);
    try {
      await api.post(`/spraying/sessions`, {
        rover_id: roverData.rover_id,
        field_id: selectedFieldId,
        spray_height_cm: sprayHeightCm,
        nozzle_angle_deg: nozzleAngle,
        target_area_hectares: 1.5,
      });
      setPumpOn(true);
      setSolenoidOpen(true);
      setLastAction('Spraying operation initiated.');
      alert('Spraying mission dispatched to rover.');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Spraying start failed. Safety checks must pass.');
    } finally {
      setSendingCommand(false);
    }
  };

  if (loading && !roverData) {
    return <div className="p-8 text-center text-gray-500">Connecting to {TERMS.rover.toLowerCase()} telemetry...</div>;
  }

  return (
    <div>
      <Head>
        <title>{TERMS.rover} Control & Spraying - Smart AgriTech</title>
        <meta name="description" content="Manage rover manual movements, autonomous patrols, precision spraying, and crop vision detections." />
      </Head>

      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tractor className="h-7 w-7 text-agri-green" />
            {TERMS.rover} Mission Control & Spraying Station
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time hardware telemetry, manual D-pad control, autonomous field patrols, and precision spraying.
          </p>
        </div>

        {roverData && (
          <button 
            onClick={handleEmergencyStop}
            disabled={sendingCommand || !roverData.is_connected}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-lg flex items-center gap-2 transition-all transform active:scale-95"
          >
            <StopCircle className="h-6 w-6" />
            EMERGENCY STOP
          </button>
        )}
      </div>

      {lastAction && (
        <div className="mb-4 p-2.5 bg-blue-50 text-blue-800 text-xs font-mono rounded-lg border border-blue-200 flex items-center justify-between">
          <span>Status: {lastAction}</span>
          <span className="text-blue-500">{new Date().toLocaleTimeString()}</span>
        </div>
      )}

      {!roverData ? (
        <EmptyState 
          icon={Tractor}
          title={`No ${TERMS.rover} Assigned`}
          description={`Your farm is not currently linked to any active rover hardware. Contact system administrator for rover fleet assignment.`}
        />
      ) : (
        <div className="space-y-6">
          {/* Telemetry Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <DataCard 
              title="Hardware Link" 
              value={roverData.is_connected ? 'Connected' : 'Offline'} 
              icon={Navigation} 
              description={`ID: ${roverData.rover_id}`}
            />
            <DataCard
              title="Battery Charge" 
              value={roverData.battery_pct == null ? '--' : `${roverData.battery_pct}%`}
              icon={Battery} 
              description="Nominal Voltage"
            />
            <DataCard 
              title="Spray Liquid Tank" 
              value={roverData.spray_tank_pct == null ? '--' : `${roverData.spray_tank_pct}%`}
              icon={Droplets} 
              description="Capacity: 20L"
            />
            <div className="bg-white rounded-xl border border-agri-beige p-5 shadow-sm flex flex-col justify-center items-center">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</span>
              {roverData.rover_status ? <StatusBadge status={roverData.rover_status} className="text-sm px-3 py-1" /> : <span className="text-sm text-gray-500">Unavailable</span>}
            </div>
          </div>

          {/* Module Navigation Tabs */}
          <div className="flex border-b border-gray-200 gap-6">
            <button
              onClick={() => setActiveTab('control')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'control'
                  ? 'border-agri-green text-agri-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Compass className="h-4 w-4" />
              Manual & Autonomous Navigation
            </button>
            <button
              onClick={() => setActiveTab('spraying')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'spraying'
                  ? 'border-agri-green text-agri-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Droplets className="h-4 w-4" />
              Precision Spraying System
            </button>
            <button
              onClick={() => setActiveTab('detection')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'detection'
                  ? 'border-agri-green text-agri-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Eye className="h-4 w-4" />
              Vision & Disease Detection
            </button>
          </div>

          {/* TAB 1: NAVIGATION & CONTROLS */}
          {activeTab === 'control' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Live Camera Viewfinder */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-agri-beige overflow-hidden shadow-sm flex flex-col">
                <div className="px-5 py-3 border-b bg-gray-50 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                    <Video className="h-4 w-4 text-agri-green" />
                    Live Optical Feed ({roverData.name || roverData.rover_id})
                  </h3>
                  <span className={`flex items-center gap-1.5 text-xs font-semibold ${roverData.is_connected ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`h-2 w-2 rounded-full ${roverData.is_connected ? 'bg-green-500 animate-ping' : 'bg-gray-400'}`}></span>
                    {roverData.is_connected ? 'ACTIVE TELEMETRY STREAM' : 'ROVER OFFLINE'}
                  </span>
                </div>

                <div className="flex-1 bg-gray-950 min-h-[380px] relative flex items-center justify-center text-gray-400 p-4">
                  {/* Live telemetry HUD */}
                  <div className="absolute top-4 left-4 font-mono text-xs text-green-400 bg-black/60 p-2 rounded border border-green-500/30">
                    <div>SPEED: {roverData.speed_kmh == null ? '--' : `${roverData.speed_kmh} KM/H`}</div>
                    <div>LAT: {roverData.latitude == null ? '--' : roverData.latitude}</div>
                    <div>LNG: {roverData.longitude == null ? '--' : roverData.longitude}</div>
                  </div>

                  <div className="text-center">
                    <Video className="h-16 w-16 mx-auto mb-3 opacity-30 text-green-400" />
                    <p className="text-sm">{roverData.is_connected ? 'Waiting for rover camera frames' : 'Rover camera unavailable'}</p>
                    <p className="text-xs text-gray-500 mt-1">Use the laptop camera in the Vision tab for local testing.</p>
                  </div>
                </div>
              </div>

              {/* D-Pad Directional Controller */}
              <div className="bg-white rounded-xl border border-agri-beige p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <Crosshair className="h-5 w-5 text-agri-green" />
                    Manual D-Pad Override
                  </h3>
                  <p className="text-xs text-gray-500 mb-6">Real-time drive commands sent via MQTT</p>

                  {/* D-Pad Buttons */}
                  <div className="flex flex-col items-center gap-2 mb-6">
                    <button
                      onClick={() => sendRoverCmd('MOVE_FORWARD')}
                      disabled={sendingCommand || !roverData.is_connected}
                      className="h-14 w-14 rounded-xl bg-gray-100 hover:bg-agri-green hover:text-white flex items-center justify-center font-bold shadow transition-all active:scale-95"
                    >
                      <ArrowUp className="h-6 w-6" />
                    </button>
                    <div className="flex gap-4">
                      <button
                        onClick={() => sendRoverCmd('TURN_LEFT')}
                        disabled={sendingCommand || !roverData.is_connected}
                        className="h-14 w-14 rounded-xl bg-gray-100 hover:bg-agri-green hover:text-white flex items-center justify-center font-bold shadow transition-all active:scale-95"
                      >
                        <ArrowLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={() => sendRoverCmd('STOP')}
                        disabled={sendingCommand || !roverData.is_connected}
                        className="h-14 w-14 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 flex items-center justify-center font-bold shadow transition-all active:scale-95 text-xs uppercase"
                      >
                        STOP
                      </button>
                      <button
                        onClick={() => sendRoverCmd('TURN_RIGHT')}
                        disabled={sendingCommand || !roverData.is_connected}
                        className="h-14 w-14 rounded-xl bg-gray-100 hover:bg-agri-green hover:text-white flex items-center justify-center font-bold shadow transition-all active:scale-95"
                      >
                        <ArrowRight className="h-6 w-6" />
                      </button>
                    </div>
                    <button
                      onClick={() => sendRoverCmd('MOVE_BACKWARD')}
                      disabled={sendingCommand || !roverData.is_connected}
                      className="h-14 w-14 rounded-xl bg-gray-100 hover:bg-agri-green hover:text-white flex items-center justify-center font-bold shadow transition-all active:scale-95"
                    >
                      <ArrowDown className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Autonomous Mission Triggers */}
                <div className="border-t pt-4 space-y-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                    Autonomous Missions
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => sendRoverCmd('START_FIELD_TASK', { task: 'PATROL', field_id: selectedFieldId })}
                      disabled={sendingCommand || !roverData.is_connected}
                      className="btn-outline text-xs py-2 flex items-center justify-center gap-1"
                    >
                      <Play className="h-3.5 w-3.5 text-agri-green" /> Auto Patrol
                    </button>
                    <button
                      onClick={() => sendRoverCmd('RETURN_HOME')}
                      disabled={sendingCommand || !roverData.is_connected}
                      className="btn-outline text-xs py-2 flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Return Base
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRECISION SPRAYING STATION */}
          {activeTab === 'spraying' && (
            <div className="bg-white rounded-xl border border-agri-beige p-6 shadow-sm">
              <div className="flex justify-between items-start border-b pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-blue-500" />
                    Precision Agro-Sprayer Station
                  </h3>
                  <p className="text-xs text-gray-500">
                    Control tank pressure, solenoid release, spray boom height, and nozzle targeting.
                  </p>
                </div>

                <button
                  onClick={handleStartSpraying}
                  disabled={sendingCommand || !roverData.is_connected}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Droplets className="h-4 w-4" />
                  Initiate Spray Mission
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Field Selection & Parameters */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Field *</label>
                    <select
                      value={selectedFieldId}
                      onChange={e => setSelectedFieldId(e.target.value)}
                      className="input-field"
                    >
                      {fields.map(f => (
                        <option key={f.id} value={f.id}>{f.name} ({f.area_hectares || 1.0} ha)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Spray Boom Height: <span className="font-bold text-agri-green">{sprayHeightCm} cm</span>
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={sprayHeightCm}
                      onChange={e => setSprayHeightCm(parseInt(e.target.value))}
                      className="w-full accent-agri-green cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Low (20cm)</span>
                      <span>Canopy (100cm)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nozzle Angle: <span className="font-bold text-agri-green">{nozzleAngle}°</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={nozzleAngle}
                      onChange={e => setNozzleAngle(parseInt(e.target.value))}
                      className="w-full accent-agri-green cursor-pointer"
                    />
                  </div>
                </div>

                {/* Actuator Toggles */}
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl border flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-800">Liquid Delivery Pump</h4>
                      <p className="text-xs text-gray-500">12V High-Pressure Diaphragm Pump</p>
                    </div>
                    <button
                      onClick={() => {
                        const next = !pumpOn;
                        setPumpOn(next);
                        sendRoverCmd(next ? 'START_SPRAYING' : 'STOP_SPRAYING');
                      }}
                      disabled={!roverData.is_connected || sendingCommand}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                        pumpOn ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {pumpOn ? 'PUMP ON' : 'PUMP OFF'}
                    </button>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-800">Solenoid Nozzle Valves</h4>
                      <p className="text-xs text-gray-500">Fast-response pulse width modulation</p>
                    </div>
                    <button
                      onClick={() => setSolenoidOpen(!solenoidOpen)}
                      disabled={!roverData.is_connected}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                        solenoidOpen ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {solenoidOpen ? 'VALVES OPEN' : 'CLOSED'}
                    </button>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-800">
                    <span className="font-bold block mb-1">Automatic Safety Drift Protection:</span>
                    Rover automatically aborts spraying if wind speed exceeds 15 km/h to prevent chemical drift.
                  </div>
                </div>

                {/* Tank Level Gauge */}
                <div className="bg-gray-50 rounded-xl border p-5 flex flex-col items-center justify-center text-center">
                  <div className="relative h-32 w-20 bg-gray-200 rounded-2xl overflow-hidden border-2 border-gray-300 mb-3 shadow-inner">
                    <div 
                      className="absolute bottom-0 inset-x-0 bg-blue-500 transition-all duration-500"
                      style={{ height: `${roverData.spray_tank_pct ?? 0}%` }}
                    ></div>
                  </div>
                  <span className="text-xl font-bold text-gray-900">{roverData.spray_tank_pct == null ? '--' : `${roverData.spray_tank_pct}%`}</span>
                  <span className="text-xs text-gray-500">Liquid Tank Fullness</span>
                  <span className="text-xs font-semibold text-gray-500 mt-1">Live rover telemetry required</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI VISION & PROBLEM DETECTION */}
          {activeTab === 'detection' && (
            <div className="bg-white rounded-xl border border-agri-beige p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Eye className="h-5 w-5 text-agri-green" />
                Real-Time Crop Problem & Disease Detections
              </h3>
              <p className="text-xs text-gray-500 mb-6">Use the laptop camera for local disease and lane-detection testing. No rover camera result is shown until hardware telemetry is connected.</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-xl border bg-gray-950 p-4">
                  <video ref={videoRef} autoPlay muted playsInline className="w-full aspect-video rounded-lg object-cover bg-black" />
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button onClick={cameraActive ? stopLaptopCamera : startLaptopCamera} className="btn-outline text-sm">{cameraActive ? 'Stop Laptop Camera' : 'Start Laptop Camera'}</button>
                    <button onClick={analyzeLaptopFrame} disabled={!cameraActive} className="btn-primary text-sm">Detect Disease</button>
                    <button onClick={runLaneCameraTest} disabled={!cameraActive} className="btn-outline text-sm">Test Lane Frame</button>
                  </div>
                  {cameraError && <p className="text-xs text-red-300 mt-3">{cameraError}</p>}
                  {laneTestResult && <p className="text-xs text-green-300 mt-3">{laneTestResult}</p>}
                </div>
                <div className="rounded-xl border bg-gray-50 p-5">
                  <h4 className="font-semibold text-gray-900">Latest laptop-camera disease result</h4>
                  {detectionResult ? <div className="mt-4 text-sm space-y-2"><p><strong>{detectionResult.label}</strong></p><p>Confidence: {Math.round((detectionResult.confidence || 0) * 100)}%</p><p>{detectionResult.description}</p><p className="text-agri-green">{detectionResult.recommendations}</p></div> : <p className="text-sm text-gray-500 mt-4">No camera frame analyzed yet.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
