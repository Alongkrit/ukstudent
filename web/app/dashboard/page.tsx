'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { ProtectedRoute } from '../components/ProtectedRoute';
import {
  PlusCircle,
  Clock,
  MessageSquare,
  BookOpen,
  HelpCircle,
  FileText,
  Award,
  ArrowRight,
  Star,
} from 'lucide-react';

function DashboardContent() {
  const { user } = useAuth();
  const [activeRequest, setActiveRequest] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await apiFetch('/requests');
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.data || [];
          const active = list.find(
            (r: any) => r.status === 'in_progress' || r.status === 'matching' || r.status === 'submitted'
          );
          setActiveRequest(active || null);
        }
      } catch (err) {
        console.error('Failed to load active requests:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  const quickServices = [
    { title: 'Assignment Help', icon: BookOpen, desc: 'Brief analysis & structure' },
    { title: 'Homework Support', icon: HelpCircle, desc: 'Problem set walkthrough' },
    { title: 'Dissertation Guidance', icon: FileText, desc: 'Proposal & methodology' },
    { title: 'Exam Preparation', icon: Award, desc: 'Revision & mock questions' },
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-navy via-primary-blue to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-amber-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
            👋 Welcome Back, {user?.name || 'Student'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Academic Support Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-200">
            {user?.university || 'University Student'} {user?.course ? `• ${user.course}` : ''} {user?.yearOfStudy ? `(${user.yearOfStudy})` : ''}
          </p>
        </div>

        <Link
          href="/requests/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-accent-gold text-slate-900 font-bold text-xs shadow-lg hover:bg-amber-400 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Academic Request</span>
        </Link>
      </div>

      {/* Active Request Card */}
      {loading ? (
        <div className="p-6 bg-white rounded-3xl border border-slate-200 text-center text-xs font-bold text-slate-400">
          Loading your active requests...
        </div>
      ) : activeRequest ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {activeRequest.status === 'in_progress' ? 'Active Session In Progress' : 'Matching Expert'}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Created {new Date(activeRequest.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-primary-blue bg-blue-50 px-2.5 py-0.5 rounded-full">
                {activeRequest.subject}
              </span>
              <h2 className="text-base font-bold text-slate-900 pt-1">
                {activeRequest.title}
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-0.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Deadline: <strong className="text-slate-700">{new Date(activeRequest.deadlineAt).toLocaleString()}</strong>
              </p>
            </div>

            {/* Matched Expert Mini Pill & Chat CTA */}
            {activeRequest.matchedExpert ? (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                <div className="w-10 h-10 rounded-full bg-primary-navy text-accent-gold font-bold flex items-center justify-center text-sm shadow">
                  EX
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <span>{activeRequest.matchedExpert.email.split('@')[0]}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Academic Tutor</span>
                </div>
                <Link
                  href="/chat"
                  className="ml-2 px-4 py-2 rounded-xl bg-primary-navy hover:bg-primary-blue text-white text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Open Chat
                </Link>
              </div>
            ) : (
              <div className="px-4 py-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs font-bold text-amber-800">
                🔍 Searching for available expert...
              </div>
            )}
          </div>

          {/* Stepper */}
          <div className="pt-4 border-t border-slate-100">
            <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
              <div className="space-y-1">
                <div className="w-full h-1.5 bg-emerald-500 rounded-full" />
                <span className="font-bold text-emerald-700">1. Submitted</span>
              </div>
              <div className="space-y-1">
                <div className={`w-full h-1.5 ${activeRequest.matchedExpert ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'} rounded-full`} />
                <span className={`font-bold ${activeRequest.matchedExpert ? 'text-emerald-700' : 'text-amber-700'}`}>2. Matched</span>
              </div>
              <div className="space-y-1">
                <div className={`w-full h-1.5 ${activeRequest.status === 'in_progress' ? 'bg-primary-blue rounded-full animate-pulse' : 'bg-slate-200 rounded-full'}`} />
                <span className={`font-bold ${activeRequest.status === 'in_progress' ? 'text-primary-blue' : 'text-slate-400'}`}>3. In Progress</span>
              </div>
              <div className="space-y-1">
                <div className={`w-full h-1.5 ${activeRequest.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-200'} rounded-full`} />
                <span className={`font-medium ${activeRequest.status === 'completed' ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>4. Completed</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Active Academic Requests</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don&apos;t have any ongoing sessions right now. Submit a request below to match with a Scholza academic expert!
          </p>
          <Link
            href="/requests/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-navy text-white text-xs font-bold rounded-xl shadow"
          >
            <PlusCircle className="w-4 h-4 text-accent-gold" />
            <span>Create First Request</span>
          </Link>
        </div>
      )}

      {/* Quick Launch Services Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-primary-navy">Start a New Request</h3>
          <Link href="/services" className="text-xs font-bold text-primary-blue hover:underline">
            View All Services →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickServices.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.title}
                href={`/requests/new?service=${encodeURIComponent(s.title)}`}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm card-hover flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-primary-navy/10 text-primary-navy flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{s.title}</h4>
                  <p className="text-xs text-slate-500">{s.desc}</p>
                </div>
                <div className="mt-4 flex items-center text-xs font-bold text-primary-navy">
                  <span>Start Request</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
