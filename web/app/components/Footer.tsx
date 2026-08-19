'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, Mail, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-primary-navy text-slate-200 border-t border-primary-blue/30 pt-12 pb-16 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent-gold/20 border border-accent-gold/40 flex items-center justify-center text-accent-gold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">
                SCHOL<span className="text-accent-gold">ZA</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connecting university students worldwide with vetted academic experts for on-demand, personalised guidance.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-300/90 font-medium pt-1">
              <ShieldCheck className="w-4 h-4 text-accent-gold" />
              <span>GDPR & Academic Integrity Compliant</span>
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/services" className="hover:text-amber-400 transition-colors">Assignment Help</Link></li>
              <li><Link href="/services" className="hover:text-amber-400 transition-colors">Dissertation Guidance</Link></li>
              <li><Link href="/services" className="hover:text-amber-400 transition-colors">Exam Preparation</Link></li>
              <li><Link href="/services" className="hover:text-amber-400 transition-colors">Proofreading & Editing</Link></li>
              <li><Link href="/services" className="hover:text-amber-400 transition-colors">Programming Help</Link></li>
              <li><Link href="/services" className="hover:text-amber-400 transition-colors">Referencing (Harvard / APA / OSCOLA)</Link></li>
            </ul>
          </div>

          {/* Col 3: Resources & Study Blog */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Resources
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/blog" className="hover:text-amber-400 transition-colors">Study Tips Blog</Link></li>
              <li><Link href="/blog/writing-a-high-quality-university-essay-where-to-start" className="hover:text-amber-400 transition-colors">Essay Writing Guide</Link></li>
              <li><Link href="/blog/a-simple-guide-to-harvard-apa-and-oscola-referencing" className="hover:text-amber-400 transition-colors">Referencing Styles</Link></li>
              <li><Link href="/register/expert" className="hover:text-amber-400 transition-colors">Apply as Expert</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Contact & Support
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent-gold" />
                <a href="mailto:help@scholza.com" className="hover:text-white transition-colors">
                  help@scholza.com
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>256-bit SSL Encrypted Payments</span>
              </p>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-[11px] font-semibold text-slate-200">
                  Academic Excellence
                </span>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-700/60 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Scholza. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
            <a href="#" className="hover:text-slate-300">Cookie Preferences</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
