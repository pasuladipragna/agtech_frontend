import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import {
  Navigation, Play, Pause, RotateCcw, Home, Plus, MapPin, CheckCircle2, Layers
} from "lucide-react";
import { fetchFields, createMission, sendRoverCommand } from "@/services/api";

export default function MissionPlanner() {
  const [fields, setFields] = useState<any[]>([]);
  const [selectedField, setSelectedField] = useState<any>(null);
  const [waypoints, setWaypoints] = useState<any[]>([
    { lat: 36.7785, lng: -119.4182, spray_on_arrival: true, name: "WP 1 (Tomato Row 1)" },
    { lat: 36.7790, lng: -119.4180, spray_on_arrival: false, name: "WP 2 (Tomato Row 2)" },
    { lat: 36.7795, lng: -119.4175, spray_on_arrival: true, name: "WP 3 (North Boundary)" }
  ]);
  const [missionStatus, setMissionStatus] = useState<string>("IDLE");
  const [currentWpIdx, setCurrentWpIdx] = useState<number>(0);

  useEffect(() => {
    fetchFields().then(data => {
      if (data && data.length > 0) {
        setFields(data);
        setSelectedField(data[0]);
      }
    }).catch(err => console.error(err));
  }, []);

  const addWaypoint = () => {
    const last = waypoints[waypoints.length - 1] || { lat: 36.7785, lng: -119.4182 };
    const newWp = {
      lat: Number((last.lat + 0.0003).toFixed(5)),
      lng: Number((last.lng + 0.0003).toFixed(5)),
      spray_on_arrival: false,
      name: `WP ${waypoints.length + 1}`
    };
    setWaypoints([...waypoints, newWp]);
  };

  const handleStartMission = async () => {
    setMissionStatus("IN_PROGRESS");
    try {
      await createMission({
        rover_id: 1,
        field_id: selectedField?.id || 1,
        waypoints: waypoints
      });
    } catch (err) {
      console.error("Start mission failed:", err);
    }
  };

  const handlePauseMission = async () => {
    setMissionStatus("PAUSED");
    await sendRoverCommand("ROVER-4WD-01", "PAUSE_MISSION");
  };

  const handleResumeMission = async () => {
    setMissionStatus("IN_PROGRESS");
    await sendRoverCommand("ROVER-4WD-01", "RESUME_MISSION");
  };

  const handleReturnHome = async () => {
    setMissionStatus("RETURNING_HOME");
    await sendRoverCommand("ROVER-4WD-01", "RETURN_HOME");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-emerald-900/40">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Navigation className="w-6 h-6 text-emerald-400" /> Autonomous Mission Planner
            </h1>
            <p className="text-xs text-gray-400">GPS Waypoint Path Builder & Lane Driving Driver</p>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono border ${
              missionStatus === "IN_PROGRESS"
                ? "bg-emerald-950 text-emerald-300 border-emerald-700 animate-pulse glow-emerald"
                : missionStatus === "PAUSED"
                ? "bg-amber-950 text-amber-300 border-amber-700"
                : "bg-black text-gray-400 border-gray-800"
            }`}>
              STATUS: {missionStatus}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-emerald-900/40 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <select
                  value={selectedField?.id || ""}
                  onChange={(e) => {
                    const f = fields.find(item => item.id === Number(e.target.value));
                    setSelectedField(f);
                  }}
                  className="bg-black/60 border border-emerald-900/40 text-emerald-300 text-xs rounded-lg px-3 py-1.5 font-semibold focus:outline-none"
                >
                  {fields.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.area_hectares} Ha)</option>
                  ))}
                </select>
              </div>

              <span className="text-[10px] font-mono text-gray-400">
                Soil: {selectedField?.soil_type || "Loam"} • {selectedField?.irrigation_type || "Drip"}
              </span>
            </div>

            <div className="relative h-80 rounded-xl overflow-hidden border border-emerald-900/50 bg-[#09120c] flex items-center justify-center p-4">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-emerald-500/40 rounded-xl bg-emerald-950/20 p-4">
                <div className="text-center space-y-2">
                  <MapPin className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                  <div className="text-sm font-bold text-emerald-200">
                    {selectedField?.name || "Tomato Block A"} Boundary Loaded
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    {waypoints.length} Target Waypoints Plotted
                  </div>
                </div>

                <div className="mt-4 flex items-center space-x-2 overflow-x-auto max-w-full px-2">
                  {waypoints.map((wp, idx) => (
                    <div
                      key={idx}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono border whitespace-nowrap ${
                        idx === currentWpIdx && missionStatus === "IN_PROGRESS"
                          ? "bg-emerald-500 text-black font-bold border-emerald-300 shadow-md"
                          : "bg-black/60 text-emerald-400 border-emerald-900/40"
                      }`}
                    >
                      {idx + 1}. {wp.name} {wp.spray_on_arrival ? "💧" : ""}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <button
                onClick={handleStartMission}
                className="py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-black font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-900/40 glow-emerald"
              >
                <Play className="w-4 h-4 fill-black" /> <span>START MISSION</span>
              </button>

              <button
                onClick={handlePauseMission}
                className="py-3 rounded-xl bg-amber-950 border border-amber-700 text-amber-300 font-bold text-xs flex items-center justify-center space-x-1.5 hover:bg-amber-900"
              >
                <Pause className="w-4 h-4" /> <span>PAUSE</span>
              </button>

              <button
                onClick={handleResumeMission}
                className="py-3 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold text-xs flex items-center justify-center space-x-1.5 hover:bg-emerald-900"
              >
                <RotateCcw className="w-4 h-4" /> <span>RESUME</span>
              </button>

              <button
                onClick={handleReturnHome}
                className="py-3 rounded-xl bg-blue-950 border border-blue-700 text-blue-300 font-bold text-xs flex items-center justify-center space-x-1.5 hover:bg-blue-900"
              >
                <Home className="w-4 h-4" /> <span>RETURN HOME</span>
              </button>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-emerald-900/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-gray-200">Mission Waypoints</h3>
                <button
                  onClick={addWaypoint}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-700 text-emerald-400 font-semibold text-xs flex items-center space-x-1 hover:bg-emerald-900 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> <span>Add Waypoint</span>
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {waypoints.map((wp, idx) => (
                  <div key={idx} className="bg-black/40 p-3 rounded-xl border border-emerald-900/20 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-300">{idx + 1}. {wp.name}</span>
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wp.spray_on_arrival}
                          onChange={(e) => {
                            const copy = [...waypoints];
                            copy[idx].spray_on_arrival = e.target.checked;
                            setWaypoints(copy);
                          }}
                          className="rounded text-emerald-500 focus:ring-0 bg-black border-emerald-800"
                        />
                        <span className="text-[10px] text-cyan-300">Precision Spray</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-gray-400">
                      <div>LAT: {wp.lat}</div>
                      <div>LNG: {wp.lng}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-[11px] text-gray-400 mt-4">
              <div className="font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Autonomous Navigation Protocol
              </div>
              Waypoints are executed sequentially over MQTT. The 4WD rover will adjust heading angle and drive speed automatically.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
