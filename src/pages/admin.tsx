import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { ShieldAlert, Users, Radio, ShoppingBag, FileText, Activity } from "lucide-react";
import { fetchRovers, fetchProducts, fetchAuditLogs, fetchSupportTickets } from "@/services/api";

export default function AdminPanel() {
  const [rovers, setRovers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetchRovers().catch(() => []),
      fetchProducts().catch(() => []),
      fetchAuditLogs().catch(() => []),
      fetchSupportTickets().catch(() => [])
    ]).then(([r, p, a, t]) => {
      if (r) setRovers(r);
      if (p) setProducts(p);
      if (a) setAuditLogs(a);
      if (t) setTickets(t);
    });
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-emerald-900/40">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-red-400" /> Platform Admin Control Panel
            </h1>
            <p className="text-xs text-gray-400">Fleet Rover Management, Product Input Catalog & System Security Audit Trail</p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-lg bg-red-950 text-red-400 text-xs font-mono font-bold border border-red-800">
              ADMIN ROLE ACTIVE
            </span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-900/40">
          <h3 className="font-bold text-sm text-gray-200 mb-4 flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" /> Fleet Rover Registry & Status
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rovers.map(r => (
              <div key={r.id} className="bg-black/40 p-4 rounded-xl border border-emerald-900/30 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white text-sm">{r.name}</div>
                  <div className="text-xs font-mono text-emerald-400">{r.rover_id}</div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    Battery: {r.battery_pct}% | Tank: {r.spray_tank_pct}% | Height: {r.camera_height_cm}cm
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 font-bold text-xs border border-emerald-800">
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-900/40">
          <h3 className="font-bold text-sm text-gray-200 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-cyan-400" /> Agricultural Products Catalog (Fertilizers / Pesticides / Parts)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-black/40 p-4 rounded-xl border border-emerald-900/30 flex flex-col justify-between space-y-2">
                <div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[9px] font-bold border border-emerald-800">
                    {p.category}
                  </span>
                  <div className="font-bold text-white text-sm mt-1">{p.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{p.description}</div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-emerald-900/20">
                  <span className="font-mono text-cyan-300 font-bold text-sm">${p.price.toFixed(2)}</span>
                  <span className="text-[10px] text-gray-400">Stock: {p.stock_quantity} units</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-900/40">
          <h3 className="font-bold text-sm text-gray-200 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" /> System Security & High-Level Command Audit Log
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/40 text-gray-400 font-mono border-b border-emerald-900/30">
                <tr>
                  <th className="p-3">Actor Email</th>
                  <th className="p-3">Action Command</th>
                  <th className="p-3">Details</th>
                  <th className="p-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/20">
                {auditLogs.map((a: any) => (
                  <tr key={a.id} className="hover:bg-emerald-950/20 transition-colors">
                    <td className="p-3 font-semibold text-gray-200">{a.actor_email}</td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">{a.action}</td>
                    <td className="p-3 text-gray-400">{a.details}</td>
                    <td className="p-3 text-right text-gray-400 font-mono">
                      {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
