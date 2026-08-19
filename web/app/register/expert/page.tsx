'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Award, Mail, Lock, User, BookOpen, CreditCard, ArrowRight, AlertCircle, Loader2, FileText, Check } from 'lucide-react';

const SUBJECT_OPTIONS = [
  'Assignment Help',
  'Homework Support',
  'Dissertation Guidance',
  'Exam Preparation',
  'Proofreading & Editing',
  'Programming Help',
  'Essay Writing',
  'Referencing Support',
  'Computer Science',
  'Mathematics',
  'Engineering',
  'Law',
  'Economics & Finance',
  'Business Administration',
  'Medical & Health Sciences',
];

export default function RegisterExpertPage() {
  const router = useRouter();
  const { registerExpert, loginWithGoogle } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    qualifications: '',
    subjects: [] as string[],
    bio: '',
    paypalEmail: '',
    termsAccepted: true,
  });

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toggleSubject = (subject: string) => {
    if (formData.subjects.includes(subject)) {
      setFormData({ ...formData, subjects: formData.subjects.filter((s) => s !== subject) });
    } else {
      setFormData({ ...formData, subjects: [...formData.subjects, subject] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.subjects.length === 0) {
      setError('Please select at least one subject of academic expertise.');
      return;
    }

    if (!formData.termsAccepted) {
      setError('You must accept the Terms of Service & Privacy Policy to apply.');
      return;
    }

    setSubmitting(true);

    const result = await registerExpert({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      qualifications: formData.qualifications,
      subjects: formData.subjects,
      bio: formData.bio,
      paypalEmail: formData.paypalEmail || formData.email,
    });

    setSubmitting(false);

    if (result.success) {
      router.push('/expert/status');
    } else {
      setError(result.error || 'Expert application failed.');
    }
  };

  const handleGoogleCredentialResponse = async (response: { credential: string }) => {
    setError(null);
    setSubmitting(true);

    const result = await loginWithGoogle(response.credential, 'expert');
    setSubmitting(false);

    if (result.success) {
      if (result.isNewUser) {
        router.push('/register/expert/complete-profile');
      } else {
        router.push('/expert/status');
      }
    } else {
      setError(result.error || 'Google application failed.');
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
        document.getElementById('google-signup-button'),
        { theme: 'outline', size: 'large', width: 360, text: 'signup_with' }
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
    <div className="max-w-xl mx-auto space-y-6 pt-4 pb-12">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-primary-navy text-white flex items-center justify-center mx-auto shadow">
          <Award className="w-7 h-7 text-accent-gold" />
        </div>
        <h1 className="text-2xl font-extrabold text-primary-navy">Apply as Academic Expert</h1>
        <p className="text-xs text-slate-500">Provide university students worldwide with verified academic guidance & earning opportunities</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Application Error</span>
            <p className="text-red-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        {/* Google OAuth Option */}
        <div id="google-signup-button" className="w-full flex justify-center"></div>

        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[10px] uppercase font-bold text-slate-400 absolute">or expert application form</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="e.g. Dr. Robert Vance"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Professional / Academic Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="expert@university.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                minLength={8}
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Academic Qualifications</label>
            <div className="relative">
              <Award className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="e.g. MSc Computer Science (Oxford), PhD Higher Education"
                value={formData.qualifications}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subjects of Expertise (Select all that apply)</label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-xl">
              {SUBJECT_OPTIONS.map((sub) => {
                const selected = formData.subjects.includes(sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => toggleSubject(sub)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      selected
                        ? 'bg-primary-navy text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5 text-accent-gold" />}
                    <span>{sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Brief Academic Bio & Experience</label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <textarea
                rows={3}
                placeholder="Detail your academic research, teaching background, or tutoring history..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">PayPal Email for Payout Earnings</label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                placeholder="payouts@paypal.com (defaults to account email if empty)"
                value={formData.paypalEmail}
                onChange={(e) => setFormData({ ...formData, paypalEmail: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 text-xs text-slate-600">
            <input
              type="checkbox"
              required
              checked={formData.termsAccepted}
              onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
              className="rounded border-slate-300 text-primary-navy"
            />
            <span>
              I agree to the <Link href="/terms" className="text-primary-navy underline">Terms of Service</Link> & <Link href="/privacy" className="text-primary-navy underline">Privacy Policy</Link>
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-primary-navy hover:bg-primary-blue text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Application...</span>
              </>
            ) : (
              <>
                <span>Submit Expert Application</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-500 pt-2">
            Already an expert?{' '}
            <Link href="/login" className="font-bold text-primary-navy hover:underline">
              Log in here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}