import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { api } from '../../services/api';
import { TERMS } from '../../constants/terminology';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import { Leaf, Plus, Edit2, Loader2, Trash2 } from 'lucide-react';

interface Field {
  id: string;
  name: string;
}

interface Crop {
  id: string;
  field_id: string;
  name: string;
  variety: string;
  planting_date: string;
  expected_harvest_date: string;
  growth_stage: string;
  status: string;
  notes: string;
}

export default function CropsPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [formData, setFormData] = useState<Partial<Crop>>({});
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [fieldsRes, cropsRes] = await Promise.all([
        api.get('/fields'),
        api.get('/crops')
      ]);
      setFields(fieldsRes.data);
      setCrops(cropsRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load crop data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (crop?: Crop) => {
    if (crop) {
      setEditingCrop(crop);
      setFormData(crop);
    } else {
      setEditingCrop(null);
      setFormData({
        status: 'Monitoring',
        field_id: fields.length > 0 ? fields[0].id : ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCrop(null);
    setFormData({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (editingCrop) {
        await api.put(`/crops/${editingCrop.id}`, formData);
      } else {
        await api.post('/crops', formData);
      }
      await fetchData();
      closeModal();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save crop.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      await api.delete(`/crops/${id}`);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete crop.');
    }
  };

  const getFieldName = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    return field ? field.name : 'Unknown';
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
        <title>My {TERMS.crop}s - Smart AgriTech</title>
      </Head>

      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My {TERMS.crop}s</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor planting and harvest schedules across your {TERMS.field.toLowerCase()}s.
          </p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="btn-primary flex items-center" 
          disabled={fields.length === 0}
          title={fields.length === 0 ? `Create a ${TERMS.field.toLowerCase()} first` : ''}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add {TERMS.crop}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {fields.length === 0 ? (
        <EmptyState 
          icon={Leaf}
          title={`No ${TERMS.field}s Available`}
          description={`You need to create a ${TERMS.field.toLowerCase()} before you can add ${TERMS.crop.toLowerCase()}s.`}
          action={{ label: `Go to ${TERMS.field}s`, onClick: () => window.location.href = '/farmer/fields' }}
        />
      ) : crops.length === 0 ? (
        <EmptyState 
          icon={Leaf}
          title={`No ${TERMS.crop}s Found`}
          description={`Start tracking your plantings by adding a ${TERMS.crop.toLowerCase()}.`}
          action={{ label: `Add ${TERMS.crop}`, onClick: () => openModal() }}
        />
      ) : (
        <div className="bg-white shadow-sm rounded-xl border border-agri-beige overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{TERMS.crop}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{TERMS.field}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth Stage</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {crops.map((crop) => (
                  <tr key={crop.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{crop.name}</div>
                      <div className="text-sm text-gray-500">{crop.variety || 'Unknown Variety'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getFieldName(crop.field_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {crop.growth_stage || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={crop.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openModal(crop)} className="text-agri-green hover:text-agri-dark mr-4">
                        <Edit2 className="h-4 w-4 inline" />
                      </button>
                      <button onClick={() => handleDelete(crop.id)} className="text-red-500 hover:text-red-700">
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
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 border-b pb-2">
                        {editingCrop ? `Edit ${TERMS.crop}` : `Add New ${TERMS.crop}`}
                      </h3>
                      <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">{TERMS.field} *</label>
                          <select name="field_id" required value={formData.field_id || ''} onChange={handleChange} className="mt-1 input-field">
                            <option value="" disabled>Select a field</option>
                            {fields.map(f => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-1">
                          <label className="block text-sm font-medium text-gray-700">Name *</label>
                          <input type="text" name="name" required value={formData.name || ''} onChange={handleChange} className="mt-1 input-field" placeholder="e.g. Tomato" />
                        </div>
                        <div className="sm:col-span-1">
                          <label className="block text-sm font-medium text-gray-700">Variety</label>
                          <input type="text" name="variety" value={formData.variety || ''} onChange={handleChange} className="mt-1 input-field" />
                        </div>
                        <div className="sm:col-span-1">
                          <label className="block text-sm font-medium text-gray-700">Planting Date</label>
                          <input type="date" name="planting_date" value={formData.planting_date ? formData.planting_date.split('T')[0] : ''} onChange={handleChange} className="mt-1 input-field" />
                        </div>
                        <div className="sm:col-span-1">
                          <label className="block text-sm font-medium text-gray-700">Expected Harvest</label>
                          <input type="date" name="expected_harvest_date" value={formData.expected_harvest_date ? formData.expected_harvest_date.split('T')[0] : ''} onChange={handleChange} className="mt-1 input-field" />
                        </div>
                        <div className="sm:col-span-1">
                          <label className="block text-sm font-medium text-gray-700">Growth Stage</label>
                          <input type="text" name="growth_stage" value={formData.growth_stage || ''} onChange={handleChange} className="mt-1 input-field" />
                        </div>
                        <div className="sm:col-span-1">
                          <label className="block text-sm font-medium text-gray-700">Status</label>
                          <select name="status" value={formData.status || 'Monitoring'} onChange={handleChange} className="mt-1 input-field">
                            <option value="Healthy">Healthy</option>
                            <option value="Needs Attention">Needs Attention</option>
                            <option value="Problem Detected">Problem Detected</option>
                            <option value="Monitoring">Monitoring</option>
                            <option value="Harvest Ready">Harvest Ready</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">Notes</label>
                          <textarea name="notes" rows={2} value={formData.notes || ''} onChange={handleChange} className="mt-1 input-field" />
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
