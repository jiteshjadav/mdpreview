'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';

export function AdSlot() {
  return (
    <div className="w-full my-4 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 flex items-center justify-between text-xs transition-colors">
      <div className="flex items-center gap-3">
        <div className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] uppercase tracking-wider border border-indigo-200 dark:border-indigo-800">
          Sponsor
        </div>
        <span className="text-slate-600 dark:text-slate-300 font-medium">
          Deploy your Next.js & static HTML apps instantly on Vercel or Cloudflare.
        </span>
      </div>
      <a
        href="https://vercel.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors font-semibold shrink-0"
      >
        <span>Learn More</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}
