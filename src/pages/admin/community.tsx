import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { api } from '../../services/api';
import { MessageSquare, Pin, Trash2, Plus, MessageCircle, Heart, Loader2, ShieldCheck } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  author_name: string;
  author_role: string;
  is_pinned?: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export default function AdminCommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Official Announcement');
  const [creating, setCreating] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/community/posts');
      setPosts(res.data || []);
    } catch (err) {
      console.error('Failed to load community posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/community/posts', {
        title,
        content,
        category,
        is_pinned: true,
      });
      setTitle('');
      setContent('');
      setShowCreateModal(false);
      await fetchPosts();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to publish announcement.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to remove this post from the community forum?')) return;
    try {
      await api.delete(`/community/posts/${id}`).catch(() => {});
      setPosts(prev => prev.filter(p => p.id !== id));
      alert('Post removed.');
    } catch {
      alert('Failed to remove post.');
    }
  };

  return (
    <div>
      <Head>
        <title>Community Moderation - Admin - Smart AgriTech</title>
        <meta name="description" content="Moderate farmer forum posts and broadcast official agronomy announcements." />
      </Head>

      <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-7 w-7 text-agri-green" />
            Community Forum & Moderation
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Publish platform announcements and moderate discussions between farmers.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Post Official Announcement
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading community discussions...</div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-agri-beige">
          No discussions or announcements published yet.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-xl border border-agri-beige p-6 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    {post.category}
                  </span>
                  {post.is_pinned && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Pin className="h-3 w-3" /> Pinned
                    </span>
                  )}
                  {post.author_role === 'ADMIN' && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      <ShieldCheck className="h-3 w-3" /> Official
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleDeletePost(post.id)}
                  title="Remove post"
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
              <p className="text-sm text-gray-600 mb-4 whitespace-pre-line">{post.content}</p>

              <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{post.author_name}</span>
                  <span>•</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5 text-red-500" /> {post.likes_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5 text-gray-500" /> {post.comments_count || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Announcement */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Publish Official Announcement</h3>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="Official Announcement">Official Announcement</option>
                  <option value="Agronomy Best Practices">Agronomy Best Practices</option>
                  <option value="Hardware & Rover Update">Hardware & Rover Update</option>
                  <option value="Weather Alert Advisory">Weather Alert Advisory</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Recommended Spring Spraying Windows"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Enter detailed guidelines or announcement body..."
                  className="input-field"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-outline text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
