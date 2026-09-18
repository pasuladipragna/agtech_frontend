import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { MessageSquare, ThumbsUp, Plus, Tag, User, Send } from "lucide-react";
import { fetchCommunityPosts, createCommunityPost } from "@/services/api";

export default function FarmerCommunity() {
  const [posts, setPosts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newContent, setNewContent] = useState<string>("");

  useEffect(() => {
    fetchCommunityPosts().then(data => {
      if (data) setPosts(data);
    }).catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;
    try {
      const created = await createCommunityPost({ title: newTitle, content: newContent, tags: "PrecisionSpraying,Rover" });
      setPosts([created, ...posts]);
      setNewTitle("");
      setNewContent("");
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-emerald-900/40">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-emerald-400" /> Farmer Community & Disease Forum
            </h1>
            <p className="text-xs text-gray-400">Share Precision Agriculture Field Experiences, Disease Tips & Rover Calibration Advice</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 text-black font-bold text-xs flex items-center space-x-1.5 transition-all shadow-lg glow-emerald"
          >
            <Plus className="w-4 h-4" /> <span>Create New Discussion</span>
          </button>
        </div>

        {showModal && (
          <div className="glass-panel p-5 rounded-2xl border border-emerald-800 bg-[#0d1612] space-y-4">
            <h3 className="font-bold text-sm text-white">Start a Farmer Community Thread</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Discussion Title (e.g. Solenoid pulse calibration for corn)..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-black/60 border border-emerald-900/50 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <textarea
                placeholder="Share your observation, chemical dosage recipe, or question..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={4}
                className="w-full bg-black/60 border border-emerald-900/50 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-black font-bold text-xs flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" /> <span>Post Discussion</span>
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {posts.map((p: any) => (
            <div key={p.id} className="glass-panel p-5 rounded-2xl border border-emerald-900/40 space-y-3 hover:border-emerald-700/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-600 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    F
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-200">John Deere (Farmer)</div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {new Date(p.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                  #{p.tags}
                </span>
              </div>

              <h3 className="font-bold text-base text-white">{p.title}</h3>
              <p className="text-xs text-gray-300 leading-relaxed">{p.content}</p>

              <div className="flex items-center space-x-4 pt-2 border-t border-emerald-900/20 text-xs text-gray-400">
                <button className="flex items-center space-x-1.5 hover:text-emerald-400 font-semibold">
                  <ThumbsUp className="w-4 h-4 text-emerald-400" /> <span>{p.likes_count || 14} Likes</span>
                </button>
                <span className="text-gray-500">•</span>
                <span>3 Replies</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
