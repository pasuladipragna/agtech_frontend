import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { api } from '../../services/api';
import { TERMS } from '../../constants/terminology';
import EmptyState from '../../components/ui/EmptyState';
import { Map, Plus, Edit2, Loader2, Trash2 } from 'lucide-react';

interface Field {
  id: string;
  farm_id: string;
  name: string;
  area_hectares: number;
  location_description: string;
  notes: string;
  crop_count: number;
}

export default function FieldsPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [farmId, setFarmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [formData, setFormData] = useState<Partial<Field>>({});
  const [saving, setSaving] = useState(false);

  const fetchFields = async () => {
    try {
      // First get the farm ID
      const farmRes = await api.get('/farms');
      if (farmRes.data && farmRes.data.length > 0) {
        setFarmId(farmRes.data[0].id);
      }

      // Then get fields
      const response = await api.get('/fields');
      setFields(response.data);
    } catch (err) {
      console.error('Failed to load fields:', err);
      setError('Failed to load fields.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const openModal = (field?: Field) => {
    if (field) {
      setEditingField(field);
      setFormData(field);
    } else {
      setEditingField(null);
      setFormData({ farm_id: farmId || '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingField(null);
    setFormData({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (editingField) {
        await api.put(`/fields/${editingField.id}`, formData);
      } else {
        await api.post('/fields', formData);
      }
      await fetchFields();
      closeModal();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save field.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this field?')) return;
    
    try {
      await api.delete(`/fields/${id}`);
      await fetchFields();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete field.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-agri-green animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>My {TERMS.field}s - Smart AgriTech</title>
      </Head>

      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My {TERMS.field}s</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your {TERMS.field.toLowerCase()}s and physical boundaries.
          </p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center" disabled={!farmId}>
          <Plus className="h-4 w-4 mr-2" />
          Add {TERMS.field}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {fields.length === 0 ? (
        <EmptyState 
          icon={Map}
          title={`No ${TERMS.field}s Found`}
          description={`Get started by adding your first ${TERMS.field.toLowerCase()}.`}
          action={{ label: `Add ${TERMS.field}`, onClick: () => openModal() }}
        />
      ) : (
        <div className="bg-white shadow-sm rounded-xl border border-agri-beige overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area (Ha)</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active {TERMS.crop}s</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fields.map((field) => (
                  <tr key={field.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{field.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.area_hectares ?? '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{field.location_description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.crop_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openModal(field)} className="text-agri-green hover:text-agri-dark mr-4">
                        <Edit2 className="h-4 w-4 inline" />
                      </button>
                      <button onClick={() => handleDelete(field.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900 opacity-75" onClick={closeModal}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 border-b pb-2">
                        {editingField ? `Edit ${TERMS.field}` : `Add New ${TERMS.field}`}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Name *</label>
                          <input type="text" name="name" required value={formData.name || ''} onChange={handleChange} className="mt-1 input-field" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Area (Hectares)</label>
                          <input type="number" step="0.1" name="area_hectares" value={formData.area_hectares || ''} onChange={handleChange} className="mt-1 input-field" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Location Description</label>
                          <input type="text" name="location_description" value={formData.location_description || ''} onChange={handleChange} className="mt-1 input-field" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Notes</label>
                          <textarea name="notes" rows={3} value={formData.notes || ''} onChange={handleChange} className="mt-1 input-field" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
                  <button type="submit" disabled={saving} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-agri-green text-base font-medium text-white hover:bg-agri-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agri-green sm:ml-3 sm:w-auto sm:text-sm">
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" onClick={closeModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agri-green sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
