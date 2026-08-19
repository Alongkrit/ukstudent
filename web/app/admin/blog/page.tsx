'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { BookOpen, ArrowLeft, Plus, Pencil, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { apiFetch } from '../../lib/api';

function AdminBlogContent() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    body: '',
    readTimeMin: 5,
    published: true,
  });

  const fetchPosts = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/blog');
      if (res.ok) {
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error('Failed to load blog posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const openNewPostForm = () => {
    setEditingPost(null);
    setFormData({ title: '', category: '', body: '', readTimeMin: 5, published: true });
    setError(null);
    setShowForm(true);
  };

  const openEditForm = (post: any) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      category: post.category,
      body: post.body,
      readTimeMin: post.readTimeMin || 5,
      published: !!post.publishedAt,
    });
    setError(null);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const res = editingPost
        ? await apiFetch(`/admin/blog/${editingPost.id}`, {
            method: 'PATCH',
            body: JSON.stringify(formData),
          })
        : await apiFetch('/admin/blog', {
            method: 'POST',
            body: JSON.stringify(formData),
          });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: 'Failed to save post' }));
        setError(errData.message || 'Failed to save post');
        return;
      }

      setShowForm(false);
      fetchPosts();
    } catch (err: any) {
      setError(err.message || 'Network error saving post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post permanently?')) return;
    try {
      const res = await apiFetch(`/admin/blog/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const togglePublished = async (post: any) => {
    try {
      const res = await apiFetch(`/admin/blog/${post.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ published: !post.publishedAt }),
      });
      if (res.ok) {
        fetchPosts();
      }
    } catch (err) {
      console.error('Failed to toggle publish state:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="text-xs font-bold text-slate-500 hover:text-primary-navy flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Admin Overview
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-primary-navy">Blog CMS</h1>
          <p className="text-xs text-slate-500">Create, edit, and publish Study Blog articles</p>
        </div>
        <button
          onClick={openNewPostForm}
          className="px-4 py-2.5 rounded-xl bg-primary-navy hover:bg-primary-blue text-white text-xs font-bold flex items-center gap-1.5 shadow"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-6 text-center text-xs font-bold text-slate-400">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="p-6 text-center text-xs font-bold text-slate-500">No blog posts yet.</div>
          ) : (
            posts.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between text-xs gap-4">
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 block truncate">{p.title}</span>
                  <span className="text-slate-500">{p.category} · {p.readTimeMin} min read</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    p.publishedAt ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {p.publishedAt ? 'Published' : 'Draft'}
                  </span>
                  <button
                    onClick={() => togglePublished(p)}
                    className="p-1.5 text-slate-400 hover:text-primary-navy rounded-lg"
                    title={p.publishedAt ? 'Unpublish' : 'Publish'}
                  >
                    {p.publishedAt ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEditForm(p)}
                    className="p-1.5 text-slate-400 hover:text-primary-navy rounded-lg"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary-navy" />
                {editingPost ? 'Edit Post' : 'New Post'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Essay Writing"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Read Time (min)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.readTimeMin}
                    onChange={(e) => setFormData({ ...formData, readTimeMin: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Body</label>
                <textarea
                  required
                  rows={12}
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-navy"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="rounded border-slate-300 text-primary-navy"
                />
                Published (visible on the public Study Blog)
              </label>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-primary-navy hover:bg-primary-blue text-white font-bold text-xs shadow-md disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingPost ? 'Save Changes' : 'Create Post'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminBlogPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminBlogContent />
    </ProtectedRoute>
  );
}