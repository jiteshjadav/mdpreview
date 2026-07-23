'use client';

import React, { useState } from 'react';
import { LayoutTemplate } from 'lucide-react';

export type ThemeType = 
  | 'split-book' 
  | 'dashboard-deck' 
  | 'stepped-progress';

export interface ThemeOption {
  id: ThemeType;
  name: string;
  description: string;
  previewColor: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'split-book',
    name: 'Split Book',
    description: 'Minimal two-column split book (Stripe/Linear style)',
    previewColor: 'bg-white border-slate-200 text-slate-800',
  },
  {
    id: 'dashboard-deck',
    name: 'Dashboard Deck',
    description: 'Modular floating widget cards with shadows',
    previewColor: 'bg-slate-50 border-indigo-450/20 text-slate-800',
  },
  {
    id: 'stepped-progress',
    name: 'Stepped Guide',
    description: 'Linear timeline axis with numbered step icons',
    previewColor: 'bg-teal-50 border-teal-600/30 text-teal-900',
  },
];

export interface ThemeSwitcherProps {
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
  isNearTop?: boolean;
  appTheme?: 'indigo' | 'teal' | 'dark';
  lang?: 'en' | 'fr';
}

export function ThemeSwitcher({ currentTheme, onThemeChange, isNearTop = false, lang = 'en' }: ThemeSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (theme: ThemeType) => {
    onThemeChange(theme);
    setIsOpen(false);
  };

  const getLocalizedName = (id: ThemeType) => {
    if (id === 'split-book') return id === 'split-book' ? 'Split Book' : 'Split Book';
    if (id === 'dashboard-deck') return lang === 'en' ? 'Dashboard Deck' : 'Tableau de Bord';
    return lang === 'en' ? 'Stepped Guide' : 'Guide par Étapes';
  };

  const getLocalizedDesc = (id: ThemeType) => {
    if (id === 'split-book') return lang === 'en' ? 'Minimal two-column split book (Stripe/Linear style)' : 'Livre séparé en deux colonnes (Style Stripe)';
    if (id === 'dashboard-deck') return lang === 'en' ? 'Modular floating widget cards with shadows' : 'Cartes widgets flottantes modulaires avec ombres';
    return lang === 'en' ? 'Linear timeline axis with numbered step icons' : 'Axe chronologique linéaire avec étapes numérotées';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border cursor-pointer app-bg-hover app-border app-text shrink-0 select-none"
        title={`${lang === 'en' ? 'Layout style' : 'Mise en page'}: ${getLocalizedName(currentTheme)}`}
      >
        <LayoutTemplate className="w-4 h-4 app-accent-text" />
        <span className="hidden xs:inline">{lang === 'en' ? 'Layout' : 'Style'}</span>
      </button>

      {/* Backdrop overlay to close when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute left-1/2 -translate-x-1/2 w-64 p-2 rounded-xl border shadow-2xl z-50 animate-in fade-in duration-150 app-bg-card app-border app-text ${
          isNearTop 
            ? 'top-full mt-2 slide-in-from-top-2' 
            : 'bottom-full mb-2 slide-in-from-bottom-2'
        }`}>
          <div className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 mb-1 border-b app-text-light app-border">
            {lang === 'en' ? 'Select Presentation Style' : 'Style de Présentation'}
          </div>
          <div className="space-y-1">
            {THEME_OPTIONS.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelect(t.id)}
                className={`w-full text-left p-1.5 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                  currentTheme === t.id
                    ? 'app-accent-bg app-accent-text font-semibold'
                    : 'hover:app-bg-hover app-text-secondary'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full ${t.previewColor} border border-slate-300 shrink-0`} />
                <div className="min-w-0">
                  <div className="text-xs font-medium">{getLocalizedName(t.id)}</div>
                  <div className="text-[9px] truncate app-text-light">{getLocalizedDesc(t.id)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
