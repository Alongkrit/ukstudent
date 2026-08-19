'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { apiFetch } from '../../lib/api';
import { CheckCircle2, CreditCard, AlertCircle, ArrowRight } from 'lucide-react';

function ExpertEarningsContent() {
  const { user } = useAuth();
  const [paypalEmail, setPaypalEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEarningsInfo() {
      try {
        const res = await apiFetch('/experts/me/status');
        if (res.ok) {
          const data = await res.json();
          setPaypalEmail(data.paypalEmail || user?.paypalEmail || null);
        } else {
          setPaypalEmail(user?.paypalEmail || null);
        }
      } catch (err) {
        setPaypalEmail(user?.paypalEmail || null);
      } finally {
        setLoading(false);
      }
    }
    fetchEarningsInfo();
  }, [user]);

  const displayPaypal = paypalEmail || user?.paypalEmail;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-primary-navy">Earnings & Payouts</h1>
        <p className="text-xs text-slate-500">Track your weekly academic tutoring earnings and PayPal Payout transfers</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-gradient-to-br from-primary-navy to-primary-blue text-white rounded-2xl shadow">
          <span className="text-[11px] font-bold text-slate-300 uppercase">Available Payout Balance</span>
          <div className="text-3xl font-extrabold mt-1">£0.00</div>
          <span className="text-[10px] text-amber-300 font-semibold block mt-1">Transfers process weekly</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Lifetime Earned</span>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">£0.00</div>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Completed sessions</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">PayPal Payout Account</span>
            {displayPaypal ? (
              <div className="text-sm font-extrabold text-blue-700 flex items-center gap-1.5 mt-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="truncate">{displayPaypal}</span>
              </div>
            ) : (
              <div className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-2 italic">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                Not provided
              </div>
            )}
          </div>
          <Link
            href="/expert/status"
            className="text-[11px] font-bold text-primary-navy hover:underline flex items-center gap-1 mt-2"
          >
            <span>{displayPaypal ? 'Manage PayPal Account' : 'Add PayPal Account'}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Payout History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">PayPal Payout Transfer History</h2>
          <span className="text-xs text-blue-600 font-semibold flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5" />
            Automated PayPal Transfers
          </span>
        </div>

        <p className="text-xs text-slate-400 italic py-4 text-center">
          No payout transfers recorded yet. Completed tutoring sessions will appear here automatically.
        </p>
      </div>
    </div>
  );
}

export default function ExpertEarningsPage() {
  return (
    <ProtectedRoute allowedRoles={['expert']}>
      <ExpertEarningsContent />
    </ProtectedRoute>
  );
}
