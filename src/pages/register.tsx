import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { api } from '../services/api';
import { Leaf, AlertCircle, CheckCircle } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    farm_name: '',
    farm_location: '',
    farm_area_hectares: '',
    main_crops: '',
    rover_id: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formPayload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formPayload.append(key, value as string);
        }
      });

      await api.post('/registration/submit', formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit registration request.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-agri-cream px-4 sm:px-6 lg:px-8">
        <Head><title>Registration Submitted - Smart AgriTech</title></Head>
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center border border-agri-beige">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Received</h2>
          <p className="text-gray-600 mb-8">
            Thank you for registering with Smart AgriTech Rover. Your request has been submitted to our administrative team for review. 
            You will receive an email and SMS once your account is approved.
          </p>
          <Link href="/login" className="btn-primary w-full inline-block py-3">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-agri-cream py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Register - Smart AgriTech Rover</title>
      </Head>

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-agri-green/10 mx-auto mb-4">
            <Leaf className="h-6 w-6 text-agri-green" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Join Smart AgriTech</h2>
          <p className="mt-2 text-gray-600">Request access to the platform for your farm</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-agri-beige">
          <div className="p-8">
            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700"><p>{error}</p></div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Personal Details</h3>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Full Name *</label>
                    <input type="text" name="full_name" id="full_name" required value={formData.full_name} onChange={handleChange} className="mt-1 input-field" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address *</label>
                    <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="mt-1 input-field" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number *</label>
                    <input type="tel" name="phone" id="phone" required value={formData.phone} onChange={handleChange} className="mt-1 input-field" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Farm Details</h3>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="farm_name" className="block text-sm font-medium text-gray-700">Farm Name *</label>
                    <input type="text" name="farm_name" id="farm_name" required value={formData.farm_name} onChange={handleChange} className="mt-1 input-field" />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="farm_location" className="block text-sm font-medium text-gray-700">Location/Address *</label>
                    <input type="text" name="farm_location" id="farm_location" required value={formData.farm_location} onChange={handleChange} className="mt-1 input-field" />
                  </div>
                  <div>
                    <label htmlFor="farm_area_hectares" className="block text-sm font-medium text-gray-700">Total Area (Hectares)</label>
                    <input type="number" step="0.1" name="farm_area_hectares" id="farm_area_hectares" value={formData.farm_area_hectares} onChange={handleChange} className="mt-1 input-field" />
                  </div>
                  <div>
                    <label htmlFor="main_crops" className="block text-sm font-medium text-gray-700">Main Crops Grown</label>
                    <input type="text" name="main_crops" id="main_crops" placeholder="e.g. Corn, Soybeans" value={formData.main_crops} onChange={handleChange} className="mt-1 input-field" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Hardware (Optional)</h3>
                <div className="sm:col-span-2">
                  <label htmlFor="rover_id" className="block text-sm font-medium text-gray-700">Rover ID (if pre-purchased)</label>
                  <input type="text" name="rover_id" id="rover_id" placeholder="e.g. ROV-2026-X1" value={formData.rover_id} onChange={handleChange} className="mt-1 input-field" />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-gray-200">
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-agri-green">
                  Cancel and return to login
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary py-2.5 px-8"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
