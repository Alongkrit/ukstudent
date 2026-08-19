'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Search } from 'lucide-react';
import { apiFetch } from '../lib/api';

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await apiFetch('/blog/posts');
        if (res.ok) {
          const data = await res.json();
          setArticles(Array.isArray(data) ? data : data.data || []);
        }
      } catch (err) {
        console.error('Failed to load blog posts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  const categories = ['All', ...Array.from(new Set(articles.map((a) => a.category)))];

  const filtered = articles.filter((a) => {
    const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.body.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-navy to-primary-blue rounded-3xl p-8 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
          <BookOpen className="w-4 h-4 text-accent-gold" />
          <span>Global Academic Insights</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold">Study Skills & Academic Guidance Blog</h1>
        <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
          Expert articles on university essay writing, coursework planning, and referencing rules based on university assessment standards.
        </p>

        {/* Search & Category Pills */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-800 rounded-xl text-xs font-semibold focus:outline-none shadow"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-bold px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-accent-gold text-slate-900 shadow'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles List */}
      {loading ? (
        <div className="p-8 text-center text-xs font-bold text-slate-400">Loading articles...</div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-xs font-bold text-slate-500">No articles found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((art) => (
            <article
              key={art.slug}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm card-hover p-6 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {art.category}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {art.readTimeMin} min read
                  </span>
                </div>

                <h2 className="text-base font-bold text-slate-900 leading-snug hover:text-primary-blue transition-colors">
                  <Link href={`/blog/${art.slug}`}>{art.title}</Link>
                </h2>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{art.body}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {new Date(art.publishedAt || art.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                </span>
                <Link
                  href={`/blog/${art.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary-navy hover:text-primary-blue"
                >
                  <span>Read Article</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

    </div>
  );
}