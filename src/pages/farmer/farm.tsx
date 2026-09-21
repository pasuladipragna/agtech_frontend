import React, { useEffect, useState, useRef, useCallback } from 'react';
import Head from 'next/head';
import { api } from '../../services/api';
import { TERMS } from '../../constants/terminology';
import EmptyState from '../../components/ui/EmptyState';
import {
  Map, Edit2, Loader2, Save, Plus, CheckCircle2,
  Navigation, MapPin, AlertCircle, Search, X, Cloud
} from 'lucide-react';

interface Farm {
  id: string;
  name: string;
  location_name: string;
  total_area_hectares: number;
  main_crop_types: string;
  description: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface GeoSuggestion {
  label: string;
  latitude: number;
  longitude: number;
  country: string;
  timezone: string;
}

export default function FarmPage() {
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Farm>>({
    name: '',
    location_name: '',
    total_area_hectares: 5.0,
    main_crop_types: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ── Location panel ──
  const [showLocationPanel, setShowLocationPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<GeoSuggestion | null>(null);
  const [savingLoc, setSavingLoc] = useState(false);
  const [locError, setLocError] = useState('');
  const [locSuccess, setLocSuccess] = useState('');
  const [gettingGPS, setGettingGPS] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchFarm = async () => {
    try {
      const response = await api.get('/farms');
      if (response.data && response.data.length > 0) {
        const f = response.data[0];
        setFarm(f);
        setFormData(f);
        setSearchQuery(f.location_name || '');
      } else {
        setFarm(null);
      }
    } catch {
      setError('Failed to load farm details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFarm(); }, []);

  // Debounced geocode search
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setSelectedSuggestion(null);
    setSuggestions([]);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (val.trim().length < 2) return;
    searchDebounce.current = setTimeout(() => doGeocode(val.trim()), 450);
  };

  const doGeocode = async (q: string) => {
    setSearching(true);
    setLocError('');
    try {
      const res = await api.get(`/farmer/geocode?q=${encodeURIComponent(q)}`);
      setSuggestions(res.data.suggestions || []);
    } catch {
      setLocError('Location search failed. Check your connection and try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSuggestion = (s: GeoSuggestion) => {
    setSelectedSuggestion(s);
    setSearchQuery(s.label);
    setSuggestions([]);
    setLocError('');
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    setGettingGPS(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        // Reverse-geocode to get a place name
        try {
          const res = await api.get(`/farmer/geocode?q=${lat.toFixed(3)},${lon.toFixed(3)}`);
          const first = res.data.suggestions?.[0];
          const label = first?.label || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
          setSelectedSuggestion({ label, latitude: lat, longitude: lon, country: '', timezone: '' });
          setSearchQuery(label);
          setSuggestions([]);
        } catch {
          // Fallback — just use the raw coords
          const label = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
          setSelectedSuggestion({ label, latitude: lat, longitude: lon, country: '', timezone: '' });
          setSearchQuery(label);
        }
        setGettingGPS(false);
      },
      () => {
        setLocError('Could not get GPS position. Please allow location access or search by name.');
        setGettingGPS(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farm || !selectedSuggestion) return;
    setLocError('');
    setLocSuccess('');
    setSavingLoc(true);
    try {
      const res = await api.patch(`/farms/${farm.id}/location`, {
        location_name: selectedSuggestion.label,
        latitude: selectedSuggestion.latitude,
        longitude: selectedSuggestion.longitude,
      });
      setFarm(prev => prev ? {
        ...prev,
        location_name: res.data.location_name,
        latitude: res.data.latitude,
        longitude: res.data.longitude,
      } : prev);
      setLocSuccess('Location saved! Weather will now show live conditions for this area.');
      setTimeout(() => { setShowLocationPanel(false); setLocSuccess(''); }, 1800);
    } catch (err: any) {
      setLocError(err.response?.data?.detail || 'Failed to update location.');
    } finally {
      setSavingLoc(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (farm && !isCreating) {
        const response = await api.put(`/farms/${farm.id}`, formData);
        setFarm(response.data);
      } else {
        const response = await api.post('/farms', formData);
        setFarm(response.data);
        setIsCreating(false);
      }
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save farm details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-agri-green animate-spin" />
      </div>
    );
  }

  const hasCoords = farm?.latitude != null && farm?.longitude != null;

  return (
    <div>
      <Head>
        <title>My {TERMS.farm} - Smart AgriTech</title>
        <meta name="description" content="Manage your farm profile, geographic location, and crop details." />
      </Head>

      {/* Header */}
      <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Map className="h-7 w-7 text-agri-green" />
            My {TERMS.farm} Profile
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your {TERMS.farm.toLowerCase()} details and set your location for live weather data.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {farm && !isEditing && (
            <>
              <button
                id="btn-set-location"
                onClick={() => { setShowLocationPanel(v => !v); setLocError(''); setLocSuccess(''); setSuggestions([]); }}
                className="btn-outline flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                {hasCoords ? 'Change Location' : 'Set Farm Location'}
              </button>
              <button onClick={() => setIsEditing(true)} className="btn-outline flex items-center gap-2">
                <Edit2 className="h-4 w-4" />
                Edit Details
              </button>
            </>
          )}
          {!farm && !isCreating && (
            <button onClick={() => setIsCreating(true)} className="btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Farm Details
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ── Location Panel ── */}
      {farm && showLocationPanel && (
        <div className="mb-6 bg-white rounded-xl border border-sky-200 shadow-sm overflow-visible">
          <div className="px-6 py-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-blue-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-sky-600" />
              <h3 className="font-bold text-gray-900 text-base">Set Weather Location</h3>
              <span className="text-xs text-sky-600 bg-sky-100 rounded-full px-2 py-0.5 font-medium">Live Weather</span>
            </div>
            <button onClick={() => { setShowLocationPanel(false); setSuggestions([]); }}
              className="text-gray-400 hover:text-gray-600 transition">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSaveLocation} className="p-6 space-y-5">
            <p className="text-sm text-gray-500">
              Search for your farm's nearest town, village, or district. The weather module will fetch{' '}
              <strong>real-time conditions</strong> from that location automatically.
            </p>

            {locError && (
              <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {locError}
              </div>
            )}
            {locSuccess && (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                {locSuccess}
              </div>
            )}

            {/* Search Box */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Search Location <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  id="input-location-search"
                  type="text"
                  value={searchQuery}
                  onChange={e => handleSearchChange(e.target.value)}
                  placeholder="Type city, district, or region... e.g. Pune, Salinas Valley"
                  className="w-full input pl-10 pr-10"
                  autoComplete="off"
                />
                {searching && (
                  <Loader2 className="absolute right-3 h-4 w-4 text-agri-green animate-spin" />
                )}
                {!searching && searchQuery && (
                  <button type="button"
                    onClick={() => { setSearchQuery(''); setSuggestions([]); setSelectedSuggestion(null); }}
                    className="absolute right-3 text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute z-30 w-full mt-1 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full text-left px-4 py-3 hover:bg-agri-green/5 transition-colors flex items-center gap-3 border-b last:border-0 border-gray-50"
                    >
                      <MapPin className="h-4 w-4 text-agri-green flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{s.label}</p>
                        {s.timezone && (
                          <p className="text-xs text-gray-400">{s.timezone}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No results */}
              {!searching && searchQuery.length >= 2 && suggestions.length === 0 && !selectedSuggestion && (
                <p className="text-xs text-gray-400 mt-1.5">No matching locations found. Try a different name.</p>
              )}
            </div>

            {/* Selected location confirmation */}
            {selectedSuggestion && (
              <div className="flex items-center gap-3 bg-agri-green/5 border border-agri-green/30 rounded-xl p-4">
                <CheckCircle2 className="h-5 w-5 text-agri-green flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedSuggestion.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Coordinates: {selectedSuggestion.latitude.toFixed(4)}, {selectedSuggestion.longitude.toFixed(4)}
                    {selectedSuggestion.timezone && ` · ${selectedSuggestion.timezone}`}
                  </p>
                </div>
              </div>
            )}

            {/* GPS Button */}
            <div className="border-t border-gray-100 pt-4 flex items-center justify-between flex-wrap gap-3">
              <button
                type="button"
                id="btn-use-gps"
                onClick={handleUseCurrentLocation}
                disabled={gettingGPS}
                className="flex items-center gap-2 text-sm text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-4 py-2 rounded-lg transition font-medium disabled:opacity-60"
              >
                {gettingGPS
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Detecting...</>
                  : <><Navigation className="h-4 w-4" />Use My Current Location</>
                }
              </button>
              <p className="text-xs text-gray-400">Browser GPS — allow location permission when prompted.</p>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                id="btn-save-location"
                disabled={savingLoc || !selectedSuggestion}
                className="btn-primary flex items-center gap-2"
              >
                {savingLoc
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
                  : <><Save className="h-4 w-4" />Save Location</>
                }
              </button>
              <button type="button" onClick={() => { setShowLocationPanel(false); setSuggestions([]); }}
                className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ── GPS Status Banner ── */}
      {farm && !showLocationPanel && (
        <div className={`mb-6 flex items-center gap-3 px-5 py-3.5 rounded-xl border text-sm ${
          hasCoords
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <MapPin className={`h-4 w-4 flex-shrink-0 ${hasCoords ? 'text-green-600' : 'text-amber-500'}`} />
          {hasCoords ? (
            <span>
              <strong>Weather location set:</strong> {farm.location_name} — live weather data active.{' '}
              <button onClick={() => setShowLocationPanel(true)}
                className="underline font-semibold hover:text-green-900">Change →</button>
            </span>
          ) : (
            <span>
              <strong>No location set.</strong> Weather page uses a regional default.{' '}
              <button onClick={() => setShowLocationPanel(true)}
                className="underline font-semibold hover:text-amber-900">Set your farm location →</button>
            </span>
          )}
        </div>
      )}

      {/* ── Farm Profile Card ── */}
      {!farm && !isCreating ? (
        <EmptyState
          icon={Map}
          title={`No ${TERMS.farm} Profile Found`}
          description="Create your farm profile to start tracking crop health and assigning autonomous rovers."
          action={{ label: 'Add Farm Details', onClick: () => setIsCreating(true) }}
        />
      ) : (
        <div className="bg-white shadow-sm rounded-xl border border-agri-beige overflow-hidden">
          {isEditing || isCreating ? (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-3">
                {isCreating ? 'Create Farm Profile' : 'Edit Farm Information'}
              </h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">{TERMS.farm} Name *</label>
                  <input
                    type="text" name="name" required
                    value={formData.name || ''} onChange={handleFormChange}
                    placeholder="e.g. Sunny Brook Organic Estate"
                    className="mt-1 input-field"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Location / Region *</label>
                  <input
                    type="text" name="location_name" required
                    value={formData.location_name || ''} onChange={handleFormChange}
                    placeholder="e.g. Salinas Valley, District 4"
                    className="mt-1 input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Area (Hectares) *</label>
                  <input
                    type="number" step="0.1" name="total_area_hectares" required
                    value={formData.total_area_hectares || ''} onChange={handleFormChange}
                    className="mt-1 input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Main {TERMS.crop} Types</label>
                  <input
                    type="text" name="main_crop_types"
                    value={formData.main_crop_types || ''} onChange={handleFormChange}
                    placeholder="e.g. Wheat, Barley, Potatoes"
                    className="mt-1 input-field"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description / Soil & Irrigation Notes</label>
                  <textarea
                    name="description" rows={3}
                    value={formData.description || ''} onChange={handleFormChange}
                    placeholder="Soil composition, drip irrigation lines, terrain notes..."
                    className="mt-1 input-field"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => { setIsEditing(false); setIsCreating(false); }}
                  className="btn-outline">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Farm Details
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{TERMS.farm} Name</dt>
                  <dd className="mt-1 text-xl font-bold text-gray-900">{farm?.name}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location / Region</dt>
                  <dd className="mt-1 text-lg font-medium text-gray-900 flex items-center gap-1.5">
                    {hasCoords && <MapPin className="h-4 w-4 text-agri-green" />}
                    {farm?.location_name}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Farm Area</dt>
                  <dd className="mt-1 text-lg font-semibold text-agri-green">
                    {farm?.total_area_hectares ? `${farm.total_area_hectares} Hectares` : 'Not specified'}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Main Planted {TERMS.crop}s</dt>
                  <dd className="mt-1 text-lg text-gray-900">{farm?.main_crop_types || 'Not specified'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description & Field Notes</dt>
                  <dd className="mt-1 text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                    {farm?.description || 'No description provided.'}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
