import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { api } from '../../services/api';
import { TERMS } from '../../constants/terminology';
import {
  Cloud, Wind, Droplets, Thermometer, Sun, AlertTriangle,
  RefreshCw, MapPin, Search, Loader2, X, CheckCircle2, AlertCircle
} from 'lucide-react';

interface WeatherData {
  location: string;
  latitude: number;
  longitude: number;
  has_custom_coords: boolean;
  farm_has_location: boolean;
  temperature_c: number;
  humidity_pct: number;
  wind_speed_kmh: number;
  wind_direction: string;
  rainfall_mm: number;
  condition: string;
  uv_index: number;
  visibility_km: number;
  feels_like_c: number;
  updated_at: string;
  forecast: ForecastDay[];
  spray_safe: boolean;
  spray_advisory: string;
}

interface ForecastDay {
  date: string;
  max_temp_c: number;
  min_temp_c: number;
  condition: string;
  rainfall_mm: number;
  humidity_pct: number;
  wind_speed_kmh: number;
}

interface GeoSuggestion {
  label: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

const conditionIcon = (condition: string) => {
  const c = condition?.toLowerCase() || '';
  if (c.includes('rain') || c.includes('shower') || c.includes('drizzle')) return '🌧️';
  if (c.includes('overcast')) return '☁️';
  if (c.includes('cloud') || c.includes('partly')) return '⛅';
  if (c.includes('clear') || c.includes('sunny')) return '☀️';
  if (c.includes('wind')) return '💨';
  if (c.includes('thunder') || c.includes('storm')) return '⛈️';
  if (c.includes('fog') || c.includes('mist')) return '🌫️';
  if (c.includes('snow')) return '❄️';
  return '🌤️';
};

export default function WeatherPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Farmer-owned farm reference
  const [farmId, setFarmId] = useState<string | null>(null);

  // Location search / override
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [savingLoc, setSavingLoc] = useState(false);
  const [locError, setLocError] = useState('');
  const [locSuccess, setLocSuccess] = useState('');
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchWeather = async (silent = false, lat?: number, lon?: number) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      let url = '/farmer/weather';
      if (lat !== undefined && lon !== undefined) url += `?lat=${lat}&lon=${lon}`;
      const response = await api.get(url);
      setWeather(response.data);
    } catch {
      setError('Unable to retrieve weather data for your farm location.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadFarmId = async () => {
    try {
      const res = await api.get('/farms');
      if (res.data && res.data.length > 0) setFarmId(res.data[0].id);
    } catch { /* */ }
  };

  useEffect(() => {
    fetchWeather();
    loadFarmId();
  }, []);

  // Debounced geocode search
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setSuggestions([]);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (val.trim().length < 2) return;
    searchDebounce.current = setTimeout(() => doGeocode(val.trim()), 400);
  };

  const doGeocode = async (q: string) => {
    setSearching(true);
    setLocError('');
    try {
      const res = await api.get(`/farmer/geocode?q=${encodeURIComponent(q)}`);
      setSuggestions(res.data.suggestions || []);
    } catch {
      setLocError('Search failed. Please check your connection.');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectLocation = async (s: GeoSuggestion) => {
    setSuggestions([]);
    setSearchQuery(s.label);
    setLocError('');
    setLocSuccess('');

    // If farmer has a farm, save this as the permanent weather location
    if (farmId) {
      setSavingLoc(true);
      try {
        await api.patch(`/farms/${farmId}/location`, {
          location_name: s.label,
          latitude: s.latitude,
          longitude: s.longitude,
        });
        setLocSuccess(`Weather location updated to ${s.label}`);
      } catch { /* silently skip save — still preview */ }
      setSavingLoc(false);
    }

    // Immediately preview weather for selected location
    await fetchWeather(true, s.latitude, s.longitude);
    setTimeout(() => { setShowSearch(false); setLocSuccess(''); }, 1500);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <Cloud className="h-10 w-10 mx-auto mb-3 animate-bounce text-agri-green" />
        Loading weather data for your farm...
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>Farm Weather - Smart AgriTech</title>
        <meta name="description" content="Real-time weather conditions and forecast for your farm location." />
      </Head>

      {/* Header */}
      <div className="mb-6 flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Cloud className="h-7 w-7 text-agri-green" />
            Farm Weather
          </h1>
          <p className="mt-1 text-sm text-gray-500 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-agri-green" />
            {weather?.location || 'Your farm location'}
            {!weather?.farm_has_location && (
              <span className="text-amber-500 text-xs font-medium ml-1">(default — set your farm location for accurate data)</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            id="btn-change-weather-location"
            onClick={() => { setShowSearch(v => !v); setSuggestions([]); setSearchQuery(''); setLocError(''); setLocSuccess(''); }}
            className="btn-outline flex items-center gap-2 text-sm"
          >
            <MapPin className="h-4 w-4" />
            {weather?.farm_has_location ? 'Change Location' : 'Set Location'}
          </button>
          <button
            onClick={() => fetchWeather(true)}
            disabled={refreshing}
            className="btn-outline flex items-center gap-2 text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Location Search Panel ── */}
      {showSearch && (
        <div className="mb-6 bg-white rounded-xl border border-sky-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
              <Search className="h-4 w-4 text-sky-600" />
              Search Weather Location
            </h3>
            <button onClick={() => { setShowSearch(false); setSuggestions([]); }} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>

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

          <div className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                id="input-weather-location-search"
                type="text"
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                placeholder="Type city, district, or region... e.g. Coimbatore, Pune, Kansas City"
                className="w-full input pl-10 pr-10"
                autoFocus
                autoComplete="off"
              />
              {searching || savingLoc
                ? <Loader2 className="absolute right-3 h-4 w-4 text-agri-green animate-spin" />
                : searchQuery && (
                  <button type="button"
                    onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                    className="absolute right-3 text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                )
              }
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="absolute z-30 w-full mt-1 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectLocation(s)}
                    className="w-full text-left px-4 py-3 hover:bg-agri-green/5 transition-colors flex items-center gap-3 border-b last:border-0 border-gray-50"
                  >
                    <MapPin className="h-4 w-4 text-agri-green flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.label}</p>
                      {s.timezone && <p className="text-xs text-gray-400">{s.timezone}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!searching && searchQuery.length >= 2 && suggestions.length === 0 && (
              <p className="text-xs text-gray-400 mt-1.5 pl-1">No results found. Try a different name.</p>
            )}
          </div>

          <p className="text-xs text-gray-400">
            Selecting a location saves it as your farm's weather location and immediately updates the forecast below.
            You can also set it from{' '}
            <Link href="/farmer/farm" className="text-agri-green underline">My Farm</Link>.
          </p>
        </div>
      )}

      {error && !weather && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* No location set notice */}
      {weather && !weather.farm_has_location && (
        <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" />
          <span>
            Your farm location is not set — showing weather for a regional default.{' '}
            <button onClick={() => setShowSearch(true)} className="underline font-semibold hover:text-amber-900">
              Search and set your location →
            </button>
          </span>
        </div>
      )}

      {!weather ? (
        <div className="bg-white rounded-xl border border-agri-beige p-12 text-center text-gray-400">
          <Cloud className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p>Weather data unavailable. Ensure your farm location is configured.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Spray Advisory */}
          <div className={`rounded-xl border p-5 flex items-start gap-4 ${
            weather.spray_safe ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
          }`}>
            <span className="text-3xl">{weather.spray_safe ? '✅' : '⚠️'}</span>
            <div>
              <p className={`font-bold text-base ${weather.spray_safe ? 'text-green-900' : 'text-orange-900'}`}>
                {weather.spray_safe
                  ? `${TERMS.spraying} Conditions: Favorable`
                  : `${TERMS.spraying} Conditions: Not Recommended`}
              </p>
              <p className={`text-sm mt-1 ${weather.spray_safe ? 'text-green-700' : 'text-orange-700'}`}>
                {weather.spray_advisory}
              </p>
            </div>
          </div>

          {/* Current Conditions */}
          <div className="bg-white rounded-xl border border-agri-beige shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium opacity-80 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {weather.location}
                  </p>
                  <p className="text-6xl font-bold mt-1">{weather.temperature_c?.toFixed(1)}°C</p>
                  <p className="text-lg mt-2 capitalize">{weather.condition}</p>
                  <p className="text-sm opacity-70 mt-1">Feels like {weather.feels_like_c?.toFixed(1)}°C</p>
                </div>
                <span className="text-7xl" role="img" aria-label={weather.condition}>
                  {conditionIcon(weather.condition)}
                </span>
              </div>
              <p className="text-xs opacity-60 mt-4">
                Updated: {new Date(weather.updated_at).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-gray-100">
              {[
                { icon: Droplets, label: 'Humidity', value: `${weather.humidity_pct}%`, color: 'text-blue-500' },
                { icon: Wind, label: 'Wind', value: `${weather.wind_speed_kmh} km/h ${weather.wind_direction || ''}`, color: 'text-gray-500' },
                { icon: Cloud, label: 'Rainfall', value: `${weather.rainfall_mm} mm`, color: 'text-blue-400' },
                { icon: Sun, label: 'UV Index', value: weather.uv_index?.toString() ?? '--', color: 'text-amber-500' },
              ].map(item => (
                <div key={item.label} className="p-5 flex items-center gap-3">
                  <item.icon className={`h-5 w-5 ${item.color} flex-shrink-0`} />
                  <div>
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="font-semibold text-gray-900 text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 7-Day Forecast */}
          {weather.forecast && weather.forecast.length > 0 && (
            <div className="bg-white rounded-xl border border-agri-beige shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-900">7-Day Forecast</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {weather.forecast.map((day, index) => (
                  <div key={index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="w-24">
                      <p className="font-medium text-gray-900 text-sm">
                        {index === 0 ? 'Today' : index === 1 ? 'Tomorrow'
                          : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <span className="text-2xl" role="img" aria-label={day.condition}>{conditionIcon(day.condition)}</span>
                    <p className="text-sm text-gray-500 capitalize w-24 text-center hidden sm:block">{day.condition}</p>
                    <div className="flex items-center gap-2 text-xs text-blue-500">
                      <Droplets className="h-3 w-3" />
                      {day.rainfall_mm ?? 0} mm
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Wind className="h-3 w-3" />
                      {day.wind_speed_kmh ?? 0} km/h
                    </div>
                    <div className="flex items-center gap-3 font-medium text-sm">
                      <span className="text-gray-900">{day.max_temp_c?.toFixed(0)}°</span>
                      <span className="text-gray-400">{day.min_temp_c?.toFixed(0)}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Farming Advisory */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Farming Advisory
            </h3>
            <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
              {weather.wind_speed_kmh > 20 && <li>High wind speed detected — postpone {TERMS.spraying.toLowerCase()} to avoid chemical drift.</li>}
              {weather.humidity_pct > 85 && <li>High humidity — monitor for fungal disease risk in susceptible crops.</li>}
              {weather.rainfall_mm > 5 && <li>Recent rainfall recorded — check field drainage and root health.</li>}
              {weather.uv_index >= 8 && <li>High UV index — avoid outdoor rover operations during peak hours.</li>}
              {weather.spray_safe && <li>Weather conditions are currently favorable for planned spray operations.</li>}
              {!weather.wind_speed_kmh && !weather.humidity_pct && !weather.rainfall_mm && !weather.uv_index && (
                <li>Conditions appear stable. Monitor throughout the day.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
