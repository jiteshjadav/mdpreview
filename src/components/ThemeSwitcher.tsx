'use client';

import React, { useState, useEffect } from 'react';
import { LayoutTemplate, Sparkles, X } from 'lucide-react';

export type ThemeType = 
  | 'split-book' 
  | 'dashboard-deck' 
  | 'stepped-progress'
  | 'dark-spec'
  | 'warm-editorial'
  | 'sapphire-spec'
  | 'enterprise-blue'
  | 'clean-html';

export interface ThemeOption {
  id: ThemeType;
  name: string;
  description: string;
  previewColor: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'sapphire-spec',
    name: 'Sapphire Spec',
    description: 'Executive corporate sapphire layout for technical documentation',
    previewColor: 'bg-blue-950 border-blue-600 text-blue-200',
  },
  {
    id: 'stepped-progress',
    name: 'Stepped Guide',
    description: 'Linear timeline axis with numbered step icons',
    previewColor: 'bg-teal-50 border-teal-600/30 text-teal-900',
  },
  {
    id: 'clean-html',
    name: 'Clean HTML',
    description: 'Simple web document style (GitHub Pages / MDX default)',
    previewColor: 'bg-white border-slate-300 text-slate-700',
  },
  {
    id: 'dark-spec',
    name: 'Dark Spec',
    description: 'Sleek dark mode layout with glowing accents and TOC sidebar',
    previewColor: 'bg-slate-900 border-teal-500 text-teal-300',
  },
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
];

export interface ThemeSwitcherProps {
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
  isNearTop?: boolean;
  appTheme?: 'sapphire' | 'dark';
  lang?: 'en' | 'fr';
}

export function ThemeSwitcher({ currentTheme, onThemeChange, isNearTop = false, lang = 'en' }: ThemeSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showFirstTimeHint, setShowFirstTimeHint] = useState(false);

  useEffect(() => {
    const getCookie = (name: string): string | null => {
      if (typeof document === 'undefined') return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    };

    const hasSeenCookie = getCookie('mdpreview_seen_style_hint');
    const hasSeenLocal = typeof window !== 'undefined' ? localStorage.getItem('mdpreview_seen_style_hint') : 'true';

    if (!hasSeenCookie && !hasSeenLocal) {
      setShowFirstTimeHint(true);
    }
  }, []);

  const dismissHint = () => {
    setShowFirstTimeHint(false);
    try {
      document.cookie = 'mdpreview_seen_style_hint=true; path=/; max-age=31536000; SameSite=Lax';
      localStorage.setItem('mdpreview_seen_style_hint', 'true');
    } catch (e) {
      console.error('Failed to set style hint cookie:', e);
    }
  };

  const handleToggle = () => {
    if (showFirstTimeHint) {
      dismissHint();
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (theme: ThemeType) => {
    if (showFirstTimeHint) {
      dismissHint();
    }
    onThemeChange(theme);
    setIsOpen(false);
  };

  const getLocalizedName = (id: ThemeType) => {
    if (id === 'split-book') return 'Split Book';
    if (id === 'dashboard-deck') return lang === 'en' ? 'Dashboard Deck' : 'Tableau de Bord';
    if (id === 'stepped-progress') return lang === 'en' ? 'Stepped Guide' : 'Guide par Étapes';
    if (id === 'dark-spec' || id === 'warm-editorial') return lang === 'en' ? 'Dark Spec' : 'Spécification Sombre';
    if (id === 'sapphire-spec' || id === 'enterprise-blue') return lang === 'en' ? 'Sapphire Spec' : 'Spécification Saphir';
    return lang === 'en' ? 'Clean HTML' : 'HTML Simple';
  };

  const getLocalizedDesc = (id: ThemeType) => {
    if (id === 'split-book') return lang === 'en' ? 'Minimal two-column split book (Stripe/Linear style)' : 'Livre séparé en deux colonnes (Style Stripe)';
    if (id === 'dashboard-deck') return lang === 'en' ? 'Modular floating widget cards with shadows' : 'Cartes widgets flottantes modulaires avec ombres';
    if (id === 'stepped-progress') return lang === 'en' ? 'Linear timeline axis with numbered step icons' : 'Axe chronologique linéaire avec étapes numérotées';
    if (id === 'dark-spec' || id === 'warm-editorial') return lang === 'en' ? 'Sleek dark mode layout with glowing accents and TOC sidebar' : 'Style de référence sombre élégant avec menu latéral';
    if (id === 'sapphire-spec' || id === 'enterprise-blue') return lang === 'en' ? 'Executive corporate sapphire layout for technical documentation' : 'Style de référence technique bleu saphir entreprise';
    return lang === 'en' ? 'Simple web document style (GitHub Pages / MDX)' : 'Style document web simple (GitHub Pages / MDX)';
  };

  return (
    <div className="relative">
      {/* Pulse Beacon Effect for First Time User */}
      {showFirstTimeHint && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3 z-30 pointer-events-none">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
        </span>
      )}

      <button
        onClick={handleToggle}
        style={{
          backgroundColor: 'var(--doc-header-btn-bg, #ffffff)',
          borderColor: 'var(--doc-header-border, #c0d6ec)',
          color: 'var(--doc-header-text, #091e42)',
        }}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border cursor-pointer shrink-0 select-none hover:brightness-95 ${
          showFirstTimeHint ? 'ring-2 ring-teal-500/80 ring-offset-1 ring-offset-slate-50 dark:ring-offset-slate-900 animate-pulse' : ''
        }`}
        title={`${lang === 'en' ? 'Layout style' : 'Mise en page'}: ${getLocalizedName(currentTheme)}`}
      >
        <LayoutTemplate className="w-4 h-4" style={{ color: 'var(--doc-header-accent, #07478b)' }} />
        <span className="hidden xs:inline">{lang === 'en' ? 'Layout' : 'Style'}</span>
      </button>

      {/* Interactive First Time User Coachmark Tooltip */}
      {showFirstTimeHint && !isOpen && (
        <div 
          style={{
            backgroundColor: 'var(--doc-header-bg, #ffffff)',
            borderColor: 'var(--doc-header-border, #c0d6ec)',
            color: 'var(--doc-header-text, #091e42)',
          }}
          className={`absolute left-1/2 -translate-x-1/2 w-64 p-3 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 border ${
            isNearTop ? 'top-full mt-3' : 'bottom-full mb-3'
          }`}
        >
          {/* Arrow pointing to button */}
          <div 
            style={{
              backgroundColor: 'var(--doc-header-bg, #ffffff)',
              borderColor: 'var(--doc-header-border, #c0d6ec)',
            }}
            className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 ${
              isNearTop ? '-top-1.5 border-t border-l' : '-bottom-1.5 border-b border-r'
            }`} 
          />

          <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold flex items-center gap-1.5" style={{ color: 'var(--doc-header-accent, #07478b)' }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--doc-header-accent, #07478b)' }} />
                {lang === 'en' ? 'Try Different Styles!' : 'Essayez d\'autres styles !'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissHint();
                }}
                className="opacity-60 hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                style={{ color: 'var(--doc-header-text, #091e42)' }}
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] leading-snug font-medium opacity-85" style={{ color: 'var(--doc-header-text-secondary, #42526e)' }}>
              {lang === 'en'
                ? 'Click here to switch presentation themes: Split Book, Dashboard Deck, Dark Spec, Sapphire Spec, and more!'
                : 'Cliquez ici pour changer le style de mise en page : Split Book, Tableau de bord, Mode Sombre, Bleu Saphir et plus !'}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissHint();
                setIsOpen(true);
              }}
              style={{
                backgroundColor: 'var(--doc-header-accent, #07478b)',
                color: '#ffffff',
              }}
              className="mt-0.5 w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1 hover:brightness-110 active:scale-95"
            >
              <span>{lang === 'en' ? 'Explore Styles' : 'Explorer les styles'}</span>
              <span>🎨</span>
            </button>
          </div>
        </div>
      )}

      {/* Backdrop overlay to close when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          style={{
            backgroundColor: 'var(--doc-header-bg, #ffffff)',
            borderColor: 'var(--doc-header-border, #c0d6ec)',
            color: 'var(--doc-header-text, #091e42)',
          }}
          className={`absolute left-1/2 -translate-x-1/2 w-64 p-2 rounded-xl border shadow-2xl z-50 animate-in fade-in duration-150 ${
            isNearTop 
              ? 'top-full mt-2 slide-in-from-top-2' 
              : 'bottom-full mb-2 slide-in-from-bottom-2'
          }`}
        >
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
