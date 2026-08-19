'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { apiFetch, getAccessToken } from '../../lib/api';
import {
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  Upload,
  FileText,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Edit2,
  Check,
} from 'lucide-react';

interface ExpertDoc {
  id: string;
  docType: string;
  fileUrl: string;
  fileName?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
}

interface StatusData {
  verificationStatus: 'none' | 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  isAvailable?: boolean;
  ratingAvg?: number;
  paypalEmail?: string;
  qualifications?: string;
  subjects?: string[];
  bio?: string;
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

function ExpertStatusContent() {
  const { user, refreshUser } = useAuth();
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);

  // PayPal update state
  const [editingPaypal, setEditingPaypal] = useState(false);
  const [paypalInput, setPaypalInput] = useState('');
  const [savingPaypal, setSavingPaypal] = useState(false);
  const [paypalMsg, setPaypalMsg] = useState<string | null>(null);

  // Document upload state
  const [selectedDocType, setSelectedDocType] = useState('degree_certificate');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Resubmit state
  const [resubmitting, setResubmitting] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await apiFetch('/experts/me/status');
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
        if (data.paypalEmail) {
          setPaypalInput(data.paypalEmail);
        }
      }
    } catch (err) {
      console.error('Failed to fetch status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleSavePaypal = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaypalMsg(null);
    if (!paypalInput || !paypalInput.includes('@')) {
      setPaypalMsg('Please enter a valid PayPal email address.');
      return;
    }

    setSavingPaypal(true);
    try {
      const res = await apiFetch('/experts/payout-account', {
        method: 'PATCH',
        body: JSON.stringify({ paypalEmail: paypalInput.trim() }),
      });

      if (res.ok) {
        setPaypalMsg('PayPal payout account updated successfully!');
        setEditingPaypal(false);
        await refreshUser();
        await fetchStatus();
      } else {
        const err = await res.json();
        setPaypalMsg(err.message || 'Failed to update PayPal account.');
      }
    } catch (err) {
      setPaypalMsg('Network error updating PayPal account.');
    } finally {
      setSavingPaypal(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadMsg(null);

    if (!selectedFile) {
      setUploadMsg({ type: 'error', text: 'Please select a file to upload.' });
      return;
    }

    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('docType', selectedDocType);

      const response = await apiFetch('/experts/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadMsg({ type: 'success', text: 'Document uploaded successfully!' });
        setSelectedFile(null);
        // Reset file input element
        const fileInput = document.getElementById('doc-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        await fetchStatus();
      } else {
        const err = await response.json();
        setUploadMsg({ type: 'error', text: err.message || 'Upload failed.' });
      }
    } catch (err) {
      setUploadMsg({ type: 'error', text: 'Error uploading file to server.' });
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleResubmit = async () => {
    setResubmitting(true);
    try {
      const res = await apiFetch('/experts/resubmit', { method: 'POST' });
      if (res.ok) {
        await fetchStatus();
      }
    } catch (err) {
      console.error('Failed to resubmit application:', err);
    } finally {
      setResubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-navy" />
      </div>
    );
  }

  const currentStatus = statusData?.verificationStatus || 'pending';
  const paypalAccount = statusData?.paypalEmail || user?.paypalEmail;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-4 pb-12">
      {/* Top Banner & Main Status Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
        {currentStatus === 'approved' && (
          <>
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Application Status: APPROVED
              </span>
              <h1 className="text-2xl font-extrabold text-primary-navy pt-2">Verified Scholza Academic Expert</h1>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your credentials have been verified by the Admin team. You are fully eligible to accept student requests and receive broadcast matches.
              </p>
            </div>
          </>
        )}

        {currentStatus === 'pending' && (
          <>
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Application Status: PENDING REVIEW
              </span>
              <h1 className="text-2xl font-extrabold text-primary-navy pt-2">Verification Under Review</h1>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your application and submitted documents are currently being reviewed by our admin verification team. Matching is temporarily paused until approved.
              </p>
            </div>
          </>
        )}

        {currentStatus === 'rejected' && (
          <>
            <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-sm">
              <XCircle className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-red-800 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                Application Status: REJECTED
              </span>
              <h1 className="text-2xl font-extrabold text-primary-navy pt-2">Action Required</h1>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your application could not be verified with the current documents provided. Please see the rejection reason below and upload corrected proof.
              </p>
            </div>

            {statusData?.rejectionReason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-left space-y-1">
                <span className="text-xs font-bold text-red-900 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Admin Rejection Reason
                </span>
                <p className="text-xs text-red-800">{statusData.rejectionReason}</p>
              </div>
            )}

            <button
              onClick={handleResubmit}
              disabled={resubmitting}
              className="w-full py-3 rounded-xl bg-primary-navy hover:bg-primary-blue text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              {resubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Resubmit Application for Review</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </>
        )}

        {/* Profile Overview Box */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-2">
          <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
            <span className="text-slate-500 font-semibold">Tutor Name</span>
            <span className="font-bold text-slate-900">{user?.name || user?.email}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
            <span className="text-slate-500 font-semibold">Qualifications</span>
            <span className="font-bold text-slate-900">{statusData?.qualifications || user?.qualifications || 'Higher Education Degree'}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              PayPal Payout Account
            </span>
            <div className="flex items-center gap-2">
              {paypalAccount ? (
                <span className="font-bold text-blue-700">✓ {paypalAccount}</span>
              ) : (
                <span className="font-bold text-slate-400 italic">Not provided</span>
              )}
              <button
                type="button"
                onClick={() => setEditingPaypal(!editingPaypal)}
                className="text-[11px] font-bold text-primary-navy hover:underline flex items-center gap-0.5 ml-1"
              >
                <Edit2 className="w-3 h-3" />
                {editingPaypal ? 'Cancel' : paypalAccount ? 'Change' : 'Add'}
              </button>
            </div>
          </div>

          {/* Inline PayPal Form */}
          {editingPaypal && (
            <form onSubmit={handleSavePaypal} className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2 mt-2">
              <label className="block text-[11px] font-bold text-slate-700">Enter PayPal Email Address</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="your-paypal@email.com"
                  value={paypalInput}
                  onChange={(e) => setPaypalInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={savingPaypal}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow-sm"
                >
                  {savingPaypal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Save
                </button>
              </div>
              {paypalMsg && <p className="text-[10px] font-bold text-blue-800">{paypalMsg}</p>}
            </form>
          )}

          <div className="flex justify-between">
            <span className="text-slate-500 font-semibold">Verified Subjects</span>
            <span className="font-bold text-primary-blue">
              {(statusData?.subjects && statusData.subjects.length > 0)
                ? statusData.subjects.join(', ')
                : 'General Academic Support'}
            </span>
          </div>
        </div>

        <Link
          href="/expert/dashboard"
          className="w-full py-3.5 rounded-xl bg-primary-navy hover:bg-primary-blue text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>Go to Expert Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Document Upload Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-primary-navy flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary-blue" />
            Upload Verification Documents
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">Supported: PDF, JPG, PNG (Max 25MB)</span>
        </div>

        {uploadMsg && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold ${
              uploadMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {uploadMsg.text}
          </div>
        )}

        <form onSubmit={handleUploadDocument} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Document Type</label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy"
              >
                <option value="degree_certificate">Degree Certificate</option>
                <option value="academic_transcript">Academic Transcript</option>
                <option value="government_id">Government Passport / ID</option>
                <option value="professional_certificate">Professional Qualification</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select File</label>
              <input
                id="doc-file-input"
                type="file"
                required
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={uploadingDoc || !selectedFile}
            className="w-full py-2.5 rounded-xl bg-primary-blue hover:bg-primary-navy text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {uploadingDoc ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading Document...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload Verification Document</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Uploaded Documents List */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-primary-navy flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-blue" />
          Submitted Documents ({statusData?.documents.length || 0})
        </h2>

        {!statusData?.documents || statusData.documents.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No verification documents uploaded yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {statusData.documents.map((doc) => (
              <div key={doc.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">
                    {DOC_TYPE_LABELS[doc.docType] || doc.docType}
                  </span>
                  <span className="text-[11px] text-slate-500 block">{doc.fileName || doc.fileUrl}</span>
                  <span className="text-[10px] text-slate-400 block">
                    Uploaded on {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      doc.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : doc.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {doc.status}
                  </span>

                  <a
                    href={doc.fileUrl.startsWith('http') ? doc.fileUrl : `http://localhost:3001${doc.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-primary-blue hover:underline"
                  >
                    View File
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExpertStatusPage() {
  return (
    <ProtectedRoute allowedRoles={['expert']}>
      <ExpertStatusContent />
    </ProtectedRoute>
  );
}
