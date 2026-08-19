'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Award, FileText, CreditCard, ArrowRight, AlertCircle, Loader2, Check } from 'lucide-react';

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

export default function CompleteExpertProfilePage() {
  const router = useRouter();
  const { user, loading, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    qualifications: '',
    subjects: [] as string[],
    bio: '',
    paypalEmail: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && user.role !== 'expert') {
      router.push('/dashboard');
    }
  }, [loading, user, router]);

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

    if (!formData.qualifications.trim()) {
      setError('Please enter your academic qualifications.');
      return;
    }

    setSubmitting(true);

    const result = await updateProfile({
      qualifications: formData.qualifications,
      subjects: formData.subjects,
      bio: formData.bio,
      paypalEmail: formData.paypalEmail || undefined,
    });

    setSubmitting(false);

    if (result.success) {
      router.push('/expert/status');
    } else {
      setError(result.error || 'Could not save your profile. Please try again.');
    }
  };

  if (loading || !user) {
    return (
      <div className="max-w-xl mx-auto pt-16 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary-navy" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 pt-4 pb-12">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-primary-navy text-white flex items-center justify-center mx-auto shadow">
          <Award className="w-7 h-7 text-accent-gold" />
        </div>
        <h1 className="text-2xl font-extrabold text-primary-navy">Complete Your Expert Profile</h1>
        <p className="text-xs text-slate-500">Welcome, {user.name}! Just a few more details before your application is reviewed.</p>
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
        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder={`payouts@paypal.com (defaults to ${user.email} if empty)`}
                value={formData.paypalEmail}
                onChange={(e) => setFormData({ ...formData, paypalEmail: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-primary-navy hover:bg-primary-blue text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>Complete Application</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}