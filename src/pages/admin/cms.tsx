import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';

export default function CMSAdmin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || user?.role !== 'ADMIN') {
        router.push('/');
      } else {
        fetch('/api/cms')
          .then(res => res.json())
          .then(data => setContent(data))
          .catch(err => console.error("Failed to load CMS content", err));
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      alert('Content saved successfully!');
    } catch (error) {
      alert('Failed to save content.');
    }
    setSaving(false);
  };

  const handleChange = (page: string, field: string, value: string) => {
    setContent((prev: any) => ({
      ...prev,
      [page]: {
        ...prev[page],
        [field]: value
      }
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, page: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use environment variables for Cloudinary configuration
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

    if (!cloudName || !uploadPreset) {
      alert("Please configure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in your .env.local file.");
      return;
    }

    setUploading(prev => ({ ...prev, [page]: true }));

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.secure_url) {
        handleChange(page, 'imageUrl', data.secure_url);
      } else {
        alert("Upload failed: " + (data.error?.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please check console for details.");
    } finally {
      setUploading(prev => ({ ...prev, [page]: false }));
    }
  };

  if (isLoading || !content) {
    return <div className="p-10 text-center">Loading CMS...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Landing Page CMS</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded shadow-sm text-sm text-blue-800">
        <p className="font-bold mb-1">Cloudinary Configuration Required</p>
        <p>To use direct image uploads, ensure you have added your Cloudinary credentials to <code className="bg-blue-100 px-1 rounded">.env.local</code>:</p>
        <ul className="list-disc ml-5 mt-2 font-mono">
          <li>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name</li>
          <li>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset</li>
        </ul>
      </div>

      {Object.keys(content).map(page => (
        <div key={page} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-bold mb-6 capitalize text-emerald-800 border-b pb-2">{page} Section</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Main Title</label>
              <input 
                type="text" 
                value={content[page].title} 
                onChange={(e) => handleChange(page, 'title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description / Text</label>
              <textarea 
                rows={4}
                value={content[page].description} 
                onChange={(e) => handleChange(page, 'description', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
              ></textarea>
            </div>

            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Section Image</label>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                <input 
                  type="text" 
                  value={content[page].imageUrl || ''} 
                  onChange={(e) => handleChange(page, 'imageUrl', e.target.value)}
                  placeholder="Direct Image URL"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
                
                <span className="text-gray-400 font-bold text-sm hidden sm:block">OR</span>
                
                <div className="flex items-center">
                  <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded shadow-sm text-sm transition-colors">
                    {uploading[page] ? 'Uploading...' : 'Upload File'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, page)}
                      className="hidden"
                      disabled={uploading[page]}
                    />
                  </label>
                  {uploading[page] && (
                    <svg className="animate-spin ml-3 h-5 w-5 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                </div>
              </div>
              
              {content[page].imageUrl && (
                <div className="mt-4 h-40 w-64 bg-gray-200 rounded-md overflow-hidden border border-gray-300 relative shadow-sm">
                   <img src={content[page].imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
