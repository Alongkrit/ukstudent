'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { apiFetch } from '../../lib/api';
import { Shield, ArrowLeft, AlertTriangle, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

function AdminModerationContent() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      const res = await apiFetch('/admin/moderation');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.data || [];
        setReports(list);
      }
    } catch (err) {
      console.error('Failed to load moderation queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (reportId: string) => {
    setError(null);
    setResolvingId(reportId);
    try {
      const res = await apiFetch(`/admin/moderation/${reportId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          actionTaken: 'Reviewed and resolved by Admin',
          status: 'resolved',
        }),
      });

      if (res.ok) {
        await fetchReports();
      } else {
        const errData = await res.json().catch(() => ({ message: 'Failed to resolve report' }));
        setError(errData.message || 'Error updating report status.');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with server.');
    } finally {
      setResolvingId(null);
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
        <h1 className="text-2xl font-extrabold text-primary-navy">Moderation & Safety Queue</h1>
        <p className="text-xs text-slate-500">Investigate reported conversations and enforce academic conduct standards</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs font-bold text-slate-400">
            Loading moderation queue...
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs font-medium text-slate-500">
            No moderation reports found in queue.
          </div>
        ) : (
          reports.map((rep) => (
            <div key={rep.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Reported by {rep.reporter?.email || 'Anonymous User'} ({rep.reporter?.role || 'User'})
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(rep.createdAt).toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-slate-700">Reason: <strong>{rep.reason}</strong></p>
              {rep.details && <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">{rep.details}</p>}
              <p className="text-xs text-slate-500">
                Target:{' '}
                {rep.request
                  ? `Request #${rep.request.id} (${rep.request.title})`
                  : rep.conversation
                  ? `Conversation #${rep.conversation.id}`
                  : 'General Content'}
              </p>

              {rep.status === 'pending' || rep.status === 'investigating' ? (
                <button
                  disabled={resolvingId === rep.id}
                  onClick={() => handleResolve(rep.id)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  {resolvingId === rep.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Resolving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Resolved</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    ✓ Resolved ({rep.actionTaken || 'Action completed'})
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AdminModerationPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminModerationContent />
    </ProtectedRoute>
  );
}
