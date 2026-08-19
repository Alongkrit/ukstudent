'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  FileText,
  Clock,
  MessageSquare,
  CheckCircle2,
  Paperclip,
  Star,
  ArrowLeft,
  ShieldAlert,
  Trash2,
  Download,
  AlertCircle,
} from 'lucide-react';
import PaypalCheckout from '../../components/PaypalCheckout';
import ReportModal from '../../components/ReportModal';

import { apiFetch } from '../../lib/api';

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || '';

  const [requestData, setRequestData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showPaypalModal, setShowPaypalModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('Excellent guidance! Very clear and professional.');
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<string | null>(null);

  React.useEffect(() => {
    async function loadRequest() {
      if (!id) return;
      try {
        const res = await apiFetch(`/requests/${id}`);
        if (res.ok) {
          const data = await res.json();
          setRequestData(data);
        }
      } catch (err) {
        console.error('Failed to load request:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRequest();
  }, [id]);

  const handleMarkComplete = async () => {
    try {
      const res = await apiFetch(`/requests/${id}/complete`, { method: 'PATCH' });
      if (res.ok) {
        const updated = await res.json();
        setRequestData(updated);
        setShowReviewModal(true);
      }
    } catch (err) {
      console.error('Error completing request:', err);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    setDeletingAttachmentId(attachmentId);
    try {
      const res = await apiFetch(`/requests/${id}/attachments/${attachmentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setRequestData((prev: any) => ({
          ...prev,
          attachments: prev.attachments.filter((a: any) => a.id !== attachmentId),
        }));
      }
    } catch (err) {
      console.error('Error deleting attachment:', err);
    } finally {
      setDeletingAttachmentId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      <div className="flex items-center justify-between">
        <Link
          href="/requests"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary-navy"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Requests List
        </Link>

        <button
          onClick={() => setShowReportModal(true)}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200"
        >
          <ShieldAlert className="w-4 h-4" />
          Report Issue / Dispute
        </button>
      </div>

      {loading ? (
        <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-xs font-bold text-slate-400">
          Loading request details...
        </div>
      ) : !requestData ? (
        <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-xs font-bold text-slate-500">
          Request not found or access denied.
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-primary-blue border border-blue-100">
                  {requestData.subject}
                </span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                    requestData.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {requestData.status === 'completed' ? '✓ Completed' : `● ${requestData.status}`}
                </span>
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 mt-2">{requestData.title}</h1>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-1.5 shrink-0">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Deadline: <strong className="text-slate-800">{new Date(requestData.deadlineAt).toLocaleString()}</strong></span>
            </div>
          </div>

          {/* Stepper */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="space-y-1">
                <div className="h-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-emerald-700">1. Submitted</span>
              </div>
              <div className="space-y-1">
                <div className={`h-2 rounded-full ${requestData.matchedExpert ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
                <span className={`font-bold ${requestData.matchedExpert ? 'text-emerald-700' : 'text-amber-700'}`}>2. Matched</span>
              </div>
              <div className="space-y-1">
                <div className={`h-2 rounded-full ${requestData.status === 'completed' ? 'bg-emerald-500' : 'bg-primary-blue animate-pulse'}`} />
                <span className={`font-bold ${requestData.status === 'completed' ? 'text-emerald-700' : 'text-primary-blue'}`}>
                  3. In Progress
                </span>
              </div>
              <div className="space-y-1">
                <div className={`h-2 rounded-full ${requestData.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                <span className={`font-medium ${requestData.status === 'completed' ? 'font-bold text-emerald-700' : 'text-slate-400'}`}>
                  4. Completed
                </span>
              </div>
            </div>
          </div>

          {/* Description & Attachments */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
              {requestData.description}
            </p>

            {requestData.attachments && requestData.attachments.length > 0 && (
              <>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">
                  Uploaded Attachments ({requestData.attachments.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {requestData.attachments.map((att: any) => (
                    <div key={att.id || att.fileName} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Paperclip className="w-4 h-4 text-primary-navy shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">{att.fileName}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {att.fileUrl && (
                          <a
                            href={att.fileUrl.startsWith('http') ? att.fileUrl : `http://localhost:3001${att.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-primary-blue hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download attachment"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          disabled={deletingAttachmentId === att.id}
                          onClick={() => handleDeleteAttachment(att.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete attachment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Matched Expert Profile Card */}
          {requestData.matchedExpert ? (
            <div className="p-5 bg-gradient-to-br from-primary-navy/5 to-primary-blue/10 rounded-2xl border border-primary-navy/15 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-primary-navy text-accent-gold font-extrabold flex items-center justify-center text-lg shadow-md">
                  EX
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-slate-900">{requestData.matchedExpert.email}</h4>
                  </div>
                  <p className="text-xs text-slate-600">Matched Academic Tutor</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/chat"
                  className="px-5 py-2.5 rounded-xl bg-primary-navy hover:bg-primary-blue text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  Open Live Chat
                </Link>

                {requestData.status !== 'completed' && (
                  <button
                    onClick={handleMarkComplete}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm Complete
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 text-center text-xs font-bold text-amber-800">
              Broadcast active — searching for eligible available tutors...
            </div>
          )}

        </div>
      )}

      {/* PayPal Checkout Modal */}
      {showPaypalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <PaypalCheckout
            requestId={id}
            amount={requestData?.service?.price || '45.00'}
            currency="GBP"
            onSuccess={() => {
              setShowPaypalModal(false);
            }}
            onCancel={() => setShowPaypalModal(false)}
          />
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        requestId={id}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />

      {/* Post-Completion Rating Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-accent-gold flex items-center justify-center mx-auto">
                <Star className="w-7 h-7 fill-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Session Completed!</h3>
              <p className="text-xs text-slate-500">Rate your experience with {requestData?.matchedExpert?.email || 'Your Expert'}</p>
            </div>

            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Written Feedback (Optional)</label>
              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <button
              onClick={() => setShowReviewModal(false)}
              className="w-full py-3 rounded-xl bg-primary-navy hover:bg-primary-blue text-white font-bold text-xs shadow"
            >
              Submit Rating & Return
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
