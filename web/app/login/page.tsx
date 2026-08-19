'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      if (result.role === 'expert') {
        router.push('/expert/dashboard');
      } else if (result.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } else {
      setError(result.error || 'Invalid email or password. Please try again.');
    }
  };

  const handleGoogleCredentialResponse = async (response: { credential: string }) => {
    setError(null);
    setSubmitting(true);

    const result = await loginWithGoogle(response.credential, 'student');
    setSubmitting(false);

    if (result.success) {
      if (result.role === 'expert') {
        router.push('/expert/dashboard');
      } else if (result.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } else {
      setError(result.error || 'Google login failed.');
    }
  };

  useEffect(() => {
    const initGoogleButton = () => {
      if (!(window as any).google) return false;

      (window as any).google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
      });

      (window as any).google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { theme: 'outline', size: 'large', width: 360, text: 'continue_with' }
      );
      return true;
    };

    if (initGoogleButton()) return;

    const interval = setInterval(() => {
      if (initGoogleButton()) clearInterval(interval);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-md mx-auto space-y-6 pt-6 pb-12">
      
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-navy to-primary-blue text-white flex items-center justify-center mx-auto shadow-md">
          <GraduationCap className="w-7 h-7 text-accent-gold" />
        </div>
        <h1 className="text-2xl font-extrabold text-primary-navy">Welcome Back</h1>
        <p className="text-xs text-slate-500">Sign in to access your requests, chat, and academic sessions</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Authentication Failure</span>
            <p className="text-red-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        
        {/* Google OAuth Option */}
        <div id="google-signin-button" className="w-full flex justify-center"></div>

        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[10px] uppercase font-bold text-slate-400 absolute">or email</span>
        </div>

        {/* Email/Password Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-1.5 text-slate-600">
              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-primary-navy" />
              Remember me
            </label>
            <Link href="/forgot-password" className="font-semibold text-primary-blue hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-primary-navy hover:bg-primary-blue text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
          <p>
            Don&apos;t have a student account?{' '}
            <Link href="/register" className="font-bold text-primary-navy hover:underline">
              Sign up as Student
            </Link>
          </p>
          <p>
            Want to become an academic tutor?{' '}
            <Link href="/register/expert" className="font-bold text-accent-gold hover:underline">
              Apply as Expert
            </Link>
          </p>
        </div>

      </div>

    </div>
  );
}
