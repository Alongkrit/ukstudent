'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  HelpCircle,
  FileText,
  Award,
  CheckCircle2,
  Code,
  PenTool,
  Bookmark,
  Search,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function ServicesPage() {
  const [search, setSearch] = useState('');

  const servicesList = [
    {
      id: '1',
      name: 'Assignment Help',
      desc: 'Step-by-step guidance on understanding assignment briefs, structural outlines, and marking rubrics.',
      icon: BookOpen,
      category: 'General',
      highlights: ['Brief Breakdown', 'Structure Outline', 'Rubric Alignment'],
    },
    {
      id: '2',
      name: 'Homework Support',
      desc: 'Quick assistance with coursework questions, tutorial problem sets, and problem solving.',
      icon: HelpCircle,
      category: 'Coursework',
      highlights: ['Problem Sets', 'Tutorial Queries', 'Step Explanation'],
    },
    {
      id: '3',
      name: 'Dissertation Guidance',
      desc: 'Expert feedback on thesis proposals, literature reviews, methodology, and structural coherence.',
      icon: FileText,
      category: 'Research',
      highlights: ['Thesis Proposal', 'Literature Review', 'Methodology'],
    },
    {
      id: '4',
      name: 'Exam Preparation',
      desc: 'Targeted revision strategies, past paper walkthroughs, and key concept consolidation.',
      icon: Award,
      category: 'Exams',
      highlights: ['Past Papers', 'Revision Plan', 'Mock Questions'],
    },
    {
      id: '5',
      name: 'Proofreading & Editing',
      desc: 'Academic style polish, clarity check, grammar correction, and tone adjustment.',
      icon: CheckCircle2,
      category: 'Writing',
      highlights: ['Grammar Check', 'Academic Tone', 'Clarity Polish'],
    },
    {
      id: '6',
      name: 'Programming Help',
      desc: 'Code debugging, architectural design, data structures, and algorithmic walkthroughs.',
      icon: Code,
      category: 'STEM',
      highlights: ['Python/Java/C++', 'Code Debugging', 'Algorithm Walkthrough'],
    },
    {
      id: '7',
      name: 'Essay Writing',
      desc: 'Academic argument structure, critical analysis guidance, and thesis statement formulation.',
      icon: PenTool,
      category: 'Writing',
      highlights: ['Critical Argument', 'Paragraph Coherence', 'Introduction & Synthesis'],
    },
    {
      id: '8',
      name: 'Referencing Support',
      desc: 'Harvard, APA, OSCOLA, and IEEE reference formatting, citations, and bibliography check.',
      icon: Bookmark,
      category: 'Referencing',
      highlights: ['Harvard / APA 7th', 'OSCOLA Footnotes', 'In-Text Citations'],
    },
  ];

  const filtered = servicesList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.desc.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-navy to-primary-blue rounded-3xl p-8 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
          <Sparkles className="w-4 h-4 text-accent-gold" />
          <span>Full Academic Catalogue</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold">Academic Support Services</h1>
        <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
          Browse our complete service offering designed for university students worldwide across all levels of study.
        </p>

        {/* Search */}
        <div className="pt-2 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search services (e.g. Dissertation, OSCOLA, Python)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-800 rounded-xl text-xs font-semibold focus:outline-none shadow"
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm card-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-navy/10 text-primary-navy flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                    {service.category}
                  </span>
                </div>

                <h2 className="text-base font-bold text-slate-900 mb-2">{service.name}</h2>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{service.desc}</p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Key Highlights
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {service.highlights.map((h) => (
                      <span
                        key={h}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-primary-blue border border-blue-100"
                      >
                        ✓ {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <Link
                href={`/requests/new?service=${encodeURIComponent(service.name)}`}
                className="mt-6 w-full flex items-center justify-center gap-2 text-xs font-bold text-white bg-primary-navy hover:bg-primary-blue py-3 rounded-xl shadow-sm transition-all"
              >
                <span>Request This Service</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          );
        })}
      </div>

    </div>
  );
}
