'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ReportModalProps {
  requestId?: string;
  conversationId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportModal({ requestId, conversationId, isOpen, onClose }: ReportModalProps) {
  const [reason, setReason] = useState('Academic Integrity Concern');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await fetch('/api/v1/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          conversationId,
          reason,
          details,
        }),
      }).catch(() => null);

      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center space-y-3 py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Report Submitted</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Our Admin Moderation team has received your report. We investigate all reported content within 24 hours to enforce platform safety and academic integrity.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-primary-navy text-white text-xs font-bold rounded-xl hover:bg-primary-blue"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Report Content or Misuse</h3>
                <span className="text-[11px] text-slate-500">Flag for Admin Moderation Review</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Report</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
              >
                <option value="Academic Integrity Concern">Academic Integrity Concern</option>
                <option value="Inappropriate / Unprofessional Language">Inappropriate / Unprofessional Language</option>
                <option value="Payment / Fee Dispute">Payment / Fee Dispute</option>
                <option value="Off-Platform Contact Request">Off-Platform Contact Request</option>
                <option value="Other Misconduct">Other Misconduct</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Additional Details (Optional)</label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe what occurred or paste relevant context..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-2/3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow"
              >
                {submitting ? 'Submitting Report...' : 'Submit Report to Admin'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
