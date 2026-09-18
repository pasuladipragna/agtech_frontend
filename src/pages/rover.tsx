import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import {
  Radio, Battery, Droplets, AlertOctagon, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Square, Zap, Camera, ChevronUp, ChevronDown, Sliders, ShieldAlert, Compass
} from "lucide-react";
import { sendRoverCommand, fetchRovers } from "@/services/api";

export default function RoverControlCenter() {
  const [roverId, setRoverId] = useState<string>("ROVER-4WD-01");
  const [telemetry, setTelemetry] = useState<any>({
    battery_pct: 94.5,
    spray_tank_pct: 88.0,
    voltage: 25.4,
    latitude: 36.778259,
    longitude: -119.417931,
    heading_deg: 45.0,
    camera_height_cm: 110,
    pump_active: false,
    speed_kmh: 0.0
  });
  const [frameData, setFrameData] = useState<string | null>(null);
  const [lastCommand, setLastCommand] = useState<string>("STOP");
  const [sprayPulseMs, setSprayPulseMs] = useState<number>(500);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const rovers = await fetchRovers();
        if (rovers && rovers.length > 0) {
          setTelemetry((prev: any) => ({ ...prev, ...rovers[0] }));
        }
      } catch (err) {
        console.error("Telemetry fetch error:", err);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCommand = async (cmd: string, params?: object) => {
    setLastCommand(cmd);
    try {
      await sendRoverCommand(roverId, cmd, params);
    } catch (err) {
      console.error(`Command ${cmd} dispatch failed:`, err);
    }
  };

  return (
    <Layout>
      <div className="space-y-4 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 glass-panel p-4 rounded-xl border border-emerald-900/40">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-400" /> Rover Telemetry & Manual Control
            </h1>
            <p className="text-xs text-gray-400">Mobile-First Touch Joystick • 4WD Hardware Abstraction Protocol</p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-400 text-xs font-mono font-bold border border-emerald-800/40">
              {roverId}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-black/60 text-emerald-400 text-xs font-mono border border-emerald-900/30">
              {telemetry.speed_kmh ? `${telemetry.speed_kmh} km/h` : "0.0 km/h"}
            </span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-emerald-900/40">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#0e1712] border border-emerald-900/60 flex items-center justify-center">
            {frameData ? (
              <img src={frameData} alt="Rover Feed" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6 space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-600/50 flex items-center justify-center mx-auto text-emerald-400">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-xs text-emerald-300 font-semibold">Simulated Camera Stream Active</div>
                <div className="text-[10px] text-gray-400">Resolution: 640x480 • HUD Metric Overlay Enabled</div>
              </div>
            )}

            <div className="absolute top-2 left-2 right-2 flex justify-between items-center text-[10px] font-mono z-20">
              <div className="bg-black/70 backdrop-blur-md border border-emerald-900/40 px-2.5 py-1 rounded-md text-emerald-300 flex items-center space-x-3">
                <span className="flex items-center gap-1"><Battery className="w-3 h-3 text-emerald-400" /> {telemetry.battery_pct}% ({telemetry.voltage || 25.4}V)</span>
                <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-cyan-400" /> TANK: {telemetry.spray_tank_pct}%</span>
              </div>

              <div className="bg-black/70 backdrop-blur-md border border-emerald-900/40 px-2.5 py-1 rounded-md text-gray-300 flex items-center space-x-2">
                <Compass className="w-3 h-3 text-amber-400" />
                <span>{telemetry.heading_deg}° HEADING</span>
              </div>
            </div>

            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[10px] font-mono z-20">
              <div className="bg-black/80 border border-emerald-900/40 px-2.5 py-1 rounded-md text-gray-300">
                GPS: {telemetry.latitude?.toFixed(5)}, {telemetry.longitude?.toFixed(5)}
              </div>

              <div className="bg-black/80 border border-emerald-900/40 px-2.5 py-1 rounded-md text-emerald-400 font-bold">
                CAM HEIGHT: {telemetry.camera_height_cm} CM
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel p-5 rounded-xl border border-emerald-900/40 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-xs text-gray-200 uppercase tracking-wider">
                Drive Actuation (4WD DC Motors)
              </h3>
              <span className="text-[10px] font-mono text-emerald-400">LAST: {lastCommand}</span>
            </div>

            <div className="my-4 flex flex-col items-center space-y-2">
              <button
                onClick={() => handleCommand("MOVE_FORWARD", { speed_pct: 60 })}
                className="w-20 h-16 rounded-2xl bg-emerald-950 border-2 border-emerald-600/60 hover:bg-emerald-800 text-emerald-300 flex items-center justify-center shadow-lg active:scale-95 transition-transform glow-emerald"
              >
                <ArrowUp className="w-8 h-8" />
              </button>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleCommand("TURN_LEFT")}
                  className="w-16 h-16 rounded-2xl bg-emerald-950 border-2 border-emerald-600/60 hover:bg-emerald-800 text-emerald-300 flex items-center justify-center shadow-lg active:scale-95 transition-transform glow-emerald"
                >
                  <ArrowLeft className="w-8 h-8" />
                </button>

                <button
                  onClick={() => handleCommand("STOP")}
                  className="w-20 h-16 rounded-2xl bg-amber-950 border-2 border-amber-600 text-amber-400 font-bold text-xs flex flex-col items-center justify-center active:scale-95 transition-transform glow-amber"
                >
                  <Square className="w-5 h-5 mb-0.5" /> STOP
                </button>

                <button
                  onClick={() => handleCommand("TURN_RIGHT")}
                  className="w-16 h-16 rounded-2xl bg-emerald-950 border-2 border-emerald-600/60 hover:bg-emerald-800 text-emerald-300 flex items-center justify-center shadow-lg active:scale-95 transition-transform glow-emerald"
                >
                  <ArrowRight className="w-8 h-8" />
                </button>
              </div>

              <button
                onClick={() => handleCommand("MOVE_BACKWARD", { speed_pct: 40 })}
                className="w-20 h-16 rounded-2xl bg-emerald-950 border-2 border-emerald-600/60 hover:bg-emerald-800 text-emerald-300 flex items-center justify-center shadow-lg active:scale-95 transition-transform glow-emerald"
              >
                <ArrowDown className="w-8 h-8" />
              </button>
            </div>

            <button
              onClick={() => handleCommand("EMERGENCY_STOP")}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-red-950 glow-danger active:scale-98 transition-all"
            >
              <AlertOctagon className="w-5 h-5 animate-bounce" />
              <span>EMERGENCY STOP (SHUTDOWN ALL)</span>
            </button>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-emerald-900/40 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-xs text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-cyan-400" /> Precision Spray System
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${telemetry.pump_active ? "bg-cyan-950 text-cyan-300 border border-cyan-800" : "bg-black text-gray-400"}`}>
                  {telemetry.pump_active ? "PUMP ACTIVE" : "PUMP IDLE"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  onClick={() => handleCommand("START_SPRAYING", { pulse_ms: sprayPulseMs })}
                  className="p-3 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold text-xs flex items-center justify-center space-x-2 hover:bg-cyan-900 transition-colors"
                >
                  <Zap className="w-4 h-4" /> <span>START SPRAYING</span>
                </button>

                <button
                  onClick={() => handleCommand("STOP_SPRAYING")}
                  className="p-3 rounded-xl bg-black border border-gray-800 text-gray-400 font-semibold text-xs flex items-center justify-center hover:bg-gray-900 transition-colors"
                >
                  <span>STOP SPRAYING</span>
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between bg-black/40 p-2.5 rounded-lg text-xs">
                <span className="text-gray-400">Rotatable Nozzle Angle:</span>
                <div className="flex space-x-1">
                  {[-30, 0, 30].map(angle => (
                    <button
                      key={angle}
                      onClick={() => handleCommand("ROTATE_NOZZLE", { angle_deg: angle })}
                      className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono text-[10px]"
                    >
                      {angle}°
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-xs text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-400" /> Motorized Camera Mount
                </h3>
                <span className="text-xs font-mono text-emerald-400 font-bold">{telemetry.camera_height_cm} CM</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleCommand("RAISE_CAMERA")}
                  className="p-3 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold text-xs flex items-center justify-center space-x-1.5 hover:bg-emerald-900 transition-colors"
                >
                  <ChevronUp className="w-4 h-4" /> <span>RAISE HEIGHT (+15cm)</span>
                </button>

                <button
                  onClick={() => handleCommand("LOWER_CAMERA")}
                  className="p-3 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold text-xs flex items-center justify-center space-x-1.5 hover:bg-emerald-900 transition-colors"
                >
                  <ChevronDown className="w-4 h-4" /> <span>LOWER HEIGHT (-15cm)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
