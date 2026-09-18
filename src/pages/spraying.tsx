import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Droplets, Zap, ShieldAlert, CheckCircle2, Sliders, Activity, Clock } from "lucide-react";
import { fetchSprayLogs } from "@/services/api";

export default function PrecisionSpraying() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchSprayLogs().then(data => {
      if (data) setLogs(data);
    }).catch(err => console.error(err));
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-emerald-900/40">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Droplets className="w-6 h-6 text-cyan-400" /> Precision Spraying & Input Tracking
            </h1>
            <p className="text-xs text-gray-400">Solenoid Pulse Valve Timing & DC Spray Pump Flow Monitor</p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-lg bg-cyan-950 text-cyan-300 text-xs font-mono font-bold border border-cyan-800">
              SOLENOID PULSE: 500ms
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-5 rounded-2xl border border-emerald-900/40">
            <div className="text-xs text-gray-400 font-medium mb-2">Integrated Spray Tank Capacity</div>
            <div className="text-3xl font-extrabold text-white">22.0 / 25.0 L</div>
            <div className="w-full bg-black/60 rounded-full h-3 mt-3 overflow-hidden border border-emerald-900/30">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full" style={{ width: "88%" }} />
            </div>
            <div className="text-[11px] text-gray-400 mt-2">88% Fluid Remaining • LiFePO4 Powered</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-emerald-900/40">
            <div className="text-xs text-gray-400 font-medium mb-2">Total Chemical Applied</div>
            <div className="text-3xl font-extrabold text-cyan-300">10.5 Liters</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-2">
              Targeted Spraying saved 65% chemical vs broadcast
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-emerald-900/40">
            <div className="text-xs text-gray-400 font-medium mb-2">DC Pump & Solenoid Hardware</div>
            <div className="text-sm font-bold text-white">12V/24V High-Pressure Pump</div>
            <div className="text-[11px] text-gray-400 mt-1">Dual Rotatable Nozzles (Angle: 0°)</div>
            <span className="mt-2 inline-block px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
              CALIBRATED & READY
            </span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-900/40">
          <h3 className="font-bold text-sm text-gray-200 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" /> Targeted Spray Application Log History
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/40 text-gray-400 font-mono border-b border-emerald-900/30">
                <tr>
                  <th className="p-3">Log ID</th>
                  <th className="p-3">Chemical Applied</th>
                  <th className="p-3">Volume (L)</th>
                  <th className="p-3">Target Field Area</th>
                  <th className="p-3">Duration (sec)</th>
                  <th className="p-3">Coordinates</th>
                  <th className="p-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/20">
                {logs.map((l: any) => (
                  <tr key={l.id} className="hover:bg-emerald-950/20 transition-colors">
                    <td className="p-3 font-mono text-emerald-400 font-bold">#SPRAY-0{l.id}</td>
                    <td className="p-3 font-semibold text-gray-200">{l.chemical_name}</td>
                    <td className="p-3 font-mono text-cyan-300 font-bold">{l.volume_sprayed_liters} L</td>
                    <td className="p-3 text-gray-400">{l.target_area_hectares} Ha</td>
                    <td className="p-3 text-gray-300 font-mono">{l.duration_seconds}s</td>
                    <td className="p-3 font-mono text-gray-400">
                      {l.latitude?.toFixed(4)}, {l.longitude?.toFixed(4)}
                    </td>
                    <td className="p-3 text-right text-gray-400 font-mono">
                      {new Date(l.applied_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
