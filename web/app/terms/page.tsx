'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, BookOpen } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-4 pb-12">
      <div className="space-y-2 border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-primary-navy bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
          Legal & Academic Integrity
        </span>
        <h1 className="text-3xl font-extrabold text-primary-navy">Terms of Service</h1>
        <p className="text-xs text-slate-500">Effective Date: August 2026 • Scholza Platform</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent-gold" />
            1. Academic Integrity Declaration & Scope of Service
          </h2>
          <p>
            Scholza provides personalized, on-demand academic guidance, tutoring, essay structure feedback, proofreading, and educational explanation. The platform is explicitly designed to enhance student understanding and confidence.
          </p>
          <p className="font-semibold text-slate-900 bg-amber-50 p-3 rounded-xl border border-amber-200">
            Strict Prohibition: Students are prohibited from submitting work completed by experts as their own assessed university work. Experts are prohibited from writing submittable assignments on a student’s behalf. All engagements must strictly comply with university academic integrity regulations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">2. User Accounts & Roles</h2>
          <p>
            Users may register as a <strong>Student</strong> or apply as an <strong>Academic Expert</strong>. User roles are validated and enforced server-side. Academic Experts undergo identity document verification and academic qualification vetting prior to receiving student requests.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">3. Payments & Fees</h2>
          <p>
            Service prices are quoted in GBP (£) and processed via secure payment gateways. Payments for sessions accrue to experts upon successful confirmation of completion. Refunds are administered via Admin dispute review in accordance with platform policies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">4. Content Moderation & Reporting</h2>
          <p>
            Platform administrators reserve the right to review chat transcripts in response to moderation flags or academic integrity reports. Accounts violating conduct policies are subject to warning, suspension, or termination.
          </p>
        </section>

        <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-slate-500">
          <p>© 2026 Scholza. All rights reserved.</p>
          <Link href="/privacy" className="font-bold text-primary-navy hover:underline">
            View Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}
