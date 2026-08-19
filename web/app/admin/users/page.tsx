'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { Users, Search, ArrowLeft, Ban, ShieldCheck } from 'lucide-react';

import { apiFetch } from '../../lib/api';

function AdminUsersContent() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = React.useCallback(async () => {
    try {
      const endpoint = search ? `/admin/users?search=${encodeURIComponent(search)}` : '/admin/users';
      const res = await apiFetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error('Failed to load users directory:', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await apiFetch(`/admin/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Status update failed:', err);
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

      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-primary-navy">Users Directory</h1>
        <p className="text-xs text-slate-500">Manage student, expert, and administrator accounts</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-none"
          />
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-6 text-center text-xs font-bold text-slate-400">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center text-xs font-bold text-slate-500">No users found.</div>
          ) : (
            users.map((u) => (
              <div key={u.id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{u.email.split('@')[0]}</span>
                  <span className="text-slate-500">{u.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {u.role}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {u.status}
                  </span>
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => toggleStatus(u.id, u.status)}
                      className="p-1.5 text-slate-400 hover:text-error"
                      title={u.status === 'active' ? 'Suspend User' : 'Unsuspend User'}
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminUsersContent />
    </ProtectedRoute>
  );
}
