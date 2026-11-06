import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { TERMS } from '../../constants/terminology';
import { User, Mail, Phone, MapPin, Save, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

interface ProfileData {
  full_name: string;
  email: string;
  phone?: string;
  village?: string;
  district?: string;
  state?: string;
  country?: string;
  experience_years?: number;
  bio?: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    village: '',
    district: '',
    state: '',
    country: '',
    experience_years: undefined,
    bio: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/farmer/profile');
        setProfile(response.data);
      } catch {
        setError('Failed to load your profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await api.put('/farmer/profile', profile);
      setSuccess('Profile updated successfully.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof ProfileData, value: string | number) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-agri-green" />
        Loading profile...
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>My Profile - Smart AgriTech</title>
        <meta name="description" content="View and update your farmer profile information." />
      </Head>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="h-6 w-6 sm:h-7 sm:w-7 text-agri-green flex-shrink-0" />
          My Profile
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your {TERMS.farmer.toLowerCase()} account information and contact details.
        </p>
      </div>

      <div className="max-w-2xl">
        {/* Avatar Card */}
        <div className="bg-white rounded-xl border border-agri-beige shadow-sm p-5 sm:p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-agri-green to-emerald-700 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold flex-shrink-0">
            {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <p className="text-base sm:text-lg font-bold text-gray-900">{profile.full_name || 'Unnamed Farmer'}</p>
            <p className="text-sm text-gray-500">{profile.email}</p>
            <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {TERMS.farmer}
            </span>
          </div>
        </div>

        {success && (
          <div className="mb-5 flex items-center gap-2 p-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            {success}
          </div>
        )}
        {error && (
          <div className="mb-5 flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={saveProfile} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-agri-beige shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-agri-green" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={e => handleChange('full_name', e.target.value)}
                  className="w-full input"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={profile.email}
                    onChange={e => handleChange('email', e.target.value)}
                    className="w-full input pl-9"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={e => handleChange('phone', e.target.value)}
                    className="w-full input pl-9"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Farming Experience</label>
                <input
                  type="number"
                  value={profile.experience_years || ''}
                  onChange={e => handleChange('experience_years', parseInt(e.target.value))}
                  className="w-full input"
                  placeholder="e.g. 10"
                  min={0}
                  max={70}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio (optional)</label>
                <textarea
                  value={profile.bio || ''}
                  onChange={e => handleChange('bio', e.target.value)}
                  rows={3}
                  className="w-full input"
                  placeholder="Tell other farmers about yourself..."
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl border border-agri-beige shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-agri-green" />
              Location
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Village / Town</label>
                <input
                  type="text"
                  value={profile.village || ''}
                  onChange={e => handleChange('village', e.target.value)}
                  className="w-full input"
                  placeholder="Your village or town"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <input
                  type="text"
                  value={profile.district || ''}
                  onChange={e => handleChange('district', e.target.value)}
                  className="w-full input"
                  placeholder="District"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                <input
                  type="text"
                  value={profile.state || ''}
                  onChange={e => handleChange('state', e.target.value)}
                  className="w-full input"
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={profile.country || ''}
                  onChange={e => handleChange('country', e.target.value)}
                  className="w-full input"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Saving Changes...</>
            ) : (
              <><Save className="h-4 w-4" />Save Profile</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
