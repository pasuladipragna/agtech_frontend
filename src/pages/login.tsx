import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { Leaf, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 403) {
          // Handled pending/under review registration requests
          setInfo(err.response.data.message || 'Your account is pending review.');
        } else {
          setError(err.response.data.detail || 'Invalid email or password.');
        }
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-agri-cream">
      <Head>
        <title>Login - Smart AgriTech Rover</title>
      </Head>

      {/* Left section: Login form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center md:text-left flex flex-col md:items-start items-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-agri-green/10 mb-4">
              <Leaf className="h-6 w-6 text-agri-green" />
            </div>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to manage your farm and rovers
            </p>
          </div>

          <div className="mt-8">
            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Login failed</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {info && (
              <div className="rounded-md bg-blue-50 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-blue-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Registration Status</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>{info}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="farmer@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-agri-green focus:ring-agri-green border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-agri-green hover:text-agri-dark">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex justify-center py-2.5"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-agri-cream text-gray-500">Don't have an account?</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link href="/register" className="font-medium text-agri-green hover:text-agri-dark">
                  Request access for your farm
                </Link>
              </div>
            </div>
            
            <div className="mt-8 text-center text-xs text-gray-500">
              <Link href="/admin/login" className="hover:text-gray-700 underline underline-offset-2">
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right section: Image/branding */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-agri-green opacity-90"></div>
        <img
          className="absolute inset-0 h-full w-full object-cover mix-blend-overlay"
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop"
          alt="Smart farm field at sunset"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-12 text-center z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            The Future of<br/>Precision Farming
          </h1>
          <p className="text-xl text-white/90 max-w-lg mb-10">
            Monitor crop health, control automated rovers, and optimize your yield with intelligent agricultural robotics.
          </p>
          <div className="grid grid-cols-2 gap-8 max-w-md w-full">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-left border border-white/20">
              <div className="text-3xl mb-2">🌱</div>
              <h3 className="text-white font-semibold mb-1">Crop Health</h3>
              <p className="text-white/70 text-sm">AI-powered disease detection</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-left border border-white/20">
              <div className="text-3xl mb-2">🚜</div>
              <h3 className="text-white font-semibold mb-1">Rover Control</h3>
              <p className="text-white/70 text-sm">Automated field operations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
