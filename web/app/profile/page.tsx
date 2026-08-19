'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import {
  User,
  Mail,
  Building,
  BookOpen,
  Calendar,
  Phone,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';

function ProfilePageContent() {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    university: user?.university || '',
    course: user?.course || '',
    yearOfStudy: user?.yearOfStudy || 'First-Year',
    bio: user?.bio || '',
  });

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        university: user.university || '',
        course: user.course || '',
        yearOfStudy: user.yearOfStudy || 'First-Year',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setSaving(true);

    const result = await updateProfile({
      fullName: formData.fullName,
      phone: formData.phone,
      university: formData.university,
      course: formData.course,
      yearOfStudy: formData.yearOfStudy,
      bio: formData.bio,
    });

    setSaving(false);

    if (result.success) {
      setSuccessMessage('Your profile information has been saved successfully.');
    } else {
      setErrorMessage(result.error || 'Failed to update profile.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-4 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-navy via-primary-blue to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold text-amber-300 bg-white/10 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 w-fit mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-gold" />
            Authenticated {user?.role ? user.role.toUpperCase() : 'USER'} Profile
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Account Profile & Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-200">
            Manage your real student identity, university enrollment, and contact preferences
          </p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-black text-accent-gold shadow-inner hidden sm:flex">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="font-bold">{errorMessage}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        
        <h2 className="text-sm font-extrabold text-primary-navy border-b border-slate-100 pb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-accent-gold" />
          Personal Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">University Email (Read-Only)</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (Optional)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                placeholder="+44 7123 456789"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Account Role</label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                disabled
                value={user?.role ? user.role.toUpperCase() : 'STUDENT'}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-primary-navy uppercase cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Academic Details (For Students) */}
        {user?.role === 'student' && (
          <>
            <h2 className="text-sm font-extrabold text-primary-navy border-b border-slate-100 pb-3 flex items-center gap-2 pt-2">
              <Building className="w-4 h-4 text-accent-gold" />
              Academic Enrollment Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">University Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Year of Study</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <select
                    value={formData.yearOfStudy}
                    onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy"
                  >
                    <option value="First-Year">First-Year</option>
                    <option value="Second-Year">Second-Year</option>
                    <option value="Final-Year">Final-Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="PhD Candidate">PhD Candidate</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Course / Major</label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-navy"
                />
              </div>
            </div>
          </>
        )}

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-primary-navy hover:bg-primary-blue text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-accent-gold" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute allowedRoles={['student', 'expert', 'admin']}>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}
