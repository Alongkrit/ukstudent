'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { FileText, ArrowLeft, MessageSquare, X, Loader2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';

const STATUS_FILTERS = ['all', 'submitted', 'matching', 'matched', 'in_progress', 'completed', 'cancelled'];

function AdminRequestsContent() {
  const [requests, setRequests] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [transcriptId, setTranscriptId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<any>(null);
  const [loadingTranscript, setLoadingTranscript] = useState(false);

  const fetchRequests = React.useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = statusFilter === 'all' ? '/admin/requests' : `/admin/requests?status=${statusFilter}`;
      const res = await apiFetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const openTranscript = async (requestId: string) => {
    setTranscriptId(requestId);
    setTranscript(null);
    setLoadingTranscript(true);
    try {
      const res = await apiFetch(`/admin/requests/${requestId}/transcript`);
      if (res.ok) {
        setTranscript(await res.json());
      } else {
        setTranscript({ error: 'No conversation transcript exists for this request yet.' });
      }
    } catch (err) {
      console.error('Failed to load transcript:', err);
      setTranscript({ error: 'Failed to load transcript.' });
    } finally {
      setLoadingTranscript(false);
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
        <h1 className="text-2xl font-extrabold text-primary-navy">Requests & Transcripts</h1>
        <p className="text-xs text-slate-500">Browse all student requests and review chat transcripts</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === s
                ? 'bg-primary-navy text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-6 text-center text-xs font-bold text-slate-400">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="p-6 text-center text-xs font-bold text-slate-500">No requests found.</div>
          ) : (
            requests.map((r) => (
              <div key={r.id} className="p-4 flex items-center justify-between text-xs gap-4">
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 block truncate">{r.title}</span>
                  <span className="text-slate-500">
                    {r.subject} · {r.student?.email} {r.matchedExpert ? `→ ${r.matchedExpert.email}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {r.status?.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => openTranscript(r.id)}
                    className="p-1.5 text-primary-navy hover:bg-blue-50 rounded-lg"
                    title="View chat transcript"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {transcriptId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-navy" />
                Chat Transcript
              </h3>
              <button onClick={() => setTranscriptId(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingTranscript ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary-navy" />
                </div>
              ) : transcript?.error ? (
                <p className="text-xs text-slate-500 text-center py-8">{transcript.error}</p>
              ) : (
                transcript?.messages?.map((m: any) => (
                  <div key={m.id} className="text-xs">
                    <span className="font-bold text-slate-800">{m.sender?.email}</span>
                    <span className="text-slate-400 ml-2">
                      {new Date(m.createdAt).toLocaleString()}
                    </span>
                    <p className="text-slate-600 mt-0.5">{m.body}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminRequestsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminRequestsContent />
    </ProtectedRoute>
  );
}