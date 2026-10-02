import React, { useEffect, useRef, useState, useCallback } from 'react';
import Head from 'next/head';
import { api } from '../../services/api';
import { TERMS } from '../../constants/terminology';
import EmptyState from '../../components/ui/EmptyState';
import DataCard from '../../components/ui/DataCard';
import StatusBadge from '../../components/ui/StatusBadge';
import {
  Tractor, Video, Battery, Navigation, Crosshair, StopCircle,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, Droplets,
  ShieldAlert, Compass, CheckCircle2, Maximize2, Minimize2, Eye, EyeOff
} from 'lucide-react';

// ─── CV Lane Detection Types ────────────────────────────────────────────────────
interface DetectedLane {
  x: number;
  width: number;
  type: 'crop' | 'soil';
  confidence: number;
}

// ─── Color-based column classifier ─────────────────────────────────────────────
function classifyColumns(data: Uint8ClampedArray, width: number, height: number): boolean[] {
  const cols = new Float32Array(width);
  const sampleRows = Math.min(height, 60);
  for (let x = 0; x < width; x++) {
    let greenScore = 0;
    let brownScore = 0;
    for (let row = 0; row < sampleRows; row++) {
      const y = height - sampleRows + row;
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const isGreen = g > 80 && g > r * 1.15 && g > b * 1.1;
      const isBrown = r > 60 && g > 40 && b < 100 && r >= g * 0.7 && r > b * 1.2;
      if (isGreen) greenScore++;
      if (isBrown) brownScore++;
    }
    cols[x] = greenScore / sampleRows - brownScore / sampleRows;
  }
  // Aggressive smoothing to prevent fragmentation into too many lanes
  const smoothed = new Float32Array(width);
  for (let x = 0; x < width; x++) {
    let sum = 0, count = 0;
    for (let dx = -10; dx <= 10; dx++) { // 21-pixel wide kernel
      const nx = x + dx;
      if (nx >= 0 && nx < width) { sum += cols[nx]; count++; }
    }
    smoothed[x] = sum / count;
  }
  const binaryMask = Array.from(smoothed).map(v => v > 0.02);
  
  // Morphological close & open to remove noise
  const processMask = (m: boolean[], iters: number, val: boolean) => {
    let res = [...m];
    for (let i = 0; i < iters; i++) {
      const next = [...res];
      for (let j = 1; j < width - 1; j++) {
        if (res[j - 1] === val || res[j + 1] === val) next[j] = val;
      }
      res = next;
    }
    return res;
  };
  // Close (dilate then erode) and Open (erode then dilate) to merge nearby lanes
  let cleanMask = processMask(binaryMask, 5, true);
  cleanMask = processMask(cleanMask, 5, false);
  return cleanMask;
}

// ─── Lane segment extractor ─────────────────────────────────────────────────────
function extractLanes(mask: boolean[], totalWidth: number): DetectedLane[] {
  const lanes: DetectedLane[] = [];
  let start = 0;
  let currentType = mask[0];
  for (let x = 1; x <= mask.length; x++) {
    const atEnd = x === mask.length;
    const changed = !atEnd && mask[x] !== currentType;
    if (changed || atEnd) {
      const segLen = x - start;
      // Increased threshold to 10% of width to ensure only wide, distinct lanes are generated
      if (segLen > totalWidth * 0.10) {
        lanes.push({
          x: (start + segLen / 2) / totalWidth,
          width: segLen / totalWidth,
          type: currentType ? 'crop' : 'soil',
          confidence: Math.min(segLen / (totalWidth * 0.25), 1.0),
        });
      }
      if (!atEnd) { start = x; currentType = mask[x]; }
    }
  }
  return lanes;
}

// ─── CV overlay canvas component ────────────────────────────────────────────────
interface LaneCVOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  active: boolean;
  onLanesDetected: (lanes: DetectedLane[], count: number) => void;
  showCVOverlay: boolean;
}

function LaneCVOverlay({ videoRef, active, onLanesDetected, showCVOverlay }: LaneCVOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const lastCropRef = useRef<string>('');

  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2 || !video.videoWidth) {
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }
    const cw = canvas.offsetWidth;
    const ch = canvas.offsetHeight;
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }

    const PROC_W = 160, PROC_H = 90;
    if (!offRef.current) offRef.current = document.createElement('canvas');
    const off = offRef.current;
    off.width = PROC_W; off.height = PROC_H;
    const octx = off.getContext('2d', { willReadFrequently: true });
    if (!octx) { rafRef.current = requestAnimationFrame(processFrame); return; }
    octx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, PROC_W, PROC_H);
    const imgData = octx.getImageData(0, 0, PROC_W, PROC_H);

    const mask = classifyColumns(imgData.data, PROC_W, PROC_H);
    const lanes = extractLanes(mask, PROC_W);
    const cropLanes = lanes.filter(l => l.type === 'crop');
    const key = cropLanes.map(l => Math.round(l.x * 100)).join(',');
    if (key !== lastCropRef.current) { lastCropRef.current = key; onLanesDetected(lanes, cropLanes.length); }

    const ctx = canvas.getContext('2d');
    if (!ctx) { rafRef.current = requestAnimationFrame(processFrame); return; }
    ctx.clearRect(0, 0, cw, ch);

    if (showCVOverlay) {
      lanes.forEach(lane => {
        const lx = lane.x * cw;
        const lw = lane.width * cw;
        const alpha = 0.22 * lane.confidence;
        if (lane.type === 'crop') {
          ctx.fillStyle = `rgba(52,211,153,${alpha})`;
          ctx.fillRect(lx - lw / 2, 0, lw, ch);
          if (lw > 20) {
            ctx.save();
            ctx.font = `bold ${Math.max(8, Math.min(11, lw * 0.2))}px monospace`;
            ctx.fillStyle = 'rgba(52,211,153,0.92)';
            ctx.textAlign = 'center';
            ctx.fillText('CROP', lx, 16);
            ctx.restore();
          }
        } else {
          ctx.fillStyle = `rgba(217,119,6,${alpha * 0.7})`;
          ctx.fillRect(lx - lw / 2, 0, lw, ch);
        }
      });
      for (let i = 0; i < lanes.length - 1; i++) {
        const a = lanes[i], b = lanes[i + 1];
        if (a.type !== b.type) {
          const edgeX = (a.x + a.width / 2) * cw;
          ctx.save();
          ctx.strokeStyle = 'rgba(74,222,128,0.85)';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.beginPath(); ctx.moveTo(edgeX, 0); ctx.lineTo(edgeX, ch); ctx.stroke();
          ctx.restore();
        }
      }
      const barH = 8;
      lanes.forEach(lane => {
        const lx = lane.x * cw, lw = lane.width * cw;
        ctx.fillStyle = lane.type === 'crop'
          ? `rgba(52,211,153,${0.6 + lane.confidence * 0.35})`
          : `rgba(180,120,60,${0.5 + lane.confidence * 0.3})`;
        ctx.fillRect(lx - lw / 2, ch - barH, lw, barH);
      });
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 6]);
      ctx.beginPath(); ctx.moveTo(cw / 2, 0); ctx.lineTo(cw / 2, ch); ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#6ee7b7';
      ctx.fillText(`LANES: ${cropLanes.length}`, 10, ch - 12);
      ctx.restore();
    }
    rafRef.current = requestAnimationFrame(processFrame);
  }, [videoRef, active, onLanesDetected, showCVOverlay]);

  useEffect(() => {
    if (active) {
      rafRef.current = requestAnimationFrame(processFrame);
    } else {
      cancelAnimationFrame(rafRef.current);
      const canvas = canvasRef.current;
      if (canvas) { const ctx = canvas.getContext('2d'); ctx?.clearRect(0, 0, canvas.width, canvas.height); }
    }
    return () => { cancelAnimationFrame(rafRef.current); };
  }, [active, processFrame]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }} />;
}

// ─── Main Rover Page ────────────────────────────────────────────────────────────
export default function RoverPage() {
  const [roverData, setRoverData] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingCommand, setSendingCommand] = useState(false);
  const [lastAction, setLastAction] = useState('');
  const [pumpOn, setPumpOn] = useState(false);
  const [solenoidOpen, setSolenoidOpen] = useState(false);
  const [activeSpraySession, setActiveSpraySession] = useState<any>(null);
  const [sprayHeightCm, setSprayHeightCm] = useState(45);
  const [nozzleAngle, setNozzleAngle] = useState(30);
  const [activeTab, setActiveTab] = useState<'camera' | 'info'>('camera');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [diseaseResults, setDiseaseResults] = useState<any[]>([]);
  const [lastDiseaseResult, setLastDiseaseResult] = useState<any>(null);
  const [laneStatus, setLaneStatus] = useState('AWAITING CAMERA');

  const [isCameraMaximized, setIsCameraMaximized] = useState(false);
  const [detectedLanes, setDetectedLanes] = useState<DetectedLane[]>([]);
  const [detectedCropCount, setDetectedCropCount] = useState(0);
  const [showCVOverlay, setShowCVOverlay] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const fetchRoverAndFields = async () => {
    try {
      const [roverRes, fieldsRes, productsRes, diseaseRes] = await Promise.allSettled([
        api.get('/farmer/rover'),
        api.get('/fields'),
        api.get('/products'),
        api.get('/crop-health'),
      ]);
      if (roverRes.status === 'fulfilled') setRoverData(roverRes.value.data);
      if (fieldsRes.status === 'fulfilled' && fieldsRes.value.data) {
        setFields(fieldsRes.value.data);
        if (fieldsRes.value.data.length > 0 && !selectedFieldId) setSelectedFieldId(fieldsRes.value.data[0].id);
      }
      if (productsRes.status === 'fulfilled' && productsRes.value.data) {
        setProducts(productsRes.value.data);
        if (productsRes.value.data.length > 0 && !selectedProductId) setSelectedProductId(productsRes.value.data[0].id);
      }
      if (diseaseRes.status === 'fulfilled') {
        setDiseaseResults(Array.isArray(diseaseRes.value.data) ? diseaseRes.value.data : []);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchRoverAndFields();
    const interval = setInterval(fetchRoverAndFields, 5000);
    return () => { clearInterval(interval); cameraStreamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('rover-camera-maximize', { detail: isCameraMaximized }));
    return () => { window.dispatchEvent(new CustomEvent('rover-camera-maximize', { detail: false })); };
  }, [isCameraMaximized]);

  const handleLanesDetected = useCallback((lanes: DetectedLane[], cropCount: number) => {
    setDetectedLanes(lanes);
    setDetectedCropCount(cropCount);
    setLaneStatus(cropCount === 0 ? 'NO LANES DETECTED' : `${cropCount} CROP LANE${cropCount !== 1 ? 'S' : ''} DETECTED`);
  }, []);

  const startLaptopCamera = async () => {
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) { setCameraError('Laptop camera access is unavailable in this browser.'); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      cameraStreamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
      setLaneStatus('SCANNING...');
    } catch { setCameraError('Camera permission was denied or no laptop camera was found.'); }
  };

  const stopLaptopCamera = () => {
    cameraStreamRef.current?.getTracks().forEach(t => t.stop());
    cameraStreamRef.current = null;
    setCameraActive(false);
    setLaneStatus('AWAITING CAMERA');
    setDetectedLanes([]);
    setDetectedCropCount(0);
  };



  const captureFrame = (): Promise<Blob | null> => new Promise(resolve => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth) { resolve(null); return; }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob(resolve, 'image/jpeg', 0.9);
  });

  const analyzeCurrentFrame = async () => {
    if (!selectedFieldId) {
      setCameraError('Disease detection requires a farm field to be selected first.');
      setLastAction('Select a farm field before starting disease detection.'); return;
    }
    const frame = await captureFrame();
    if (!frame) { setCameraError('Start the camera and wait until the frame is ready before scanning.'); return; }
    const payload = new FormData();
    payload.append('file', frame, 'rover-detection.jpg');
    payload.append('field_id', selectedFieldId);
    try {
      const response = await api.post('/crop-health/analyze-image', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      const result = response.data;
      setLastDiseaseResult(result);
      setDiseaseResults(prev => [result, ...prev].slice(0, 5));
      if (result.analysis_available === false) { setLastAction('No AI model is configured.'); return; }
      if (result.is_healthy) { await sendRoverCmd('MOVE_FORWARD'); }
      else {
        setLastAction(`Disease: ${result.label} (${Math.round((result.confidence || 0) * 100)}% confidence, ${result.severity || 'unknown'} severity).`);
        if (result.evidence?.length > 0) alert(result.evidence_storage === 'cloudinary' ? 'Disease detected. Cloudinary evidence captured.' : 'Disease detected, but no cloud storage configured.');
      }
    } catch (err: any) { setCameraError(err.response?.data?.detail || 'Disease scan failed.'); }
  };

  const sendRoverCmd = async (command: string, params: any = {}) => {
    if (!roverData) return;
    setSendingCommand(true); setLastAction(`Executed: ${command}`);
    try {
      await api.post(`/rovers/${roverData.rover_id}/command`, { command, params }).catch(async () => {
        await api.post('/rover/command', { command, params });
      });
      setTimeout(fetchRoverAndFields, 1000);
    } catch (err: any) { alert(err.response?.data?.detail || `Failed to dispatch ${command}`); }
    finally { setSendingCommand(false); }
  };

  const handleEmergencyStop = async () => {
    if (!roverData) return;
    setSendingCommand(true);
    try {
      await api.post(`/rovers/${roverData.rover_id}/command`, { command: 'EMERGENCY_STOP', params: { reason: 'Operator Emergency Halt' } }).catch(async () => {
        await api.post('/rover/command', { command: 'EMERGENCY_STOP', params: {} });
      });
      setPumpOn(false); setSolenoidOpen(false); setLastAction('EMERGENCY STOP TRIGGERED');
      setTimeout(fetchRoverAndFields, 500);
    } catch { alert('CRITICAL: Emergency stop signal failed.'); }
    finally { setSendingCommand(false); }
  };

  const handleStartSpraying = async () => {
    if (!roverData || !selectedFieldId || !selectedProductId) { alert('Select a field and spray product before starting.'); return; }
    setSendingCommand(true);
    try {
      const response = await api.post('/spraying/sessions', {
        rover_id: roverData.rover_id, field_id: selectedFieldId, product_id: selectedProductId,
        spray_height_cm: sprayHeightCm, nozzle_angle_deg: nozzleAngle, target_area_hectares: 1.5,
      });
      setActiveSpraySession(response.data); setPumpOn(true); setSolenoidOpen(true);
      setLastAction('Spraying operation initiated.'); alert('Spraying mission dispatched to rover.');
    } catch (err: any) { alert(err.response?.data?.detail || 'Spraying start failed.'); }
    finally { setSendingCommand(false); }
  };

  const handleStopSpraying = async () => {
    if (!activeSpraySession?.id) return;
    setSendingCommand(true);
    try {
      await api.post(`/spraying/sessions/${activeSpraySession.id}/stop`);
      setPumpOn(false); setSolenoidOpen(false); setActiveSpraySession(null);
      setLastAction('Spraying session stopped safely.');
    } catch (err: any) { alert(err.response?.data?.detail || 'Unable to stop the spray session.'); }
    finally { setSendingCommand(false); }
  };

  if (loading && !roverData) return <div className="p-8 text-center text-gray-500">Connecting to {TERMS.rover.toLowerCase()} telemetry...</div>;

  // ── Camera viewport with CV overlay ────────────────────────────────────────
  const renderCameraViewport = (compact: boolean = false) => (
    <div className={`relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 ${compact ? 'min-h-[420px]' : 'h-full min-h-[320px]'}`}>
      <video ref={videoRef} autoPlay muted playsInline className={`absolute inset-0 h-full w-full object-cover ${cameraActive ? 'opacity-100' : 'hidden'}`} />
      {/* CV Lane detection overlay - processes video pixels in real time */}
      <LaneCVOverlay videoRef={videoRef} active={cameraActive} onLanesDetected={handleLanesDetected} showCVOverlay={showCVOverlay} />
      {!cameraActive && (
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      )}
      {!cameraActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Video className="h-12 w-12 opacity-40" />
          <p className="text-sm font-mono">Camera feed inactive</p>
          <p className="text-xs opacity-60">CV lane detection activates on start</p>
        </div>
      )}
      {/* HUD top-left */}
      <div className="absolute left-4 top-4 rounded-lg bg-black/60 px-3 py-2 text-[10px] font-mono text-emerald-300 border border-emerald-400/40 backdrop-blur-sm" style={{ zIndex: 20 }}>
        <div>LANE: {laneStatus}</div>
        <div>SPEED: {roverData?.speed_kmh == null ? '--' : `${roverData.speed_kmh} KM/H`}</div>
        <div>MODE: {roverData?.mode || 'AUTONOMOUS'}</div>
      </div>
      {/* HUD top-right */}
      <div className="absolute right-4 top-4 rounded-lg bg-black/60 px-3 py-2 text-[10px] font-mono text-amber-300 border border-amber-400/40 backdrop-blur-sm" style={{ zIndex: 20 }}>
        <div>SPRAY: {pumpOn ? 'ACTIVE' : 'STANDBY'}</div>
        <div>PUMP: {pumpOn ? 'ON' : 'OFF'}</div>
        <div>TRACK: {String(detectedCropCount).padStart(2, '0')}</div>
      </div>
      {/* CV legend bottom-center */}
      {cameraActive && showCVOverlay && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-lg bg-black/60 px-4 py-2 text-[9px] font-mono backdrop-blur-sm border border-white/10" style={{ zIndex: 20 }}>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-5 rounded-sm bg-emerald-400/80" />CROP ROW</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-5 rounded-sm bg-amber-500/70" />SOIL</span>
          <span className="text-slate-400">|</span>
          <span className="text-emerald-300">{detectedCropCount} LANE{detectedCropCount !== 1 ? 'S' : ''}</span>
        </div>
      )}
      {/* CV lanes panel bottom-right */}
      {cameraActive && detectedLanes.length > 0 && showCVOverlay && (
        <div className="absolute bottom-4 right-4 rounded-lg bg-black/70 px-3 py-2 text-[9px] font-mono border border-emerald-500/30 backdrop-blur-sm max-w-[140px]" style={{ zIndex: 20 }}>
          <div className="text-emerald-300 font-bold mb-1">CV LANES</div>
          {detectedLanes.slice(0, 6).map((lane, i) => (
            <div key={i} className={`flex justify-between gap-2 ${lane.type === 'crop' ? 'text-emerald-300' : 'text-amber-400'}`}>
              <span>{lane.type === 'crop' ? '🌿' : '🟫'} {lane.type.toUpperCase()}</span>
              <span>{Math.round(lane.confidence * 100)}%</span>
            </div>
          ))}
          {detectedLanes.length > 6 && <div className="text-slate-400 mt-1">+{detectedLanes.length - 6} more</div>}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <Head>
        <title>{TERMS.rover} Control &amp; Spraying - Smart AgriTech</title>
        <meta name="description" content="Camera view with real-time CV lane detection, rover movement control, and spraying dashboard." />
      </Head>
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tractor className="h-7 w-7 text-agri-green" />{TERMS.rover} Mission Control
          </h1>
          <p className="mt-1 text-sm text-gray-500">Real-time CV lane detection, steering controls, spray toggle, and rover diagnostics.</p>
        </div>
        {roverData && (
          <button onClick={handleEmergencyStop} disabled={sendingCommand || !roverData.is_connected}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-lg flex items-center gap-2 transition-all transform active:scale-95">
            <StopCircle className="h-6 w-6" />EMERGENCY STOP
          </button>
        )}
      </div>
      {lastAction && (
        <div className="mb-4 p-2.5 bg-blue-50 text-blue-800 text-xs font-mono rounded-lg border border-blue-200 flex items-center justify-between">
          <span>Status: {lastAction}</span><span className="text-blue-500">{new Date().toLocaleTimeString()}</span>
        </div>
      )}
      {!roverData ? (
        <EmptyState icon={Tractor} title={`No ${TERMS.rover} Assigned`} description={`Your farm is not currently linked to any active rover hardware.`} />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <DataCard title="Hardware Link" value={roverData.is_connected ? 'Connected' : 'Offline'} icon={Navigation} description={`ID: ${roverData.rover_id}`} />
            <DataCard title="Battery Charge" value={roverData.battery_pct == null ? '--' : `${roverData.battery_pct}%`} icon={Battery} description="Nominal Voltage" />
            <DataCard title="Spray Liquid Tank" value={roverData.spray_tank_pct == null ? '--' : `${roverData.spray_tank_pct}%`} icon={Droplets} description="Capacity: 20L" />
            <div className="bg-white rounded-xl border border-agri-beige p-5 shadow-sm flex flex-col justify-center items-center">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</span>
              {roverData.rover_status ? <StatusBadge status={roverData.rover_status} className="text-sm px-3 py-1" /> : <span className="text-sm text-gray-500">Unavailable</span>}
            </div>
          </div>
          {/* Tabs */}
          <div className="flex border-b border-gray-200 gap-6">
            <button onClick={() => setActiveTab('camera')} className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'camera' ? 'border-agri-green text-agri-green' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <Video className="h-4 w-4" />Camera View
            </button>
            <button onClick={() => setActiveTab('info')} className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'info' ? 'border-agri-green text-agri-green' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <Compass className="h-4 w-4" />Rover &amp; Spray Information
            </button>
          </div>

          {/* MAXIMIZED CAMERA */}
          {activeTab === 'camera' && isCameraMaximized && (
            <div className="fixed inset-0 z-50 bg-slate-950/95 p-4 sm:p-6">
              <div className="relative grid h-full grid-cols-[minmax(150px,220px)_minmax(0,1fr)_minmax(180px,260px)] gap-4 pb-20">
                <aside className="order-3 flex flex-col justify-center gap-4 rounded-xl border border-white/10 bg-slate-900/90 p-4 text-white shadow-2xl">
                  <h3 className="text-center text-xs font-semibold uppercase tracking-wider text-slate-300">Movement</h3>
                  <button onClick={() => sendRoverCmd('MOVE_FORWARD')} disabled={sendingCommand || !roverData.is_connected} className="mx-auto h-14 w-14 rounded-xl bg-slate-700 hover:bg-agri-green disabled:opacity-40"><ArrowUp className="mx-auto h-6 w-6" /></button>
                  <div className="flex justify-center gap-2">
                    <button onClick={() => sendRoverCmd('TURN_LEFT')} disabled={sendingCommand || !roverData.is_connected} className="h-12 w-12 rounded-xl bg-slate-700 hover:bg-agri-green disabled:opacity-40"><ArrowLeft className="mx-auto h-5 w-5" /></button>
                    <button onClick={() => sendRoverCmd('TURN_RIGHT')} disabled={sendingCommand || !roverData.is_connected} className="h-12 w-12 rounded-xl bg-slate-700 hover:bg-agri-green disabled:opacity-40"><ArrowRight className="mx-auto h-5 w-5" /></button>
                  </div>
                  <button onClick={() => sendRoverCmd('MOVE_BACKWARD')} disabled={sendingCommand || !roverData.is_connected} className="mx-auto h-14 w-14 rounded-xl bg-slate-700 hover:bg-agri-green disabled:opacity-40"><ArrowDown className="mx-auto h-6 w-6" /></button>
                  <button onClick={() => sendRoverCmd('RETURN_HOME')} disabled={sendingCommand || !roverData.is_connected} className="rounded-lg border border-slate-600 px-3 py-2 text-xs hover:bg-slate-800 disabled:opacity-40"><RotateCcw className="mr-1 inline h-3.5 w-3.5" />Return Base</button>
                </aside>
                <main className="order-2 relative flex min-w-0 items-center justify-center">
                  <div className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-xl border border-emerald-400/40 shadow-2xl">
                    {renderCameraViewport(false)}
                    <button onClick={() => setIsCameraMaximized(false)} className="absolute right-4 top-4 rounded-lg bg-black/60 p-2 text-white hover:bg-black/80 z-30" title="Exit maximized" aria-label="Exit maximized camera view"><Minimize2 className="h-5 w-5" /></button>
                  </div>
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
                    <button onClick={cameraActive ? stopLaptopCamera : startLaptopCamera} className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-slate-900 shadow-lg">{cameraActive ? 'Stop Camera' : 'Start Camera'}</button>
                    <button onClick={() => setShowCVOverlay(v => !v)} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-emerald-300 shadow-lg flex items-center gap-1 border border-emerald-500/30">
                      {showCVOverlay ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}CV {showCVOverlay ? 'Off' : 'On'}
                    </button>
                  </div>
                </main>
                <aside className="order-1 flex flex-col justify-center gap-4 rounded-xl border border-white/10 bg-slate-900/90 p-4 text-white shadow-2xl">
                  <h3 className="text-center text-xs font-semibold uppercase tracking-wider text-slate-300">Spraying</h3>
                  <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} disabled={pumpOn || sendingCommand} className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs text-white">
                    <option value="">Select product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <button onClick={pumpOn ? handleStopSpraying : handleStartSpraying} disabled={!roverData.is_connected || sendingCommand} className={`rounded-lg px-3 py-3 text-sm font-bold disabled:opacity-40 ${pumpOn ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-blue-600'}`}><Droplets className="mr-2 inline h-4 w-4" />{pumpOn ? 'Spray On' : 'Spray Off'}</button>
                  <button onClick={() => setSolenoidOpen(!solenoidOpen)} disabled={!roverData.is_connected} className={`rounded-lg px-3 py-3 text-xs font-bold disabled:opacity-40 ${solenoidOpen ? 'bg-green-600' : 'bg-slate-700 hover:bg-green-600'}`}>{solenoidOpen ? 'Valve Open' : 'Valve Closed'}</button>
                  <div className="text-center text-xs text-slate-400">Tank: {roverData.spray_tank_pct == null ? '--' : `${roverData.spray_tank_pct}%`}</div>
                  <div className="mt-3 border-t border-slate-700 pt-4">
                    <h3 className="mb-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-300">Disease Detection</h3>
                    <button onClick={analyzeCurrentFrame} disabled={!cameraActive || sendingCommand} className="w-full rounded-lg bg-agri-green px-3 py-3 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-40">Scan Current Frame</button>
                    <p className="mt-3 text-center text-xs text-slate-400">{lastDiseaseResult?.label || 'No detection yet'}</p>
                    {lastDiseaseResult?.analysis_available === false && <p className="mt-1 text-center text-[10px] text-amber-300">AI analysis unavailable</p>}
                  </div>
                </aside>
                <button onClick={() => sendRoverCmd('STOP')} disabled={sendingCommand || !roverData.is_connected} className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-xl bg-red-600 px-12 py-3 text-sm font-bold text-white shadow-xl hover:bg-red-700 disabled:opacity-40"><StopCircle className="mr-2 inline h-5 w-5" />STOP</button>
              </div>
            </div>
          )}

          {/* NORMAL CAMERA VIEW */}
          {activeTab === 'camera' && !isCameraMaximized && (
            <div className="grid grid-cols-1 xl:grid-cols-[1.55fr_1fr] gap-6">
              <div className="space-y-4">


                {/* Camera feed */}
                <div className="bg-white rounded-xl border border-agri-beige shadow-sm overflow-hidden sticky top-24">
                  <div className="px-5 py-3 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                      <Video className="h-4 w-4 text-agri-green" />Camera View — CV Lane Detection
                    </h3>
                    <div className="flex items-center gap-3">
                      {cameraActive && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${detectedCropCount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {detectedCropCount} lane{detectedCropCount !== 1 ? 's' : ''}
                        </span>
                      )}
                      <button onClick={() => setShowCVOverlay(v => !v)} className="text-gray-500 hover:text-emerald-700 flex items-center gap-1 text-xs font-medium" title="Toggle CV overlay" aria-label="Toggle CV overlay">
                        {showCVOverlay ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}CV
                      </button>
                      <button onClick={() => setIsCameraMaximized(true)} className="text-gray-500 hover:text-gray-900" title="Maximize camera view" aria-label="Maximize camera view"><Maximize2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  {renderCameraViewport(true)}
                </div>

                {/* Camera controls */}
                <div className="sticky top-24 z-20 bg-white rounded-xl border border-agri-beige p-4 shadow-sm">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <button onClick={cameraActive ? stopLaptopCamera : startLaptopCamera} className="btn-outline text-sm">{cameraActive ? 'Stop Camera' : 'Start Camera'}</button>
                    <button onClick={analyzeCurrentFrame} disabled={!cameraActive} className="btn-primary text-sm">Scan Disease</button>
                    <button onClick={() => setShowCVOverlay(v => !v)} className={`btn-outline text-sm flex items-center gap-1.5 ${showCVOverlay ? 'border-emerald-400 text-emerald-600' : ''}`}>
                      {showCVOverlay ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}{showCVOverlay ? 'Hide CV Lanes' : 'Show CV Lanes'}
                    </button>
                  </div>
                  {cameraError && <p className="text-xs text-red-500 mt-2">{cameraError}</p>}
                  {cameraActive && detectedLanes.length > 0 && (
                    <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-xs font-semibold text-emerald-800 mb-2">CV Detection — {laneStatus}</p>
                      <div className="flex flex-wrap gap-2">
                        {detectedLanes.map((lane, i) => (
                          <span key={i} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${lane.type === 'crop' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-amber-100 text-amber-700 border border-amber-300'}`}>
                            {lane.type === 'crop' ? '🌿' : '🟫'} {lane.type} {Math.round(lane.confidence * 100)}%
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {lastDiseaseResult?.analysis_available === false && (
                    <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">AI analysis is unavailable. No disease was reported.</p>
                  )}
                  {lastDiseaseResult && !lastDiseaseResult.is_healthy && (
                    <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                      Disease detected: {lastDiseaseResult.label} — {lastDiseaseResult.evidence_storage === 'cloudinary' ? 'evidence stored in Cloudinary.' : 'evidence was not stored.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                <div className="sticky top-24 z-20 bg-white rounded-xl border border-agri-beige p-5 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2"><Crosshair className="h-5 w-5 text-agri-green" />Movement Control</h3>
                  <p className="text-xs text-gray-500 mb-5">Forward, reverse, stop and autonomous movement.</p>
                  <div className="flex flex-col items-center gap-2 mb-6">
                    <button onClick={() => sendRoverCmd('MOVE_FORWARD')} disabled={sendingCommand || !roverData.is_connected} className="h-14 w-14 rounded-xl bg-gray-100 hover:bg-agri-green hover:text-white flex items-center justify-center font-bold shadow transition-all active:scale-95"><ArrowUp className="h-6 w-6" /></button>
                    <div className="flex gap-4">
                      <button onClick={() => sendRoverCmd('TURN_LEFT')} disabled={sendingCommand || !roverData.is_connected} className="h-14 w-14 rounded-xl bg-gray-100 hover:bg-agri-green hover:text-white flex items-center justify-center font-bold shadow transition-all active:scale-95"><ArrowLeft className="h-6 w-6" /></button>
                      <button onClick={() => sendRoverCmd('STOP')} disabled={sendingCommand || !roverData.is_connected} className="h-14 w-14 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 flex items-center justify-center font-bold shadow transition-all active:scale-95 text-xs uppercase">STOP</button>
                      <button onClick={() => sendRoverCmd('TURN_RIGHT')} disabled={sendingCommand || !roverData.is_connected} className="h-14 w-14 rounded-xl bg-gray-100 hover:bg-agri-green hover:text-white flex items-center justify-center font-bold shadow transition-all active:scale-95"><ArrowRight className="h-6 w-6" /></button>
                    </div>
                    <button onClick={() => sendRoverCmd('MOVE_BACKWARD')} disabled={sendingCommand || !roverData.is_connected} className="h-14 w-14 rounded-xl bg-gray-100 hover:bg-agri-green hover:text-white flex items-center justify-center font-bold shadow transition-all active:scale-95"><ArrowDown className="h-6 w-6" /></button>
                  </div>
                  <div className="border-t pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => sendRoverCmd('START_FIELD_TASK', { task: 'PATROL', field_id: selectedFieldId })} disabled={sendingCommand || !roverData.is_connected} className="btn-outline text-xs py-2">Auto Patrol</button>
                      <button onClick={() => sendRoverCmd('RETURN_HOME')} disabled={sendingCommand || !roverData.is_connected} className="btn-outline text-xs py-2"><RotateCcw className="h-3.5 w-3.5 inline mr-1" />Return Base</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={pumpOn ? handleStopSpraying : handleStartSpraying} disabled={!roverData.is_connected || sendingCommand} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${pumpOn ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{pumpOn ? 'Spray On' : 'Spray Off'}</button>
                      <button onClick={() => setSolenoidOpen(!solenoidOpen)} disabled={!roverData.is_connected} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${solenoidOpen ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{solenoidOpen ? 'Valve Open' : 'Valve Closed'}</button>
                    </div>
                    <div className="mt-3 space-y-2">
                      <label className="block text-xs font-medium text-gray-600">Spray product</label>
                      <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} disabled={pumpOn || sendingCommand} className="input-field text-sm">
                        <option value="">Select an active product</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      {products.length === 0 && <p className="text-xs text-amber-600">No active spray products are available.</p>}
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-agri-beige p-5 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-amber-500" />Camera CV Logic</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Camera analyses each frame in real-time using colour CV.</li>
                    <li>• <span className="text-emerald-700 font-medium">Green pixels</span> → crop/vegetation rows are highlighted and counted.</li>
                    <li>• <span className="text-amber-700 font-medium">Brown pixels</span> → soil inter-rows define lane boundaries.</li>
                    <li>• Lanes are drawn directly on the video feed — no server call needed.</li>
                    <li>• Toggle CV overlay with the Eye button above the camera feed.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* INFO TAB */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-agri-beige p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Rover &amp; Spraying Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <DataCard title="Speed" value={roverData.speed_kmh == null ? '--' : `${roverData.speed_kmh} km/h`} icon={Compass} description="Live movement telemetry" />
                  <DataCard title="Location" value={roverData.latitude == null || roverData.longitude == null ? '--' : `${roverData.latitude}, ${roverData.longitude}`} icon={Navigation} description="GPS coordinates" />
                  <DataCard title="Water Tank" value={roverData.spray_tank_pct == null ? '--' : `${roverData.spray_tank_pct}%`} icon={Droplets} description="Spray reserve" />
                </div>
              </div>
              <div className="bg-white rounded-xl border border-agri-beige p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Droplets className="h-5 w-5 text-blue-500" />Spraying Mechanism</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border bg-gray-50 p-4">
                    <div className="flex items-center justify-between text-sm"><span className="text-gray-600">Pump status</span><span className={`font-semibold ${pumpOn ? 'text-blue-600' : 'text-gray-500'}`}>{pumpOn ? 'ON' : 'OFF'}</span></div>
                    <div className="mt-3 flex items-center justify-between text-sm"><span className="text-gray-600">Valve status</span><span className={`font-semibold ${solenoidOpen ? 'text-green-600' : 'text-gray-500'}`}>{solenoidOpen ? 'OPEN' : 'CLOSED'}</span></div>
                    <div className="mt-3 flex items-center justify-between text-sm"><span className="text-gray-600">Spray height</span><span className="font-semibold text-gray-700">{sprayHeightCm} cm</span></div>
                    <div className="mt-3 flex items-center justify-between text-sm"><span className="text-gray-600">Nozzle angle</span><span className="font-semibold text-gray-700">{nozzleAngle}°</span></div>
                  </div>
                  <div className="rounded-xl border bg-gray-50 p-4">
                    <div className="flex items-center justify-between text-sm"><span className="text-gray-600">Field</span><span className="font-semibold text-gray-700">{fields.find(f => f.id === selectedFieldId)?.name || 'Not selected'}</span></div>
                    <div className="mt-3 flex items-center justify-between text-sm"><span className="text-gray-600">Manual motion</span><span className="font-semibold text-gray-700">Forward / Reverse / Stop</span></div>
                    <div className="mt-3 flex items-center justify-between text-sm"><span className="text-gray-600">Safety mode</span><span className="font-semibold text-amber-600">Active</span></div>
                    <div className="mt-3 flex items-center justify-between text-sm"><span className="text-gray-600">CV Lane status</span><span className="font-semibold text-green-600">{laneStatus}</span></div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-agri-beige p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-600" />Detected Disease</h3>
                {diseaseResults.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-sm text-gray-500">No disease has been detected yet.</div>
                ) : (
                  <div className="space-y-4">
                    {diseaseResults.map((record, index) => (
                      <div key={`${record.id || index}`} className="rounded-xl border bg-gray-50 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-gray-900">{record.label || 'Disease Detected'}</p>
                            <p className="text-xs text-gray-500">{record.created_at ? new Date(record.created_at).toLocaleString() : 'Recent scan'}</p>
                          </div>
                          <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${record.is_healthy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{record.is_healthy ? 'Healthy' : 'Disease'}</span>
                        </div>
                        {!record.is_healthy && (
                          <div className="mt-3 text-sm text-gray-700">
                            <p><strong>Severity:</strong> {record.severity || 'Moderate'}</p>
                            <p><strong>Confidence:</strong> {record.confidence ? `${Math.round(record.confidence * 100)}%` : 'N/A'}</p>
                            <p className="mt-2">{record.description || 'Detected disease image captured for review.'}</p>
                          </div>
                        )}
                        {record.evidence && record.evidence.length > 0 && (
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {record.evidence.map((item: any, ei: number) => (
                              <div key={`${item.id || ei}`} className="overflow-hidden rounded-lg border bg-white">
                                <img src={item.url} alt="Disease evidence" className="h-36 w-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
