'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { apiFetch } from '../../lib/api';
import {
  CheckCircle2,
  XCircle,
  FileText,
  ArrowLeft,
  Loader2,
  ExternalLink,
  CreditCard,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';

interface ExpertDoc {
  id: string;
  docType: string;
  fileUrl: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  status: string;
  createdAt: string;
}

interface Application {
  userId: string;
  qualifications: string;
  subjects: string[];
  bio?: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  paypalEmail?: string;
  isAvailable: boolean;
  user: {
    id: string;
    email: string;
    phone?: string;
    createdAt: string;
    studentProfile?: {
      fullName?: string;
    };
  };
  documents: ExpertDoc[];
}

const DOC_TYPE_LABELS: Record<string, string> = {
  degree_certificate: 'Degree Certificate',
  academic_transcript: 'Academic Transcript',
  government_id: 'Government ID',
  professional_certificate: 'Professional Certificate',
  qualification: 'Proof of Qualification',
  identity: 'Proof of Identity',
};

function AdminExpertsContent() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Rejection Modal State
  const [rejectingTargetId, setRejectingTargetId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      const endpoint = statusFilter === 'all' ? '/admin/expert-applications' : `/admin/expert-applications?status=${statusFilter}`;
      const res = await apiFetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setApplications(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch expert applications:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleApprove = async (expertId: string) => {
    setSubmittingAction(true);
    try {
      const res = await apiFetch(`/admin/expert-applications/${expertId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved' }),
      });
      if (res.ok) {
        await fetchApplications();
      } else {
        alert('Failed to approve application.');
      }
    } catch (err) {
      console.error('Approve error:', err);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingTargetId) return;

    if (!rejectionReasonInput.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }

    setSubmittingAction(true);
    try {
      const res = await apiFetch(`/admin/expert-applications/${rejectingTargetId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'rejected',
          rejectionReason: rejectionReasonInput.trim(),
        }),
      });

      if (res.ok) {
        setRejectingTargetId(null);
        setRejectionReasonInput('');
        await fetchApplications();
      } else {
        alert('Failed to reject application.');
      }
    } catch (err) {
      console.error('Reject error:', err);
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="text-xs font-bold text-slate-500 hover:text-primary-navy flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Admin Overview
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-primary-navy">Expert Verification Queue</h1>
          <p className="text-xs text-slate-500">Review proof of qualification, academic transcripts, and identity documents before approving experts</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold shrink-0">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                statusFilter === tab ? 'bg-white text-primary-navy shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-navy" />
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
          <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No expert applications found</p>
          <p className="text-xs text-slate-400">There are currently no applications matching status &ldquo;{statusFilter}&rdquo;.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const displayName =
              app.user?.studentProfile?.fullName ||
              app.user?.email?.split('@')[0].replace('.', ' ') ||
              'Academic Expert';

            return (
              <div key={app.userId} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-slate-900">{displayName}</span>
                      <span className="text-xs text-slate-500">({app.user?.email})</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          app.verificationStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.verificationStatus === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {app.verificationStatus}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                      <span>Qualifications: <strong className="text-slate-900">{app.qualifications || 'Not specified'}</strong></span>
                      {app.paypalEmail && (
                        <span className="flex items-center gap-1 text-blue-700 font-semibold">
                          <CreditCard className="w-3.5 h-3.5" />
                          PayPal: {app.paypalEmail}
                        </span>
                      )}
                      <span className="text-slate-400">Applied: {new Date(app.user?.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {app.verificationStatus === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleApprove(app.userId)}
                        disabled={submittingAction}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve Expert
                      </button>
                      <button
                        onClick={() => {
                          setRejectingTargetId(app.userId);
                          setRejectionReasonInput('');
                        }}
                        disabled={submittingAction}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}

                  {app.verificationStatus === 'rejected' && app.rejectionReason && (
                    <div className="text-xs text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-100 max-w-sm">
                      <strong>Rejection reason:</strong> {app.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Subjects & Bio */}
                <div className="space-y-2">
                  {app.subjects && app.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-xs font-semibold text-slate-500 mr-1">Verified Subjects:</span>
                      {app.subjects.map((s) => (
                        <span key={s} className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {app.bio && <p className="text-xs text-slate-600 italic">&ldquo;{app.bio}&rdquo;</p>}
                </div>

                {/* Uploaded Documents List */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-700 block">Uploaded Verification Documents ({app.documents?.length || 0}):</span>
                  {!app.documents || app.documents.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No verification documents uploaded yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {app.documents.map((doc) => (
                        <div key={doc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs">
                          <div className="space-y-0.5 truncate">
                            <span className="font-bold text-slate-900 block truncate">
                              {DOC_TYPE_LABELS[doc.docType] || doc.docType}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate">{doc.fileName || doc.fileUrl}</span>
                          </div>
                          <a
                            href={doc.fileUrl.startsWith('http') ? doc.fileUrl : `http://localhost:3001${doc.fileUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-primary-navy font-bold text-[11px] rounded-lg shrink-0 flex items-center gap-1 shadow-sm"
                          >
                            <span>View</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingTargetId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-extrabold text-slate-900">Reject Application</h3>
            </div>

            <p className="text-xs text-slate-600">
              Please enter the specific reason for rejecting this expert application. The expert will be notified and can re-upload corrected documents.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rejection Reason</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Degree certificate image was unreadable or missing seal..."
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingTargetId(null)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow"
                >
                  {submittingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminExpertsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminExpertsContent />
    </ProtectedRoute>
  );
}
