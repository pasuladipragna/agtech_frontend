import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { api } from '../../services/api';
import { TERMS } from '../../constants/terminology';
import EmptyState from '../../components/ui/EmptyState';
import { Package, Plus, Edit2, X, Search, Loader2, Trash2 } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  type: 'PESTICIDE' | 'HERBICIDE' | 'FUNGICIDE' | 'FERTILIZER' | 'GROWTH_REGULATOR' | 'OTHER';
  description?: string;
  active_ingredient?: string;
  dilution_ratio?: string;
  unit: string;
  is_active: boolean;
  created_at: string;
}

interface ProductForm {
  name: string;
  type: string;
  description: string;
  active_ingredient: string;
  dilution_ratio: string;
  unit: string;
}

const PRODUCT_TYPES = ['PESTICIDE', 'HERBICIDE', 'FUNGICIDE', 'FERTILIZER', 'GROWTH_REGULATOR', 'OTHER'];
const UNITS = ['ml/L', 'g/L', 'L/ha', 'kg/ha', '%'];

const TYPE_COLORS: Record<string, string> = {
  PESTICIDE: 'bg-red-100 text-red-800',
  HERBICIDE: 'bg-orange-100 text-orange-800',
  FUNGICIDE: 'bg-purple-100 text-purple-800',
  FERTILIZER: 'bg-green-100 text-green-800',
  GROWTH_REGULATOR: 'bg-blue-100 text-blue-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [form, setForm] = useState<ProductForm>({
    name: '', type: 'PESTICIDE', description: '', active_ingredient: '', dilution_ratio: '', unit: 'ml/L'
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (filterType !== 'ALL') params.type = filterType;
        const res = await api.get('/admin/products', { params });
        setProducts(res.data || []);
      } catch { /* */ }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, [filterType]);

  const openCreate = () => {
    setEditProduct(null);
    setForm({ name: '', type: 'PESTICIDE', description: '', active_ingredient: '', dilution_ratio: '', unit: 'ml/L' });
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setForm({
      name: product.name, type: product.type, description: product.description || '',
      active_ingredient: product.active_ingredient || '', dilution_ratio: product.dilution_ratio || '',
      unit: product.unit,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editProduct) {
        const res = await api.put(`/admin/products/${editProduct.id}`, form);
        setProducts(prev => prev.map(p => p.id === editProduct.id ? res.data : p));
      } else {
        const res = await api.post('/admin/products', form);
        setProducts(prev => [res.data, ...prev]);
      }
      setShowForm(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (product: Product) => {
    try {
      await api.patch(`/admin/products/${product.id}`, { is_active: !product.is_active });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update product.');
    }
  };

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Head>
        <title>Spray Products - Admin - Smart AgriTech</title>
        <meta name="description" content="Manage the catalog of spray products available to farmers." />
      </Head>

      <div className="mb-8 flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-7 w-7 text-agri-green" />
            Spray Products
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the approved product catalog available to {TERMS.farmer.toLowerCase()}s.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">
                {editProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full input"
                    placeholder="e.g. Chlorpyrifos 20EC"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full input"
                    required
                  >
                    {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={form.unit}
                    onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                    className="w-full input"
                    required
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Active Ingredient</label>
                  <input
                    type="text"
                    value={form.active_ingredient}
                    onChange={e => setForm(p => ({ ...p, active_ingredient: e.target.value }))}
                    className="w-full input"
                    placeholder="e.g. Chlorpyrifos"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dilution Ratio</label>
                  <input
                    type="text"
                    value={form.dilution_ratio}
                    onChange={e => setForm(p => ({ ...p, dilution_ratio: e.target.value }))}
                    className="w-full input"
                    placeholder="e.g. 2ml per 1L water"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    rows={2}
                    className="w-full input"
                    placeholder="Usage instructions, target pests, safety notes..."
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1" disabled={submitting}>
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : editProduct ? 'Update Product' : 'Add Product'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative max-w-sm flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full input pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['ALL', ...PRODUCT_TYPES].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filterType === t ? 'bg-agri-green text-white border-agri-green' : 'bg-white text-gray-600 border-gray-200 hover:border-agri-green'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-400">Loading products...</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Package} title="No Products Found" description="Add products to the catalog for farmers to use." action={{ label: 'Add First Product', onClick: openCreate }} />
      ) : (
        <div className="bg-white rounded-xl border border-agri-beige shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Product', 'Type', 'Active Ingredient', 'Dilution', 'Unit', 'Status', ''].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                    {product.description && <p className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">{product.description}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[product.type] || TYPE_COLORS.OTHER}`}>
                      {product.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.active_ingredient || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.dilution_ratio || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.unit}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleActive(product)} className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                      product.is_active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => openEdit(product)} className="text-agri-green hover:text-green-700">
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
