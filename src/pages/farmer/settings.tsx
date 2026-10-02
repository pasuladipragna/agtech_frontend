import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { api } from '../../services/api';
import { TERMS } from '../../constants/terminology';
import { Settings, Lock, Bell, Map, Save, Loader2, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface FarmSettings {
  farm_name: string;
  location_lat?: number;
  location_lng?: number;
  weather_location?: string;
  timezone: string;
  auto_spray_enabled: boolean;
  auto_scan_enabled: boolean;
  spray_interval_hours: number;
  scan_interval_hours: number;
  alert_email_enabled: boolean;
  alert_sms_enabled: boolean;
  alert_phone?: string;
}

interface PasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const TIMEZONES = [
  'Asia/Kolkata', 'Asia/Dhaka', 'Asia/Karachi', 'Asia/Bangkok',
  'Africa/Lagos', 'America/New_York', 'America/Chicago', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Australia/Sydney',
];

export default function SettingsPage() {
  const [farmSettings, setFarmSettings] = useState<FarmSettings>({
    farm_name: '',
    weather_location: '',
    timezone: 'Asia/Kolkata',
    auto_spray_enabled: false,
    auto_scan_enabled: true,
    spray_interval_hours: 24,
    scan_interval_hours: 6,
    alert_email_enabled: true,
    alert_sms_enabled: false,
    alert_phone: '',
  });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    current_password: '', new_password: '', confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(true);
  const [savingFarm, setSavingFarm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [farmMsg, setFarmMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/farmer/settings');
        setFarmSettings(prev => ({ ...prev, ...response.data }));
      } catch { /* use defaults */ }
      finally { setLoading(false); }
    };
    fetchSettings();
  }, []);

  const saveFarmSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFarm(true);
    setFarmMsg(null);
    try {
      await api.put('/farmer/settings', farmSettings);
      setFarmMsg({ type: 'success', text: 'Farm settings saved successfully.' });
    } catch (err: any) {
      setFarmMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to save settings.' });
    } finally {
      setSavingFarm(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPassMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (passwordForm.new_password.length < 8) {
      setPassMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    setSavingPassword(true);
    setPassMsg(null);
    try {
      await api.post('/auth/change-password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPassMsg({ type: 'success', text: 'Password changed successfully.' });
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      setPassMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to change password.' });
    } finally {
      setSavingPassword(false);
    }
  };

  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-gray-700">{label}</span>
      <div
        className={`relative w-10 h-6 rounded-full transition-colors ${checked ? 'bg-agri-green' : 'bg-gray-300'}`}
        onClick={() => onChange(!checked)}
      >
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </div>
    </label>
  );

  const MessageBanner = ({ msg }: { msg: { type: 'success' | 'error'; text: string } }) => (
    <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
      msg.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-700'
    }`}>
      {msg.type === 'success' ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <AlertTriangle className="h-4 w-4 flex-shrink-0" />}
      {msg.text}
    </div>
  );

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-agri-green" />
        Loading settings...
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>Settings - Smart AgriTech</title>
        <meta name="description" content="Configure your farm settings, automation preferences, and account security." />
      </Head>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="h-6 w-6 sm:h-7 sm:w-7 text-agri-green flex-shrink-0" />
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure your {TERMS.farm.toLowerCase()} preferences, automation, and account security.
        </p>
      </div>

      <div className="max-w-2xl w-full space-y-6 sm:space-y-8">

        {/* Farm Settings */}
        <form onSubmit={saveFarmSettings} className="bg-white rounded-xl border border-agri-beige shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <Map className="h-5 w-5 text-agri-green" />
            <h2 className="font-semibold text-gray-900">{TERMS.farm} Settings</h2>
          </div>
          <div className="p-6 space-y-4">
            {farmMsg && <MessageBanner msg={farmMsg} />}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{TERMS.farm} Name</label>
              <input
                type="text"
                value={farmSettings.farm_name}
                onChange={e => setFarmSettings(p => ({ ...p, farm_name: e.target.value }))}
                className="w-full input"
                placeholder="My Green Farm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weather Location</label>
              <input
                type="text"
                value={farmSettings.weather_location || ''}
                onChange={e => setFarmSettings(p => ({ ...p, weather_location: e.target.value }))}
                className="w-full input"
                placeholder="City or coordinates for weather data (e.g. Pune, India)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select
                value={farmSettings.timezone}
                onChange={e => setFarmSettings(p => ({ ...p, timezone: e.target.value }))}
                className="w-full input"
              >
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>
          </div>
          <div className="px-6 pb-6">
            <button type="submit" className="btn-primary" disabled={savingFarm}>
              {savingFarm ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : <><Save className="h-4 w-4" />Save Farm Settings</>}
            </button>
          </div>
        </form>

        {/* Automation Settings */}
        <div className="bg-white rounded-xl border border-agri-beige shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <Settings className="h-5 w-5 text-agri-green" />
            <h2 className="font-semibold text-gray-900">Automation</h2>
          </div>
          <div className="p-6 space-y-5">
            <Toggle
              checked={farmSettings.auto_scan_enabled}
              onChange={v => setFarmSettings(p => ({ ...p, auto_scan_enabled: v }))}
              label="Enable automatic crop health scans"
            />
            {farmSettings.auto_scan_enabled && (
              <div className="ml-2">
                <label className="block text-sm text-gray-600 mb-1">Scan interval (hours)</label>
                <input
                  type="number"
                  value={farmSettings.scan_interval_hours}
                  onChange={e => setFarmSettings(p => ({ ...p, scan_interval_hours: parseInt(e.target.value) }))}
                  className="w-32 input"
                  min={1}
                  max={168}
                />
              </div>
            )}
            <Toggle
              checked={farmSettings.auto_spray_enabled}
              onChange={v => setFarmSettings(p => ({ ...p, auto_spray_enabled: v }))}
              label="Enable automatic spraying when problem detected"
            />
            {farmSettings.auto_spray_enabled && (
              <div className="ml-2">
                <label className="block text-sm text-gray-600 mb-1">Min spray interval (hours)</label>
                <input
                  type="number"
                  value={farmSettings.spray_interval_hours}
                  onChange={e => setFarmSettings(p => ({ ...p, spray_interval_hours: parseInt(e.target.value) }))}
                  className="w-32 input"
                  min={4}
                  max={720}
                />
              </div>
            )}
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-xl border border-agri-beige shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <Bell className="h-5 w-5 text-agri-green" />
            <h2 className="font-semibold text-gray-900">{TERMS.notifications}</h2>
          </div>
          <div className="p-6 space-y-5">
            <Toggle
              checked={farmSettings.alert_email_enabled}
              onChange={v => setFarmSettings(p => ({ ...p, alert_email_enabled: v }))}
              label="Email alerts for crop problems"
            />
            <Toggle
              checked={farmSettings.alert_sms_enabled}
              onChange={v => setFarmSettings(p => ({ ...p, alert_sms_enabled: v }))}
              label="SMS alerts for critical events"
            />
            {farmSettings.alert_sms_enabled && (
              <div className="ml-2">
                <label className="block text-sm text-gray-600 mb-1">SMS Phone Number</label>
                <input
                  type="tel"
                  value={farmSettings.alert_phone || ''}
                  onChange={e => setFarmSettings(p => ({ ...p, alert_phone: e.target.value }))}
                  className="w-full input"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            )}
          </div>
        </div>

        {/* Change Password */}
        <form onSubmit={changePassword} className="bg-white rounded-xl border border-agri-beige shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <Lock className="h-5 w-5 text-agri-green" />
            <h2 className="font-semibold text-gray-900">Change Password</h2>
          </div>
          <div className="p-6 space-y-4">
            {passMsg && <MessageBanner msg={passMsg} />}
            {(['current', 'new', 'confirm'] as const).map(field => {
              const labels: Record<string, string> = {
                current: 'Current Password',
                new: 'New Password',
                confirm: 'Confirm New Password',
              };
              const keys: Record<string, keyof PasswordForm> = {
                current: 'current_password',
                new: 'new_password',
                confirm: 'confirm_password',
              };
              return (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{labels[field]}</label>
                  <div className="relative">
                    <input
                      type={showPassword[field] ? 'text' : 'password'}
                      value={passwordForm[keys[field]]}
                      onChange={e => setPasswordForm(p => ({ ...p, [keys[field]]: e.target.value }))}
                      className="w-full input pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => ({ ...p, [field]: !p[field] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-6 pb-6">
            <button type="submit" className="btn-primary" disabled={savingPassword}>
              {savingPassword ? <><Loader2 className="h-4 w-4 animate-spin" />Updating...</> : <><Lock className="h-4 w-4" />Change Password</>}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
