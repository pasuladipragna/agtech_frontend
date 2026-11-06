import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { User, ShieldCheck, KeyRound, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export default function AdminProfilePage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccess('');
    setPassError('');

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setPassError('Password must be at least 8 characters long.');
      return;
    }

    setSavingPassword(true);
    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPassSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassError(err.response?.data?.detail || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div>
      <Head>
        <title>Admin Profile & Security - Smart AgriTech</title>
        <meta name="description" content="Manage administrator credentials and account security." />
      </Head>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="h-7 w-7 text-agri-green" />
          Administrator Profile
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Account credentials, security tokens, and administrative privileges.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Info Card */}
        <div className="bg-white rounded-xl border border-agri-beige p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b">
            <div className="h-16 w-16 rounded-full bg-agri-green/10 flex items-center justify-center text-agri-green font-bold text-2xl border-2 border-agri-green">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{user?.full_name || 'System Administrator'}</h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="inline-flex items-center gap-1 mt-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                <ShieldCheck className="h-3 w-3" /> System Super Administrator
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account ID</label>
              <p className="font-mono text-sm text-gray-800 mt-0.5">{user?.id || 'admin-root'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Privilege Tier</label>
              <p className="text-sm text-gray-800 mt-0.5">Full Read / Write / Dispatch / Provisioning</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Authentication Scope</label>
              <p className="text-sm text-gray-800 mt-0.5">Bearer JWT Token with 24h expiration</p>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-xl border border-agri-beige p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-agri-green" />
            Update Security Password
          </h3>

          {passSuccess && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2 border border-green-200">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {passSuccess}
            </div>
          )}

          {passError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2 border border-red-200">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {passError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password *</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password *</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="w-full btn-primary flex justify-center items-center gap-2"
            >
              {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              Update Admin Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
