'use client';

import React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-4 pb-12">
      <div className="space-y-2 border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-primary-navy bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
          GDPR & Data Protection
        </span>
        <h1 className="text-3xl font-extrabold text-primary-navy">Privacy Policy</h1>
        <p className="text-xs text-slate-500">Effective Date: August 2026 • Compliance with Data Protection Standards & GDPR</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            1. How We Collect & Use Your Information
          </h2>
          <p>
            We collect personal data required to deliver academic matching services, including your name, academic email address, university, course, and uploaded assignment briefs. For experts, we collect proof of identification and qualification documents.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">2. Security & Token Storage</h2>
          <p>
            Authentication refresh tokens are stored in <code>httpOnly</code>, <code>SameSite=Lax</code>, Secure cookies. Passwords are hashed using bcrypt with cost factor 12. Uploaded documents are stored securely with restricted access.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">3. Data Retention & Your Rights</h2>
          <p>
            Under GDPR and global privacy laws, you have the right to request access to your personal data, request data correction, or request account deletion. You can exercise these rights by contacting <code>help@scholza.com</code>.
          </p>
        </section>

        <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-slate-500">
          <p>© 2026 Scholza. All rights reserved.</p>
          <Link href="/terms" className="font-bold text-primary-navy hover:underline">
            View Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  );
}
