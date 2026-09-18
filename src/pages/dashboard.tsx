import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import {
  Activity, Battery, Droplets, Sun, Wind, CloudRain, AlertTriangle, ShieldCheck,
  Radio, ScanEye, ArrowUpRight, Play, CheckCircle2, ChevronRight, Sparkles
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { fetchFarms, fetchRovers, fetchDetections, fetchWeather, fetchAnalyticsReport } from "@/services/api";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [rover, setRover] = useState<any>(null);
  const [detections, setDetections] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }
    if (!isLoading && user?.role === "admin") {
      router.push("/admin");
      return;
    }

    const loadData = async () => {
      try {
        const [repData, wData, roversData, detData] = await Promise.all([
          fetchAnalyticsReport().catch(() => null),
          fetchWeather().catch(() => null),
          fetchRovers().catch(() => []),
          fetchDetections().catch(() => [])
        ]);

        if (repData) setReport(repData);
        if (wData) setWeather(wData);
        if (roversData && roversData.length > 0) setRover(roversData[0]);
        if (detData) setDetections(detData.slice(0, 4));
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) loadData();
  }, [user, isLoading]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#070b09] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center animate-pulse">
            <Radio className="w-7 h-7 text-black" />
          </div>
          <p className="text-emerald-400 text-sm font-mono">Loading Farm Control Center...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-emerald-900/40 bg-gradient-to-r from-emerald-950/80 via-[#0c1410] to-[#070b09]">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-1">
              <Sparkles className="w-4 h-4" /> SunValley Precision Field #1
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Farm Control Center Overview
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-1">
              4WD Autonomous Rover connected • OpenRouter AI Disease Inspection Active
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/rover"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-black font-bold text-xs flex items-center space-x-2 transition-all shadow-lg shadow-emerald-900/50 glow-emerald"
            >
              <Radio className="w-4 h-4" />
              <span>Launch Live Remote Control</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-emerald-900/30 glass-panel-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Farm Health Index</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white mt-2 flex items-baseline gap-1">
              {report?.farm_health_score || "94.2"}%
              <span className="text-[10px] text-emerald-400 font-semibold">+2.1%</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">18.5 Hectares under AI monitoring</p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-emerald-900/30 glass-panel-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Active Rover Status</span>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse glow-emerald" />
            </div>
            <div className="text-xl font-bold text-emerald-300 mt-2">
              {rover?.rover_id || "ROVER-4WD-01"}
            </div>
            <div className="flex items-center space-x-3 text-[11px] text-gray-400 mt-1">
              <span className="flex items-center gap-1"><Battery className="w-3 h-3 text-emerald-400" /> {rover?.battery_pct || 94.5}%</span>
              <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-cyan-400" /> {rover?.spray_tank_pct || 88}% Tank</span>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-emerald-900/30 glass-panel-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">AI Crop Detections</span>
              <ScanEye className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white mt-2 flex items-baseline gap-2">
              {report?.total_scans || "24"}
              <span className="text-[10px] text-amber-400 font-semibold">3 Flagged</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Early Blight & Armyworm detected</p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-emerald-900/30 glass-panel-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Precision Spray Applied</span>
              <Droplets className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-cyan-300 mt-2">
              {report?.total_chemical_sprayed_liters || "10.5"} L
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Targeted Solenoid Pulse Spraying</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-5 rounded-2xl border border-emerald-900/40 bg-gradient-to-b from-[#0c1410] to-[#070b09]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-gray-200 flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" /> Field Weather Conditions
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                Optimal Spray Window
              </span>
            </div>

            <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-emerald-900/20">
              <div>
                <div className="text-3xl font-extrabold text-white">24.5°C</div>
                <div className="text-xs text-gray-400 mt-0.5">Fresno Tomato Block #1</div>
              </div>
              <div className="space-y-1 text-right text-xs text-gray-300 font-mono">
                <div className="flex items-center justify-end gap-1.5"><Wind className="w-3.5 h-3.5 text-cyan-400" /> Wind: 8.2 km/h</div>
                <div className="flex items-center justify-end gap-1.5"><CloudRain className="w-3.5 h-3.5 text-blue-400" /> Rain: 10%</div>
                <div className="flex items-center justify-end gap-1.5"><Droplets className="w-3.5 h-3.5 text-emerald-400" /> Humidity: 58%</div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 mt-4 text-center">
              {weather?.forecast?.map((f: any, idx: number) => (
                <div key={idx} className="bg-black/20 p-2 rounded-lg text-[10px] border border-emerald-900/10">
                  <div className="text-gray-400 font-medium">{f.day.slice(0, 3)}</div>
                  <div className="text-white font-bold my-1">{f.temp_max}°</div>
                  <div className="text-emerald-400 text-[9px]">{f.condition.slice(0, 5)}</div>
                </div>
              )) || [
                { day: "Mon", temp: "26°" }, { day: "Tue", temp: "28°" },
                { day: "Wed", temp: "25°" }, { day: "Thu", temp: "23°" }, { day: "Fri", temp: "27°" }
              ].map((f, idx) => (
                <div key={idx} className="bg-black/20 p-2 rounded-lg text-[10px] border border-emerald-900/10">
                  <div className="text-gray-400 font-medium">{f.day}</div>
                  <div className="text-white font-bold my-1">{f.temp}</div>
                  <div className="text-emerald-400 text-[9px]">Clear</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-emerald-900/40 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-200 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400" /> Rover Telemetry & Camera HUD
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Live Hardware Abstraction Layer Stream</p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 text-xs font-mono border border-emerald-800/40">
                  GPS: 36.7782, -119.4179
                </span>
              </div>
            </div>

            <div className="my-4 relative h-48 rounded-xl overflow-hidden border border-emerald-900/50 bg-[#121c17] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-10" />

              <div className="absolute top-3 left-3 z-20 font-mono text-[10px] space-y-1 text-emerald-300">
                <div>ALT: {rover?.camera_height_cm || 110} cm</div>
                <div>BATTERY: {rover?.battery_pct || 94.5}%</div>
                <div>TANK: {rover?.spray_tank_pct || 88}%</div>
              </div>

              <div className="absolute top-3 right-3 z-20 font-mono text-[10px] bg-red-950/80 text-red-400 border border-red-800 px-2 py-0.5 rounded animate-pulse">
                REC • 1080p
              </div>

              <div className="text-center z-20">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-500/60 flex items-center justify-center mx-auto mb-2 animate-spin-slow">
                  <Radio className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-xs text-emerald-200 font-semibold">Tomato Block A - Lane 3</div>
                <div className="text-[10px] text-gray-400">Autonomous Waypoint Driving Active</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Link
                href="/rover"
                className="p-2.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-800/40 text-center text-xs font-semibold text-emerald-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5" /> Remote Control
              </Link>
              <Link
                href="/missions"
                className="p-2.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-800/40 text-center text-xs font-semibold text-emerald-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> Launch Mission
              </Link>
              <Link
                href="/vision"
                className="p-2.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-800/40 text-center text-xs font-semibold text-emerald-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <ScanEye className="w-3.5 h-3.5" /> AI Scan
              </Link>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-900/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-gray-200 flex items-center gap-2">
                <ScanEye className="w-4 h-4 text-emerald-400" /> Recent AI Crop Disease Detections
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Scanned by OpenRouter Vision Model & Evidence Saved</p>
            </div>
            <Link href="/vision" className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold">
              View All Inspections <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/40 text-gray-400 font-mono border-b border-emerald-900/30">
                <tr>
                  <th className="p-3">Status</th>
                  <th className="p-3">Disease / Condition</th>
                  <th className="p-3">Crop</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">AI Confidence</th>
                  <th className="p-3">Rec. Spray Volume</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/20">
                {detections.length > 0 ? detections.map((d: any) => (
                  <tr key={d.id} className="hover:bg-emerald-950/20 transition-colors">
                    <td className="p-3">
                      {d.is_healthy ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/40 font-semibold flex items-center w-fit gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Healthy
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-400 border border-amber-800/40 font-semibold flex items-center w-fit gap-1">
                          <AlertTriangle className="w-3 h-3" /> Flagged
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-gray-200">{d.label}</td>
                    <td className="p-3 text-gray-400">{d.crop_name || "Roma Tomato"}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.severity === "High" || d.severity === "Critical"
                          ? "bg-red-950 text-red-400 border border-red-800/40"
                          : d.severity === "Medium"
                          ? "bg-amber-950 text-amber-400 border border-amber-800/40"
                          : "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                      }`}>
                        {d.severity}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-emerald-300">{(d.confidence * 100).toFixed(0)}%</td>
                    <td className="p-3 font-mono text-cyan-300">{d.recommended_spray_volume_l_per_ha} L/ha</td>
                    <td className="p-3 text-right">
                      <Link href="/vision" className="text-emerald-400 hover:text-emerald-300 font-semibold">
                        Inspect
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-gray-500">
                      No detections yet. Run an AI Vision Scan to see results here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
