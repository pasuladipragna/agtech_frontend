import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { api } from '../../services/api';
import { Settings, Shield, Cpu, Wifi, Database, Save, Loader2, CheckCircle2 } from 'lucide-react';

interface SystemSettings {
  ai_vision_confidence_threshold: number;
  auto_spray_enabled: boolean;
  max_wind_speed_for_spray_kmh: number;
  mqtt_broker_status: string;
  mqtt_broker_host: string;
  system_maintenance_mode: boolean;
  telemetry_polling_interval_sec: number;
  backup_last_completed: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings');
        setSettings(res.data);
      } catch (err) {
        console.error('Failed to load system settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSuccessMsg('');
    try {
      await api.put('/admin/settings', settings);
      setSuccessMsg('System configuration saved successfully.');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-gray-500">Loading system configuration...</div>;
  }

  return (
    <div>
      <Head>
        <title>Platform Settings - Admin - Smart AgriTech</title>
        <meta name="description" content="Configure AI models, IoT safety parameters, and platform operational modes." />
      </Head>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="h-7 w-7 text-agri-green" />
          Platform & IoT System Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Global autonomous parameters, AI vision model sensitivity, and system safety constraints.
        </p>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 border border-green-200">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {/* AI & Vision Settings */}
        <div className="bg-white rounded-xl border border-agri-beige p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-agri-green" />
            AI Vision & Disease Detection
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AI Confidence Threshold ({Math.round(settings.ai_vision_confidence_threshold * 100)}%)
              </label>
              <input
                type="range"
                min="0.50"
                max="0.99"
                step="0.01"
                value={settings.ai_vision_confidence_threshold}
                onChange={e => setSettings({ ...settings, ai_vision_confidence_threshold: parseFloat(e.target.value) })}
                className="w-full accent-agri-green cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">
                Minimum classification probability before flagging crop disease to farmer.
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
              <div>
                <span className="font-semibold text-sm text-gray-800">Auto-Target Spraying Trigger</span>
                <p className="text-xs text-gray-500">Automatically activate nozzles when high-confidence disease detected.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.auto_spray_enabled}
                onChange={e => setSettings({ ...settings, auto_spray_enabled: e.target.checked })}
                className="h-5 w-5 text-agri-green rounded border-gray-300 focus:ring-agri-green"
              />
            </div>
          </div>
        </div>

        {/* Safety & Environment Constraints */}
        <div className="bg-white rounded-xl border border-agri-beige p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Agronomic Safety Limits
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Allowed Wind Speed for Spraying (km/h)
              </label>
              <input
                type="number"
                min="5"
                max="40"
                value={settings.max_wind_speed_for_spray_kmh}
                onChange={e => setSettings({ ...settings, max_wind_speed_for_spray_kmh: parseFloat(e.target.value) })}
                className="input-field"
              />
              <p className="text-xs text-gray-400 mt-1">
                Spraying will be aborted automatically if wind speed exceeds this limit to avoid drift.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telemetry Polling Interval (Seconds)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.telemetry_polling_interval_sec}
                onChange={e => setSettings({ ...settings, telemetry_polling_interval_sec: parseInt(e.target.value) })}
                className="input-field"
              />
              <p className="text-xs text-gray-400 mt-1">
                Frequency at which rovers transmit live sensor and battery state.
              </p>
            </div>
          </div>
        </div>

        {/* IoT & Infrastructure */}
        <div className="bg-white rounded-xl border border-agri-beige p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Wifi className="h-5 w-5 text-purple-500" />
            IoT Broker & Connectivity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg border">
              <span className="text-xs text-gray-500">MQTT Broker Host</span>
              <div className="font-mono text-sm font-semibold text-gray-800 mt-1">{settings.mqtt_broker_host}</div>
              <div className="mt-2 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                <span className="text-xs font-semibold text-green-700">{settings.mqtt_broker_status}</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border">
              <span className="text-xs text-gray-500">Database & System Health</span>
              <div className="text-sm font-semibold text-gray-800 mt-1">PostgreSQL & SQLite Active</div>
              <div className="text-xs text-gray-400 mt-1">
                Last integrity snapshot: {new Date(settings.backup_last_completed).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2 text-base px-6 py-2.5"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Save System Settings
          </button>
        </div>
      </form>
    </div>
  );
}
