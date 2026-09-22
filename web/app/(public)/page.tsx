'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Sparkles,
  Search,
  ArrowRight,
  ShieldCheck,
  Star,
  Clock,
  BookOpen,
  HelpCircle,
  FileText,
  Award,
  CheckCircle2,
  Code,
  PenTool,
  Bookmark,
  Users,
  MessageSquare,
  ChevronRight,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  const [selectedSubject, setSelectedSubject] = useState('Assignment Help');

  const [isInstalledApp, setIsInstalledApp] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.startsWith('android-app://');
    setIsInstalledApp(isStandalone);
  }, []);

  const services = [
    {
      title: 'Assignment Help',
      desc: 'Step-by-step guidance on understanding assignment briefs, structural outlines, and marking rubrics.',
      icon: BookOpen,
      badge: 'Popular',
    },
    {
      title: 'Homework Support',
      desc: 'Quick assistance with coursework questions, tutorial problem sets, and problem solving.',
      icon: HelpCircle,
      badge: 'Fast Match',
    },
    {
      title: 'Dissertation Guidance',
      desc: 'Expert feedback on thesis proposals, literature reviews, methodology, and structural coherence.',
      icon: FileText,
      badge: 'Advanced',
    },
    {
      title: 'Exam Preparation',
      desc: 'Targeted revision strategies, past paper walkthroughs, and key concept consolidation.',
      icon: Award,
      badge: 'High Impact',
    },
    {
      title: 'Proofreading & Editing',
      desc: 'Academic style polish, clarity check, grammar correction, and tone adjustment.',
      icon: CheckCircle2,
      badge: 'Polished',
    },
    {
      title: 'Programming Help',
      desc: 'Code debugging, architectural design, data structures, and algorithmic walkthroughs.',
      icon: Code,
      badge: 'STEM',
    },
    {
      title: 'Essay Writing',
      desc: 'Academic argument structure, critical analysis guidance, and thesis statement formulation.',
      icon: PenTool,
      badge: 'Core',
    },
    {
      title: 'Referencing Support',
      desc: 'Harvard, APA, OSCOLA, and IEEE reference formatting, citations, and bibliography check.',
      icon: Bookmark,
      badge: 'Essential',
    },
  ];

  const testimonials = [
    {
      name: 'Aisha Patel',
      uni: 'International Student',
      course: 'BSc Computer Science',
      year: 'Final-Year Student',
      rating: 5,
      comment:
        'Matched with a PhD expert within 6 minutes! He helped me break down my dissertation methodology step-by-step. My confidence skyrocketed.',
    },
    {
      name: 'Tom Reynolds',
      uni: 'University Student',
      course: 'BA Economics',
      year: 'Second-Year Student',
      rating: 5,
      comment:
        'The proofreading and referencing advice (Harvard style) was invaluable before my final submission. Super responsive chat!',
    },
    {
      name: 'Priya Sharma',
      uni: 'Law Student',
      course: 'LLB Law',
      year: 'First-Year Student',
      rating: 5,
      comment:
        'Legal citations used to confuse me so much. My matched tutor walked me through citation rules in real-time chat.',
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden gradient-hero text-white p-8 md:p-14 shadow-2xl border border-white/10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-gold/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-blue/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          
          {/* Trust Badges Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/20">
              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              4.9 / 5 Average Rating
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-300 text-xs font-bold border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              Qualified Academic Experts
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-slate-200 text-xs font-semibold border border-white/20">
              👨‍🎓 10,000+ Students Supported
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Connect with an Academic Expert in <span className="gradient-text">Minutes</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal max-w-2xl">
            Personalised, on-demand academic guidance built for global university standards. Get step-by-step help with coursework, dissertations, exam prep, and referencing — whenever you need it.
          </p>

          {/* Quick Request Launcher */}
          <div className="pt-2">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 sm:flex items-center gap-3 space-y-3 sm:space-y-0">
              <div className="flex-1 flex items-center gap-2 bg-white text-slate-800 px-4 py-3 rounded-xl">
                <Search className="w-5 h-5 text-primary-navy shrink-0" />
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold focus:outline-none cursor-pointer"
                >
                  {services.map((s) => (
                    <option key={s.title} value={s.title}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
              <Link
                href={`/requests/new?service=${encodeURIComponent(selectedSubject)}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-900 bg-accent-gold hover:bg-amber-400 px-6 py-3.5 rounded-xl shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all"
              >
                <span>Find My Expert</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Android Download */}
          {!isInstalledApp && (
            <div className="pt-2">
              <a
                href="/downloads/scholza.apk"
                download
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-white/15 hover:bg-white/25 px-4 py-2.5 rounded-xl border border-white/20 transition-all"
              >
                📱 Download for Android
              </a>
              <p className="mt-2 text-[11px] text-slate-300">
                You may see an &quot;Unknown app&quot; warning — this is normal for apps outside the Play Store. Tap Install anyway to continue.
              </p>
            </div>
          )}

          {/* SLA stats */}
          <div className="pt-4 grid grid-cols-3 gap-4 border-t border-white/15 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent-gold shrink-0" />
              <span>Matching in &lt; 10 mins</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Available 24/7 Late-Night</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-300 shrink-0" />
              <span>100% Confidential</span>
            </div>
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-accent-gold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Simple 3-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-primary-navy">
            How Scholza Works
          </h2>
          <p className="text-sm text-slate-600">
            From assignment brief to expert guidance in three seamless steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm card-hover relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-primary-navy/10 text-primary-navy font-black text-xl flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Share Requirements</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select your subject, describe your academic query, set your deadline, and attach any briefs or guidelines.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-primary-blue">
              <FileText className="w-4 h-4" />
              <span>Attach briefs, rubrics & code</span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm card-hover relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 font-black text-xl flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Get Connected</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our broadcast engine matches you with an online academic expert qualified in your exact subject area and level of study.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-amber-600">
              <Zap className="w-4 h-4" />
              <span>Broadcast match in minutes</span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm card-hover relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 font-black text-xl flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Learn with Confidence</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive step-by-step guidance in real-time chat, review feedback, and complete your work with academic confidence.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <MessageSquare className="w-4 h-4" />
              <span>Interactive chat & file sharing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-primary-navy bg-slate-100 px-3 py-1 rounded-full">
              Academic Support Available
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-primary-navy mt-2">
              Explore Services Tailored for You
            </h2>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-blue hover:text-primary-navy transition-colors"
          >
            <span>View All Services</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm card-hover flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-navy/5 text-primary-navy flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>

                <Link
                  href={`/requests/new?service=${encodeURIComponent(item.title)}`}
                  className="mt-4 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-primary-navy bg-slate-100 hover:bg-primary-navy hover:text-white py-2 rounded-xl transition-all"
                >
                  <span>Open in App</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Global Academic Standards Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-primary-navy to-slate-900 text-white rounded-3xl p-8 md:p-10 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-white/10 px-3 py-1 rounded-full border border-white/10">
            Academic Excellence
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug">
            Qualified Tutors Trained in University Assessment Criteria
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Our experts understand Harvard, APA, OSCOLA, and IEEE referencing standards, critical evaluation requirements, and specific undergraduate & postgraduate marking rubrics.
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <Link
            href="/blog/a-simple-guide-to-harvard-apa-and-oscola-referencing"
            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold text-center border border-white/20 transition-all"
          >
            Read Referencing Guide
          </Link>
          <Link
            href="/requests/new"
            className="px-5 py-3 rounded-xl bg-accent-gold hover:bg-amber-400 text-slate-900 text-xs font-bold text-center shadow-lg transition-all"
          >
            Get Help Now
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Student Reviews
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-primary-navy mt-2">
            Trusted by 10,000+ Students Worldwide
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm card-hover flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  &quot;{t.comment}&quot;
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{t.name}</h4>
                  <p className="text-[11px] text-slate-500">{t.uni}</p>
                </div>
                <span className="text-[10px] font-semibold text-primary-blue bg-blue-50 px-2 py-0.5 rounded-full">
                  {t.year}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Card */}
      <section className="bg-gradient-to-br from-primary-navy to-primary-blue rounded-3xl p-8 md:p-12 text-center text-white space-y-4 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-4xl font-extrabold">Ready to Boost Your Academic Confidence?</h2>
          <p className="text-xs sm:text-sm text-slate-200">
            Submit your assignment query in under 2 minutes and connect with an expert available right now.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/requests/new"
              className="px-6 py-3.5 rounded-xl bg-accent-gold text-slate-900 font-bold text-xs shadow-xl hover:scale-105 transition-transform"
            >
              Start My Request
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}