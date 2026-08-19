'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BookOpen, Clock, ArrowLeft, Share2, Bookmark, CheckCircle2 } from 'lucide-react';

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const articlesData: Record<string, any> = {
    'writing-a-high-quality-university-essay-where-to-start': {
      title: 'Writing a High-Quality University Essay: Where to Start',
      category: 'Essay Writing',
      readTimeMin: 6,
      date: '12 August 2026',
      author: 'Academic Advisory Team',
      content: `
Writing a compelling university essay requires structure, critical analysis, and evidence-based argumentation. 

### 1. Deconstruct the Prompt
Before writing a single word, break down the assignment question into key components: the directive verb (e.g. *critically evaluate*, *analyse*, *compare*), the core topic, and any specific parameters or context.

### 2. Formulate a Strong Thesis Statement
Your thesis is the central claim of your essay. It should be concise, arguable, and directly answer the question prompt. Avoid generic summaries; instead, take a clear stance supported by evidence.

### 3. Structural Essentials
- **Introduction (10%)**: Contextualise the topic, state thesis, outline roadmap.
- **Body Paragraphs (80%)**: Use PEEL structure (Point, Evidence, Explanation, Link).
- **Conclusion (10%)**: Synthesise key arguments without introducing new evidence.

### 4. Critical Assessment of Sources
Rely on peer-reviewed academic journals, academic monographs, and credible UK repository data. Evaluate each source's methodology, potential bias, and relevance to your thesis argument.
      `,
    },
    'smarter-ways-to-manage-coursework-and-deadlines': {
      title: 'Smarter Ways to Manage Coursework and Deadlines',
      category: 'Study Skills',
      readTimeMin: 5,
      date: '10 August 2026',
      author: 'Academic Advisory Team',
      content: `
Juggling multiple module deadlines alongside lectures and personal commitments is one of the biggest challenges for UK university students.

### 1. Reverse Deadline Planning
Work backwards from submission date. Break down the task into milestones: topic selection, research, outline drafting, full draft completion, and final proofreading.

### 2. Time Blocking & Pomodoro Technique
Allocate dedicated 90-minute deep-work focus windows. Use 25-minute Pomodoro sprints for drafting intense sections to maintain momentum and prevent burnout.

### 3. Document Management & Backups
Store working drafts in cloud storage (OneDrive/Google Drive) with automatic version history. Keep reference files organised in folder sub-categories per module code.
      `,
    },
    'a-simple-guide-to-harvard-apa-and-oscola-referencing': {
      title: 'A Simple Guide to Harvard, APA & OSCOLA Referencing',
      category: 'Referencing',
      readTimeMin: 4,
      date: '08 August 2026',
      author: 'Referencing Specialists',
      content: `
Referencing correctly is vital to maintaining academic integrity and avoiding accidental plagiarism in UK higher education assessments.

### Harvard Style (Author-Date)
Widely used across UK universities in business, humanities, and social sciences.
- *In-text*: (Smith, 2023, p. 45)
- *Bibliography*: Smith, J. (2023) *Academic Writing in Higher Education*. London: Palgrave Macmillan.

### OSCOLA (Oxford University Standard for Citation of Legal Authorities)
Standard citation style for UK Law degrees.
- *Footnotes*: Case name in italics, neutral citation, law report. e.g. *Donoghue v Stevenson* [1932] AC 562.
- *No in-text parentheses*: All citations appear in footnotes at the bottom of the page.

### APA 7th Edition
Commonly specified for Psychology, Social Sciences, and Health disciplines.
- *In-text*: (Smith & Jones, 2022)
- *Bibliography*: Includes hanging indents and DOI links for online articles.
      `,
    },
  };

  const article = articlesData[slug] || articlesData['writing-a-high-quality-university-essay-where-to-start'];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-primary-navy transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Blog List
      </Link>

      <article className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200/80 shadow-sm space-y-6">
        
        <div className="space-y-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
              {article.category}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.readTimeMin} min read
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-primary-navy leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <span>By <strong className="text-slate-800">{article.author}</strong> • {article.date}</span>
            <button className="flex items-center gap-1.5 text-primary-blue hover:text-primary-navy font-semibold">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
          </div>
        </div>

        {/* Content Render */}
        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
          {article.content}
        </div>

        {/* CTA Box */}
        <div className="mt-8 p-6 bg-gradient-to-r from-primary-navy/5 to-primary-blue/10 rounded-2xl border border-primary-navy/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-primary-navy">Need Personalised Academic Guidance?</h4>
            <p className="text-xs text-slate-600 mt-1">Connect with an experienced academic tutor for 1-on-1 step-by-step assistance.</p>
          </div>
          <Link
            href="/requests/new"
            className="px-5 py-2.5 rounded-xl bg-accent-gold text-slate-900 font-bold text-xs shadow hover:scale-105 transition-transform shrink-0"
          >
            Request Assistance
          </Link>
        </div>

      </article>

    </div>
  );
}
