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
  DollarSign,
  PlusCircle,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { user, role } = useAuth();

  if (!user) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-slate-200/80 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {role === 'student' && (
          <>
            <Link
              href="/dashboard"
              className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold ${
                pathname === '/dashboard' ? 'text-primary-navy font-bold' : 'text-slate-500'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <Link
              href="/requests"
              className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold ${
                pathname === '/requests' ? 'text-primary-navy font-bold' : 'text-slate-500'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>Requests</span>
            </Link>
            <Link
              href="/requests/new"
              className="flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold text-white bg-primary-navy rounded-full p-2.5 shadow-md shadow-primary-navy/30 -mt-5 border-2 border-white"
            >
              <PlusCircle className="w-5 h-5 text-accent-gold" />
            </Link>
            <Link
              href="/chat"
              className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold relative ${
                pathname.startsWith('/chat') ? 'text-primary-navy font-bold' : 'text-slate-500'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span>Chat</span>
              <span className="absolute top-0 right-2 w-2 h-2 bg-accent-gold rounded-full" />
            </Link>
            <Link
              href="/profile"
              className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold ${
                pathname === '/profile' ? 'text-primary-navy font-bold' : 'text-slate-500'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>
          </>
        )}

        {role === 'expert' && (
          <>
            <Link
              href="/expert/dashboard"
              className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold ${
                pathname === '/expert/dashboard' ? 'text-primary-navy font-bold' : 'text-slate-500'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/expert/requests"
              className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold ${
                pathname === '/expert/requests' ? 'text-primary-navy font-bold' : 'text-slate-500'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>Pool</span>
            </Link>
            <Link
              href="/chat"
              className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold ${
                pathname.startsWith('/chat') ? 'text-primary-navy font-bold' : 'text-slate-500'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span>Chat</span>
            </Link>
            <Link
              href="/expert/earnings"
              className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold ${
                pathname === '/expert/earnings' ? 'text-primary-navy font-bold' : 'text-slate-500'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              <span>Earnings</span>
            </Link>
          </>
        )}

        {role === 'admin' && (
          <>
            <Link
              href="/admin"
              className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold ${
                pathname === '/admin' ? 'text-primary-navy font-bold' : 'text-slate-500'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Metrics</span>
            </Link>
            <Link
              href="/admin/experts"
              className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold ${
                pathname === '/admin/experts' ? 'text-primary-navy font-bold' : 'text-slate-500'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span>Vetting</span>
            </Link>
            <Link
              href="/admin/users"
              className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold ${
                pathname === '/admin/users' ? 'text-primary-navy font-bold' : 'text-slate-500'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Users</span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
