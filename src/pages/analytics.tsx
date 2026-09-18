import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { BarChart3, Download, TrendingUp, ShieldCheck, Activity, Calendar, FileText } from "lucide-react";
import { fetchAnalyticsReport } from "@/services/api";

export default function AnalyticsReports() {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    fetchAnalyticsReport().then(data => {
      if (data) setReport(data);
    }).catch(err => console.error(err));
  }, []);

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,Metric,Value\n" +
      "Farm Health Score," + (report?.farm_health_score || 92.4) + "%\n" +
      "Total Chemical Sprayed," + (report?.total_chemical_sprayed_liters || 10.5) + " L\n" +
      "Yield Forecast," + (report?.yield_forecast_tons || 42.5) + " Tons\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "AgriTech_Farm_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-emerald-900/40">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-emerald-400" /> Precision Analytics & Export Reports
            </h1>
            <p className="text-xs text-gray-400">Crop Health Index, Chemical Spray Usage & Rover Performance Trends</p>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-black font-bold text-xs flex items-center space-x-2 transition-all shadow-lg glow-emerald"
            >
              <Download className="w-4 h-4" /> <span>Export CSV / PDF Report</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-panel p-5 rounded-2xl border border-emerald-900/40">
            <div className="text-xs text-gray-400">Overall Farm Health Score</div>
            <div className="text-3xl font-extrabold text-white mt-1">{report?.farm_health_score || "92.4"}%</div>
            <div className="text-xs text-emerald-400 mt-1 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +3.2% vs last month
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-emerald-900/40">
            <div className="text-xs text-gray-400">Yield Forecast Projection</div>
            <div className="text-3xl font-extrabold text-cyan-300 mt-1">{report?.yield_forecast_tons || "42.5"} Tons</div>
            <div className="text-xs text-gray-400 mt-1">Estimated Harvest: Nov 2026</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-emerald-900/40">
            <div className="text-xs text-gray-400">Chemical Cost Savings</div>
            <div className="text-3xl font-extrabold text-emerald-300 mt-1">$1,480.00</div>
            <div className="text-xs text-emerald-400 font-semibold mt-1">Saved via Targeted Pulse Spraying</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-5 rounded-2xl border border-emerald-900/40">
            <h3 className="font-bold text-sm text-gray-200 mb-4">Weekly Chemical Spray Consumption (L)</h3>
            <div className="space-y-3">
              {(report?.spray_trend || [
                { date: "Mon", volume_l: 12.5 },
                { date: "Tue", volume_l: 18.0 },
                { date: "Wed", volume_l: 8.5 },
                { date: "Thu", volume_l: 24.0 },
                { date: "Fri", volume_l: 15.0 },
                { date: "Sat", volume_l: 30.5 },
                { date: "Sun", volume_l: 10.0 }
              ]).map((item: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-gray-400">{item.date}</span>
                    <span className="text-cyan-300 font-bold">{item.volume_l} Liters</span>
                  </div>
                  <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-emerald-900/30">
                    <div
                      className="bg-cyan-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, (item.volume_l / 35.0) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-emerald-900/40">
            <h3 className="font-bold text-sm text-gray-200 mb-4">Pest & Disease Infection Category Distribution</h3>
            <div className="space-y-4">
              {(report?.disease_breakdown || [
                { name: "Early Blight (Fungus)", count: 8, pct: 40.0 },
                { name: "Corn Armyworm (Pest)", count: 6, pct: 30.0 },
                { name: "Striped Rust (Fungus)", count: 4, pct: 20.0 },
                { name: "Nutrient Deficiency", count: 2, pct: 10.0 }
              ]).map((d: any, idx: number) => (
                <div key={idx} className="bg-black/40 p-3 rounded-xl border border-emerald-900/30 space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-200">{d.name}</span>
                    <span className="text-emerald-400">{d.pct}% ({d.count} Scans)</span>
                  </div>
                  <div className="w-full bg-black/80 rounded-full h-2 overflow-hidden border border-emerald-900/30">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${d.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
