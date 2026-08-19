'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { apiFetch } from '../../lib/api';
import { CheckCircle2, MessageSquare, Zap, Loader2, AlertCircle } from 'lucide-react';

function ExpertRequestsContent() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await apiFetch('/requests');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.data || [];
        setRequests(list);
      }
    } catch (err) {
      console.error('Failed to load expert requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (requestId: string) => {
    setError(null);
    setAcceptingId(requestId);
    try {
      const res = await apiFetch(`/requests/${requestId}/accept`, {
        method: 'PATCH',
      });

      if (res.ok) {
        await fetchRequests();
      } else {
        const errData = await res.json().catch(() => ({ message: 'Failed to accept request' }));
        setError(errData.message || 'Request is no longer available.');
      }
    } catch (err: any) {
      setError(err.message || 'Error accepting request');
    } finally {
      setAcceptingId(null);
    }
  };

  const matchingPool = requests.filter((r) => r.status === 'matching' || r.status === 'submitted');
  const activeSessions = requests.filter((r) => r.status === 'in_progress' && r.matchedExpertId === user?.id);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-primary-navy">Matching Pool & Active Requests</h1>
        <p className="text-xs text-slate-500">View incoming student requests in your matched subjects and active sessions</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Available Pool Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent-gold" />
          Available Matching Pool (First-to-Accept Wins)
        </h2>

        {loading ? (
          <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs font-bold text-slate-400">
            Loading matching pool...
          </div>
        ) : matchingPool.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs font-medium text-slate-500">
            No pending requests currently waiting in your matching pool.
          </div>
        ) : (
          matchingPool.map((req) => (
            <div
              key={req.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-primary-blue border border-blue-100">
                  {req.subject}
                </span>
                <h3 className="text-sm font-bold text-slate-900">{req.title}</h3>
                <p className="text-xs text-slate-500">
                  Student: <strong>{req.student?.email || 'Authenticated Student'}</strong> • Deadline: {new Date(req.deadlineAt).toLocaleString()}
                </p>
              </div>

              <button
                disabled={acceptingId === req.id}
                onClick={() => handleAccept(req.id)}
                className="px-5 py-2.5 rounded-xl bg-primary-navy hover:bg-primary-blue text-white text-xs font-bold flex items-center gap-1.5 shadow shrink-0"
              >
                {acceptingId === req.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-accent-gold" />
                    <span>Accepting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Accept Request</span>
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Active Accepted Requests */}
      <div className="space-y-3 pt-4">
        <h2 className="text-sm font-bold text-slate-800">Active Sessions (Working)</h2>

        {loading ? (
          <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs font-bold text-slate-400">
            Loading active sessions...
          </div>
        ) : activeSessions.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs font-medium text-slate-500">
            No active sessions currently in progress.
          </div>
        ) : (
          activeSessions.map((req) => (
            <div
              key={req.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ● Active Chat Session
                </span>
                <h3 className="text-sm font-bold text-slate-900">{req.title}</h3>
                <p className="text-xs text-slate-500">
                  Student: {req.student?.email || 'Student'} • University: {req.student?.studentProfile?.university || 'University'}
                </p>
              </div>

              <Link
                href="/chat"
                className="px-4 py-2.5 rounded-xl bg-primary-navy hover:bg-primary-blue text-white text-xs font-bold flex items-center gap-1.5 shadow shrink-0"
              >
                <MessageSquare className="w-4 h-4" />
                Open Chat Workspace
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function ExpertRequestsPage() {
  return (
    <ProtectedRoute allowedRoles={['expert']}>
      <ExpertRequestsContent />
    </ProtectedRoute>
  );
}
