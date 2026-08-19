'use client';

import React from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../components/ProtectedRoute';
import {
  Shield,
  Users,
  FileCheck,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

import { apiFetch } from '../lib/api';

function AdminOverviewContent() {
  const [metrics, setMetrics] = React.useState<any>({
    activeRequests: 0,
    pendingExperts: 0,
    gmv: '£0.00',
    totalUsers: 0,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadOverview() {
      try {
        const res = await apiFetch('/admin/overview');
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (err) {
        console.error('Failed to fetch admin overview metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-primary-navy to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-amber-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
            🛡️ Admin Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Platform Overview</h1>
          <p className="text-xs text-slate-300">Live operational metrics, verification queues, and system management</p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/experts"
            className="px-4 py-2.5 rounded-xl bg-accent-gold text-slate-900 text-xs font-bold shadow hover:bg-amber-400"
          >
            Review Pending Experts ({metrics.pendingExperts})
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Pending Verification</span>
            <FileCheck className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{metrics.pendingExperts}</div>
          <Link href="/admin/experts" className="text-[11px] font-bold text-primary-blue hover:underline">
            Open Queue →
          </Link>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Active Requests</span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{metrics.activeRequests}</div>
          <Link href="/admin/requests" className="text-[11px] font-bold text-primary-blue hover:underline">
            Monitor Requests →
          </Link>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Platform GMV</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{metrics.gmv}</div>
          <span className="text-[10px] text-emerald-600 font-bold">Total Gross Volume</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Total Registered</span>
            <Users className="w-5 h-5 text-primary-blue" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{metrics.totalUsers}</div>
          <Link href="/admin/users" className="text-[11px] font-bold text-primary-blue hover:underline">
            View Directory →
          </Link>
        </div>

      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/experts"
          className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm card-hover space-y-2"
        >
          <FileCheck className="w-6 h-6 text-accent-gold" />
          <h3 className="text-sm font-bold text-slate-900">Expert Verification Queue</h3>
          <p className="text-xs text-slate-500">Review passports, degree certificates, and approve/reject tutor applications.</p>
        </Link>

        <Link
          href="/admin/users"
          className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm card-hover space-y-2"
        >
          <Users className="w-6 h-6 text-primary-navy" />
          <h3 className="text-sm font-bold text-slate-900">Users Directory</h3>
          <p className="text-xs text-slate-500">Search student and expert accounts, manage profile roles, and trigger suspensions.</p>
        </Link>

        <Link
          href="/admin/requests"
          className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm card-hover space-y-2"
        >
          <Shield className="w-6 h-6 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Requests & Transcripts Monitor</h3>
          <p className="text-xs text-slate-500">Oversee all platform sessions and view read-only chat transcripts for dispute review.</p>
        </Link>
      </div>

    </div>
  );
}

export default function AdminOverviewPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminOverviewContent />
    </ProtectedRoute>
  );
}
