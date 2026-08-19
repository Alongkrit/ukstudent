'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  ToggleLeft,
  ToggleRight,
  Shield,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, role, logout, toggleExpertAvailability } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-navy to-primary-blue flex items-center justify-center text-white shadow-md shadow-primary-navy/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-accent-gold" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-primary-navy leading-none tracking-tight">
                SCHOL<span className="text-accent-gold">ZA</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 tracking-wider">
                ACADEMIC EXCELLENCE
              </span>
            </div>
          </Link>

          {/* Dynamic Navigation Links based on Role (Requirement #8) */}
          <nav className="hidden md:flex items-center gap-6">
            {!user && (
              <>
                <Link
                  href="/"
                  className={`text-sm font-semibold transition-colors ${
                    pathname === '/' ? 'text-primary-navy font-bold' : 'text-slate-600 hover:text-primary-navy'
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/services"
                  className={`text-sm font-semibold transition-colors ${
                    pathname === '/services' ? 'text-primary-navy font-bold' : 'text-slate-600 hover:text-primary-navy'
                  }`}
                >
                  Services
                </Link>
                <Link
                  href="/blog"
                  className={`text-sm font-semibold transition-colors ${
                    pathname.startsWith('/blog') ? 'text-primary-navy font-bold' : 'text-slate-600 hover:text-primary-navy'
                  }`}
                >
                  Study Blog
                </Link>
              </>
            )}

            {user && role === 'student' && (
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm font-semibold transition-colors ${
                    pathname === '/dashboard' ? 'text-primary-navy font-bold' : 'text-slate-600 hover:text-primary-navy'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/services"
                  className={`text-sm font-semibold transition-colors ${
                    pathname === '/services' ? 'text-primary-navy font-bold' : 'text-slate-600 hover:text-primary-navy'
                  }`}
                >
                  Services
                </Link>
                <Link
                  href="/requests"
                  className={`text-sm font-semibold transition-colors ${
                    pathname.startsWith('/requests') ? 'text-primary-navy font-bold' : 'text-slate-600 hover:text-primary-navy'
                  }`}
                >
                  Requests
                </Link>
                <Link
                  href="/chat"
                  className={`text-sm font-semibold transition-colors flex items-center gap-1 ${
                    pathname === '/chat' ? 'text-primary-navy font-bold' : 'text-slate-600 hover:text-primary-navy'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </Link>
              </>
            )}

            {user && role === 'expert' && (
              <>
                <Link
                  href="/expert/dashboard"
                  className={`text-sm font-semibold transition-colors ${
                    pathname === '/expert/dashboard' ? 'text-primary-navy font-bold' : 'text-slate-600 hover:text-primary-navy'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/expert/requests"
                  className={`text-sm font-semibold transition-colors ${
                    pathname === '/expert/requests' ? 'text-primary-navy font-bold' : 'text-slate-600 hover:text-primary-navy'
                  }`}
                >
                  Requests
                </Link>
                <button
                  onClick={toggleExpertAvailability}
                  className={`text-sm font-semibold transition-colors flex items-center gap-1 px-2.5 py-1 rounded-full border ${
                    user.isAvailable
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                >
                  {user.isAvailable ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4" />}
                  <span>{user.isAvailable ? 'Online' : 'Offline'}</span>
                </button>
              </>
            )}

            {user && role === 'admin' && (
              <>
                <Link
                  href="/admin"
                  className={`text-sm font-semibold transition-colors flex items-center gap-1 ${
                    pathname === '/admin' ? 'text-primary-navy font-bold' : 'text-slate-600 hover:text-primary-navy'
                  }`}
                >
                  <Shield className="w-4 h-4 text-primary-navy" />
                  Admin Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  className={`text-sm font-semibold transition-colors ${
                    pathname === '/admin/users' ? 'text-primary-navy font-bold' : 'text-slate-600 hover:text-primary-navy'
                  }`}
                >
                  Users
                </Link>
                <Link
                  href="/admin/experts"
                  className={`text-sm font-semibold transition-colors ${
                    pathname === '/admin/experts' ? 'text-primary-navy font-bold' : 'text-slate-600 hover:text-primary-navy'
                  }`}
                >
                  Experts
                </Link>
                <Link
                  href="/admin/moderation"
                  className={`text-sm font-semibold transition-colors ${
                    pathname === '/admin/moderation' ? 'text-primary-navy font-bold' : 'text-slate-600 hover:text-primary-navy'
                  }`}
                >
                  Moderation
                </Link>
              </>
            )}
          </nav>

          {/* Right Action / Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary-navy" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-primary-navy text-white">
                    {user.role}
                  </span>
                </span>
                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-error transition-colors flex items-center gap-1 text-xs font-semibold"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-bold text-primary-navy hover:text-primary-blue px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  href="/requests/new"
                  className="text-xs font-bold text-slate-900 bg-accent-gold hover:bg-amber-400 px-4 py-2 rounded-xl shadow-md transition-all"
                >
                  Get Help Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-primary-navy"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-slate-200 px-4 pt-2 pb-4 space-y-3">
          {!user ? (
            <>
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-700 py-1">
                Home
              </Link>
              <Link href="/services" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-700 py-1">
                Services
              </Link>
              <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-700 py-1">
                Study Blog
              </Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-primary-navy py-1">
                Login
              </Link>
            </>
          ) : role === 'student' ? (
            <>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-700 py-1">
                Dashboard
              </Link>
              <Link href="/services" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-700 py-1">
                Services
              </Link>
              <Link href="/requests" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-700 py-1">
                Requests
              </Link>
              <Link href="/chat" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-700 py-1">
                Chat
              </Link>
            </>
          ) : role === 'expert' ? (
            <>
              <Link href="/expert/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-700 py-1">
                Dashboard
              </Link>
              <Link href="/expert/requests" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-700 py-1">
                Requests
              </Link>
            </>
          ) : (
            <>
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-700 py-1">
                Admin Dashboard
              </Link>
              <Link href="/admin/users" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-700 py-1">
                Users
              </Link>
              <Link href="/admin/experts" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-slate-700 py-1">
                Experts
              </Link>
            </>
          )}

          <div className="pt-2 border-t border-slate-200">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-2 text-xs font-bold text-error bg-red-50 rounded-lg"
              >
                Logout ({user.name})
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-bold text-white bg-primary-navy rounded-lg block"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
