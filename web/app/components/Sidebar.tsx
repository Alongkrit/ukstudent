'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileSpreadsheet,
  MessageSquare,
  BookOpen,
  User,
  Shield,
  CheckCircle2,
  DollarSign,
  FileCheck,
  Users,
  Settings,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, role, toggleExpertAvailability } = useAuth();

  if (!user) return null;

  return (
    <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 space-y-6">
      
      {/* Role Badge Card */}
      <div className="p-3 bg-gradient-to-br from-primary-navy/5 to-primary-blue/10 rounded-xl border border-primary-navy/10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-primary-navy">
            {role === 'admin' ? '🛡️ Admin Portal' : role === 'expert' ? '🎓 Expert Portal' : '👨‍🎓 Student Portal'}
          </span>
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        </div>
        <p className="text-xs font-bold text-slate-800 mt-1 truncate">{user.name}</p>
        {role === 'student' && (
          <p className="text-[11px] text-slate-500 truncate">{user.university || 'University'}</p>
        )}
        
        {/* Availability Toggle for Experts */}
        {role === 'expert' && (
          <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Online Status</span>
            <button
              onClick={toggleExpertAvailability}
              className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full transition-colors ${
                user.isAvailable
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {user.isAvailable ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4" />}
              {user.isAvailable ? 'Online' : 'Offline'}
            </button>
          </div>
        )}
      </div>

      {/* Main Student Navigation */}
      {role === 'student' && (
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Menu
          </div>
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === '/dashboard'
                ? 'bg-primary-navy text-white shadow-sm shadow-primary-navy/30'
                : 'text-slate-600 hover:bg-slate-100 hover:text-primary-navy'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/requests/new"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === '/requests/new'
                ? 'bg-accent-gold text-slate-900 shadow-sm'
                : 'text-primary-navy bg-amber-50 hover:bg-amber-100 border border-amber-200/60'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-accent-gold" />
            New Request
          </Link>
          <Link
            href="/requests"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === '/requests'
                ? 'bg-primary-navy text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-primary-navy'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            My Requests
          </Link>
          <Link
            href="/chat"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname.startsWith('/chat')
                ? 'bg-primary-navy text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-primary-navy'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chat Inbox
          </Link>
          <Link
            href="/blog"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname.startsWith('/blog')
                ? 'bg-primary-navy text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-primary-navy'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Study Blog
          </Link>
          <Link
            href="/profile"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === '/profile'
                ? 'bg-primary-navy text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-primary-navy'
            }`}
          >
            <User className="w-4 h-4" />
            Profile & Settings
          </Link>
        </div>
      )}

      {/* Expert Navigation */}
      {role === 'expert' && (
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Expert Portal
          </div>
          <Link
            href="/expert/dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === '/expert/dashboard'
                ? 'bg-primary-navy text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-primary-navy'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Expert Dashboard
          </Link>
          <Link
            href="/expert/requests"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === '/expert/requests'
                ? 'bg-primary-navy text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-primary-navy'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Matching Pool & Active
          </Link>
          <Link
            href="/chat"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname.startsWith('/chat')
                ? 'bg-primary-navy text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-primary-navy'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chat Workspace
          </Link>
          <Link
            href="/expert/earnings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === '/expert/earnings'
                ? 'bg-primary-navy text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-primary-navy'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Earnings & Payouts
          </Link>
          <Link
            href="/expert/status"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === '/expert/status'
                ? 'bg-primary-navy text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-primary-navy'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Verification Status
          </Link>
        </div>
      )}

      {/* Admin Navigation */}
      {role === 'admin' && (
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Admin Console
          </div>
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === '/admin'
                ? 'bg-primary-navy text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-primary-navy'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview Metrics
          </Link>
          <Link
            href="/admin/experts"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === '/admin/experts'
                ? 'bg-primary-navy text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-primary-navy'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Expert Verification Queue
          </Link>
          <Link
            href="/admin/users"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === '/admin/users'
                ? 'bg-primary-navy text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-primary-navy'
            }`}
          >
            <Users className="w-4 h-4" />
            Users Directory
          </Link>
          <Link
            href="/admin/requests"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === '/admin/requests'
                ? 'bg-primary-navy text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-primary-navy'
            }`}
          >
            <Shield className="w-4 h-4" />
            Requests & Transcripts
          </Link>
          <Link
            href="/admin/moderation"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === '/admin/moderation'
                ? 'bg-primary-navy text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-primary-navy'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Moderation Queue
          </Link>
          <Link
            href="/admin/blog"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === '/admin/blog'
                ? 'bg-primary-navy text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-primary-navy'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Blog CMS
          </Link>
        </div>
      )}
    </aside>
  );
};
