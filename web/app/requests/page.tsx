'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../components/ProtectedRoute';
import {
  PlusCircle,
  Clock,
  MessageSquare,
} from 'lucide-react';

import { apiFetch } from '../lib/api';

function StudentRequestsListContent() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function loadRequests() {
      try {
        const res = await apiFetch('/requests');
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.data || [];
          setRequests(list);
        }
      } catch (err) {
        console.error('Failed to load requests:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, []);

  const filtered = requests.filter((r) => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Active') return r.status === 'in_progress' || r.status === 'matching' || r.status === 'submitted';
    if (statusFilter === 'Completed') return r.status === 'completed';
    if (statusFilter === 'Cancelled') return r.status === 'cancelled';
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary-navy">My Academic Requests</h1>
          <p className="text-xs text-slate-500">Track and manage your submitted requests, chat history, and sessions</p>
        </div>

        <Link
          href="/requests/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-navy hover:bg-primary-blue text-white text-xs font-bold shadow transition-all"
        >
          <PlusCircle className="w-4 h-4 text-accent-gold" />
          <span>New Request</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {['All', 'Active', 'Completed', 'Cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === tab
                ? 'bg-primary-navy text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Requests Cards List */}
      {loading ? (
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs font-bold text-slate-400">
          Loading requests...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs font-bold text-slate-500">
          No requests found matching &quot;{statusFilter}&quot;.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => (
            <div
              key={req.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm card-hover flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-primary-blue border border-blue-100">
                    {req.subject}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      req.status === 'in_progress'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : req.status === 'completed'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {req.status === 'in_progress' ? '● In Progress' : req.status === 'completed' ? '✓ Completed' : `● ${req.status}`}
                  </span>
                </div>

                <h2 className="text-sm font-bold text-slate-900">{req.title}</h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Deadline: {new Date(req.deadlineAt).toLocaleString()}
                  </span>
                  {req.matchedExpert && (
                    <span>Expert: <strong className="text-slate-700">{req.matchedExpert.email}</strong></span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={`/requests/${req.id}`}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
                >
                  View Details
                </Link>
                <Link
                  href="/chat"
                  className="px-4 py-2 rounded-xl bg-primary-navy hover:bg-primary-blue text-white text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default function StudentRequestsListPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <StudentRequestsListContent />
    </ProtectedRoute>
  );
}
