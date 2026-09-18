import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { LifeBuoy, Plus, Clock, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";
import { fetchSupportTickets, createSupportTicket } from "@/services/api";

export default function SupportTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [subject, setSubject] = useState<string>("");
  const [category, setCategory] = useState<string>("Spraying System");
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    fetchSupportTickets().then(data => {
      if (data) setTickets(data);
    }).catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;
    try {
      const created = await createSupportTicket({ subject, category, description, priority: "Medium" });
      setTickets([created, ...tickets]);
      setSubject("");
      setDescription("");
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-emerald-900/40">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <LifeBuoy className="w-6 h-6 text-emerald-400" /> Farmer Technical Support Center
            </h1>
            <p className="text-xs text-gray-400">Raise Hardware Calibration Queries, Software Ticket Reports & AI Vision Assistance</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 text-black font-bold text-xs flex items-center space-x-1.5 transition-all shadow-lg glow-emerald"
          >
            <Plus className="w-4 h-4" /> <span>Raise Support Ticket</span>
          </button>
        </div>

        {showModal && (
          <div className="glass-panel p-5 rounded-2xl border border-emerald-800 bg-[#0d1612] space-y-4">
            <h3 className="font-bold text-sm text-white">Raise New Support Ticket</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Ticket Subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-black/60 border border-emerald-900/50 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-black/60 border border-emerald-900/50 rounded-xl p-3 text-xs text-emerald-300 focus:outline-none"
              >
                <option value="Spraying System">Spraying System Calibration</option>
                <option value="Rover Hardware">Rover Motor / Actuator Hardware</option>
                <option value="AI Vision">AI Disease Detection Assistance</option>
                <option value="Autonomous Navigation">GPS Autonomous Navigation</option>
              </select>
              <textarea
                placeholder="Describe your issue or technical question in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-black/60 border border-emerald-900/50 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-black font-bold text-xs"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-3">
          {tickets.map((t: any) => (
            <div key={t.id} className="glass-panel p-4 rounded-xl border border-emerald-900/30 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-emerald-400 text-xs">#TICK-0{t.id}</span>
                  <span className="font-bold text-sm text-gray-200">{t.subject}</span>
                </div>
                <div className="text-xs text-gray-400">{t.description}</div>
                <div className="text-[10px] text-emerald-500 font-mono">Category: {t.category}</div>
              </div>

              <div className="text-right">
                <span className={`px-2.5 py-1 rounded text-xs font-extrabold ${
                  t.status === "OPEN" ? "bg-amber-950 text-amber-400 border border-amber-800" : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                }`}>
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
