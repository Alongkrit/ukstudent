'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import {
  CheckCircle2,
  Zap,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { apiFetch } from '../../lib/api';

function ExpertDashboardContent() {
  const router = useRouter();
  const { user, toggleExpertAvailability } = useAuth();
  const [incomingRequest, setIncomingRequest] = useState<any>(null);
  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpertData = React.useCallback(async () => {
    try {
      const res = await apiFetch('/requests');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.data || [];
        const matching = list.find((r: any) => r.status === 'matching' || r.status === 'submitted');
        const activeList = list.filter((r: any) => r.status === 'in_progress');
        setIncomingRequest(matching || null);
        setActiveRequests(activeList);
      }
    } catch (err) {
      console.error('Failed to load expert requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchExpertData();
  }, [fetchExpertData]);

  const handleAccept = async () => {
    if (!incomingRequest) return;
    try {
      const res = await apiFetch(`/requests/${incomingRequest.id}/accept`, {
        method: 'PATCH',
      });
      if (res.ok) {
        const data = await res.json();
        setIncomingRequest(null);
        router.push('/chat');
      } else {
        alert('Could not accept request. It may have been claimed by another expert.');
        fetchExpertData();
      }
    } catch (err) {
      console.error('Accept request error:', err);
    }
  };

  const handleDecline = async () => {
    if (!incomingRequest) return;
    try {
      await apiFetch(`/requests/${incomingRequest.id}/decline`, {
        method: 'PATCH',
      });
    } catch (err) {
      console.error('Decline request error:', err);
    } finally {
      setIncomingRequest(null);
    }
  };

  const verificationStatus = user?.verificationStatus || 'pending';
  const isApproved = verificationStatus === 'approved';

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Availability Toggle Card */}
      <div className="bg-gradient-to-r from-primary-navy via-primary-blue to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
            🎓 Expert Console — {user?.name || 'Academic Expert'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Expert Dashboard</h1>
          <p className="text-xs text-slate-200">
            {user?.qualifications || 'Academic Expert'}
          </p>
        </div>

        {/* Availability Switch */}
        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-between gap-4 shrink-0">
          <div>
            <span className="text-xs font-bold block">Online Availability</span>
            <span className="text-[10px] text-slate-300">
              {!isApproved
                ? 'Verification required to go online'
                : user?.isAvailable
                ? 'Receiving broadcast matches'
                : 'Offline (No alerts)'}
            </span>
          </div>
          <button
            onClick={() => {
              if (!isApproved) {
                alert('Your account is pending verification. Once approved by the Admin team, you can switch online.');
                return;
              }
              toggleExpertAvailability();
            }}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
              !isApproved
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : user?.isAvailable
                ? 'bg-emerald-400 text-slate-900 shadow-md'
                : 'bg-slate-700 text-slate-300'
            }`}
          >
            {user?.isAvailable && isApproved ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            {user?.isAvailable && isApproved ? 'ONLINE' : 'OFFLINE'}
          </button>
        </div>
      </div>

      {/* Broadcast Alert Modal / Card if available */}
      {incomingRequest && user?.isAvailable && isApproved && (
        <div className="p-6 bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border-2 border-accent-gold rounded-3xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 bg-accent-gold px-3 py-1 rounded-full flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-amber-900" />
              Incoming Request Match Alert
            </span>
            <span className="text-xs font-bold text-amber-900">Standard Payout</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-primary-navy bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
              {incomingRequest.subject}
            </span>
            <h3 className="text-base font-extrabold text-slate-900 pt-1">{incomingRequest.title}</h3>
            <p className="text-xs text-slate-600">Student ID: <strong>{incomingRequest.studentId}</strong> • Deadline: {new Date(incomingRequest.deadlineAt).toLocaleString()}</p>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleAccept}
              className="flex-1 py-3 rounded-xl bg-primary-navy hover:bg-primary-blue text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Accept Request & Open Chat
            </button>
            <button
              onClick={handleDecline}
              className="px-4 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/expert/status" className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1 hover:border-primary-blue transition-all block">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Verification Status</span>
          <div
            className={`text-2xl font-extrabold capitalize ${
              verificationStatus === 'approved'
                ? 'text-emerald-600'
                : verificationStatus === 'rejected'
                ? 'text-red-600'
                : 'text-amber-600'
            }`}
          >
            {verificationStatus}
          </div>
          <span className="text-[10px] text-slate-500 font-bold block">
            {verificationStatus === 'approved'
              ? 'Verified Scholza Academic Expert'
              : verificationStatus === 'rejected'
              ? 'Application rejected — click to view'
              : 'Pending review by Admin team'}
          </span>
        </Link>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Active Sessions</span>
          <div className="text-2xl font-extrabold text-primary-navy">{activeRequests.length} Active</div>
          <span className="text-[10px] text-primary-blue font-bold">Assigned sessions</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Expert Rating</span>
          <div className="text-2xl font-extrabold text-amber-500">{user?.ratingAvg ? Number(user.ratingAvg).toFixed(2) : '5.00'} / 5.0</div>
          <span className="text-[10px] text-slate-500 font-bold">Verified reviews</span>
        </div>
      </div>

    </div>
  );
}

export default function ExpertDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['expert']}>
      <ExpertDashboardContent />
    </ProtectedRoute>
  );
}
