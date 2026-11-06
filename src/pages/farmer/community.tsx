import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { api } from '../../services/api';
import { TERMS } from '../../constants/terminology';
import { MessageSquare, ThumbsUp, Reply, Send, Loader2, Plus } from 'lucide-react';

interface Post {
  id: number;
  author_name: string;
  title: string;
  body: string;
  tags: string[];
  likes_count: number;
  replies_count: number;
  is_liked: boolean;
  created_at: string;
}

const TAGS = ['General', 'Pest Control', 'Irrigation', 'Soil Health', 'Crop Disease', 'Machinery', 'Weather', 'Seeds'];

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [formData, setFormData] = useState({ title: '', body: '', tags: [] as string[] });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const params = selectedTag ? { tag: selectedTag } : {};
        const response = await api.get('/farmer/community/posts', { params });
        setPosts(response.data || []);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [selectedTag]);

  const likePost = async (postId: number) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      if (post.is_liked) {
        await api.delete(`/farmer/community/posts/${postId}/like`);
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_liked: false, likes_count: p.likes_count - 1 } : p));
      } else {
        await api.post(`/farmer/community/posts/${postId}/like`);
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_liked: true, likes_count: p.likes_count + 1 } : p));
      }
    } catch { /* ignore */ }
  };

  const submitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.body.trim()) return;
    setSubmitting(true);
    try {
      const response = await api.post('/farmer/community/posts', formData);
      setPosts(prev => [response.data, ...prev]);
      setShowForm(false);
      setFormData({ title: '', body: '', tags: [] });
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to post. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }));
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div>
      <Head>
        <title>{TERMS.community} - Smart AgriTech</title>
        <meta name="description" content="Connect with other farmers, share tips, and get advice on crop management and farming best practices." />
      </Head>

      <div className="mb-6 sm:mb-8 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 sm:h-7 sm:w-7 text-agri-green flex-shrink-0" />
            {TERMS.community}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Connect with other {TERMS.farmer.toLowerCase()}s, share tips and get advice.
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary w-full sm:w-auto" disabled={showForm}>
          <Plus className="h-4 w-4" />
          Share with Community
        </button>
      </div>

      {/* New Post Form */}
      {showForm && (
        <div className="mb-8 bg-white rounded-xl border border-agri-beige shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Share with the Community</h2>
          <form onSubmit={submitPost} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                className="w-full input"
                placeholder="What would you like to share or ask?"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
              <textarea
                value={formData.body}
                onChange={e => setFormData(p => ({ ...p, body: e.target.value }))}
                rows={4}
                className="w-full input"
                placeholder="Describe your experience, problem, or tip in detail..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      formData.tags.includes(tag)
                        ? 'bg-agri-green text-white border-agri-green'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {submitting ? 'Posting...' : 'Post'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Tag filter */}
      <div className="mb-6 flex flex-wrap gap-2 items-center overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedTag('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            !selectedTag ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
          }`}
        >
          All Topics
        </button>
        {TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              selectedTag === tag ? 'bg-agri-green text-white border-agri-green' : 'bg-white text-gray-600 border-gray-200 hover:border-agri-green'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin" />
          Loading community posts...
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-agri-beige p-12 text-center">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-200" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Posts Yet</h3>
          <p className="text-sm text-gray-500 mb-4">Be the first to share with the farming community.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">Share Something</button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-xl border border-agri-beige shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{post.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      by <span className="font-medium text-gray-600">{post.author_name}</span> · {timeAgo(post.created_at)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{post.body}</p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {post.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700 font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/50 flex items-center gap-4">
                <button
                  onClick={() => likePost(post.id)}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    post.is_liked ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ThumbsUp className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
                  {post.likes_count}
                </button>
                <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium">
                  <Reply className="h-4 w-4" />
                  {post.replies_count} Replies
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
