'use client';

import React, { useState } from 'react';
import { Info, AlertTriangle, CheckCircle, AlertOctagon, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

export interface CalloutProps {
  type?: 'info' | 'warning' | 'success' | 'danger';
  title?: string;
  children: React.ReactNode;
}

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const styles = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400 dark:text-blue-300 icon-blue-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400 dark:text-amber-300 icon-amber-400',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 dark:text-emerald-300 icon-emerald-400',
    danger: 'bg-rose-500/10 border-rose-500/30 text-rose-400 dark:text-rose-300 icon-rose-400',
  };

  const icons = {
    info: <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
    danger: <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />,
  };

  return (
    <div className={`my-4 p-4 rounded-xl border backdrop-blur-sm transition-all duration-200 ${styles[type]}`}>
      <div className="flex gap-3 items-start">
        {icons[type]}
        <div className="flex-1 text-sm leading-relaxed">
          {title && <h5 className="font-semibold text-base mb-1 tracking-tight text-white">{title}</h5>}
          <div className="callout-body">{children}</div>
        </div>
      </div>
    </div>
  );
}

export interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  children: React.ReactNode;
}

export function Badge({ variant = 'primary', children }: BadgeProps) {
  const variants = {
    primary: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    danger: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    neutral: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} mx-0.5 align-middle`}>
      {children}
    </span>
  );
}

export interface TabGroupProps {
  labels?: string[];
  children: React.ReactNode;
}

export function TabGroup({ labels = [], children }: TabGroupProps) {
  const [activeTab, setActiveTab] = useState(0);
  const childArray = React.Children.toArray(children);

  return (
    <div className="my-6 rounded-xl border border-slate-700/60 bg-slate-900/80 overflow-hidden shadow-xl">
      {labels.length > 0 && (
        <div className="flex border-b border-slate-700/60 bg-slate-950/60 px-2 pt-2 gap-1 overflow-x-auto">
          {labels.map((label, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors duration-150 whitespace-nowrap ${
                activeTab === idx
                  ? 'bg-slate-800 text-indigo-400 border-t-2 border-indigo-500 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <div className="p-4 bg-slate-900/90 text-sm">
        {childArray[activeTab] || childArray[0]}
      </div>
    </div>
  );
}

export interface CardProps {
  title?: string;
  children: React.ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <div className="my-4 p-5 rounded-2xl border border-slate-700/50 bg-gradient-to-b from-slate-900/90 to-slate-950/90 shadow-lg hover:border-indigo-500/40 transition-all duration-300">
      {title && <h4 className="text-lg font-bold text-white mb-2">{title}</h4>}
      <div className="text-slate-300 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export interface AccordionProps {
  title: string;
  children: React.ReactNode;
}

export function Accordion({ title, children }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-3 rounded-xl border border-slate-700/60 bg-slate-900/60 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left font-medium text-slate-200 hover:bg-slate-800/50 transition-colors"
      >
        <span>{title}</span>
        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>
      {isOpen && (
        <div className="p-4 border-t border-slate-700/60 text-sm text-slate-300 bg-slate-950/40">
          {children}
        </div>
      )}
    </div>
  );
}

export const mdxComponentsMap = {
  Callout,
  Badge,
  TabGroup,
  Card,
  Accordion,
};
