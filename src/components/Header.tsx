import React from 'react';
import { BookOpen, Sparkles, Search, Layers, BrainCircuit, Landmark, Plus, Cloud, Menu, X, User, HelpCircle, LogOut, Flame, Settings, Globe } from 'lucide-react';
import { ActiveView, ReadingStreakData } from '../types';
import { AuthSession } from '../utils/storage';
import { ReadingStreakBadge } from './ReadingStreakBadge';
import { useLanguage } from '../utils/i18n';

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onOpenSearch: () => void;
  onOpenNewNotebook: () => void;
  onOpenSync: () => void;
  onOpenAuth: () => void;
  onOpenTour: () => void;
  currentUser: AuthSession | null;
  onLogout: () => void;
  totalNotebooks: number;
  totalHighlights: number;
  totalFlashcards: number;
  streakData: ReadingStreakData;
  onOpenStreak: () => void;
  onOpenSettings: () => void;
  onOpenInstall?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  onOpenSearch,
  onOpenNewNotebook,
  onOpenSync,
  onOpenAuth,
  onOpenTour,
  currentUser,
  onLogout,
  totalNotebooks,
  totalHighlights,
  totalFlashcards,
  streakData,
  onOpenStreak,
  onOpenSettings,
  onOpenInstall,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { id: 'notebooks' as ActiveView, label: t.library, icon: BookOpen, count: totalNotebooks },
    { id: 'highlights-archive' as ActiveView, label: t.allHighlights, icon: Layers, count: totalHighlights },
    { id: 'flashcards-hub' as ActiveView, label: t.flashcardsStudy, icon: BrainCircuit, count: totalFlashcards },
    { id: 'history-explorer' as ActiveView, label: t.contextAuthors, icon: Landmark },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E6E1D8] text-[#4A443F] transition-all">
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('notebooks')}
              className="flex items-center gap-2.5 text-left group focus:outline-none focus:ring-2 focus:ring-[#C86D51] rounded-lg p-1"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-[#C86D51]/20 group-hover:scale-105 transition-transform border border-black/5 bg-[#C86D51]">
                <img src="/apple-touch-icon.png" alt="ExLibris Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-bold text-lg tracking-tight text-[#2D2A26]">{t.appName}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C86D51]/10 text-[#A85138] font-mono font-semibold border border-[#C86D51]/20">
                    {t.cloudBadge}
                  </span>
                </div>
                <p className="text-[11px] text-[#78716A] font-sans tracking-wide">{t.appSubtitle}</p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F4F1EA] p-1 rounded-xl border border-[#E6E1D8]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white text-[#2D2A26] font-semibold shadow-xs border border-[#E6E1D8]'
                      : 'text-[#78716A] hover:text-[#2D2A26] hover:bg-white/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? 'bg-[#F4F1EA] text-[#2D2A26] font-bold' : 'bg-[#EAE5DC] text-[#78716A]'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Reading Streak Motivation Badge */}
            <ReadingStreakBadge
              streakData={streakData}
              onClick={onOpenStreak}
            />

            {/* Language Quick Switcher */}
            <div className="hidden sm:flex items-center bg-[#F4F1EA] border border-[#E6E1D8] rounded-lg p-0.5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setLanguage('pt-BR')}
                className={`px-1.5 py-1 rounded transition-colors ${
                  language === 'pt-BR'
                    ? 'bg-white text-[#C86D51] font-bold shadow-2xs'
                    : 'text-[#78716A] hover:text-[#2D2A26]'
                }`}
                title="Mudar idioma para Português"
              >
                PT
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en-US')}
                className={`px-1.5 py-1 rounded transition-colors ${
                  language === 'en-US'
                    ? 'bg-white text-[#C86D51] font-bold shadow-2xs'
                    : 'text-[#78716A] hover:text-[#2D2A26]'
                }`}
                title="Switch language to English"
              >
                EN
              </button>
            </div>

            {/* Install App Quick Action */}
            {onOpenInstall && (
              <button
                type="button"
                onClick={onOpenInstall}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#C86D51] bg-[#FAF9F6] hover:bg-white border border-[#C86D51]/30 hover:border-[#C86D51] rounded-lg transition-all shadow-2xs"
                title="Salvar como aplicativo na tela inicial do celular ou PC"
              >
                <img src="/favicon.svg" alt="" className="w-3.5 h-3.5" />
                <span>Salvar app</span>
              </button>
            )}

            {/* Settings Trigger */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-[#4A443F] hover:text-[#2D2A26] bg-[#F4F1EA] hover:bg-white border border-[#E6E1D8] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
              title={t.settings}
            >
              <Settings className="w-4 h-4 text-[#78716A]" />
            </button>

            {/* Guide / Tour Button */}
            <button
              onClick={onOpenTour}
              className="p-2 text-[#4A443F] hover:text-[#2D2A26] bg-[#F4F1EA] hover:bg-white border border-[#E6E1D8] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
              title={t.tourGuide}
            >
              <HelpCircle className="w-4 h-4 text-[#78716A]" />
            </button>

            {/* Quick Search */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs text-[#4A443F] bg-[#F4F1EA] hover:bg-white hover:text-[#2D2A26] border border-[#E6E1D8] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
              title={t.search}
            >
              <Search className="w-3.5 h-3.5 text-[#C86D51]" />
              <span className="hidden sm:inline">{t.search}</span>
              <kbd className="hidden lg:inline text-[10px] px-1.5 py-0.5 bg-white text-[#78716A] rounded border border-[#E6E1D8] font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Sync & Backup Modal Trigger */}
            <button
              onClick={onOpenSync}
              className="p-2 text-[#4A443F] hover:text-[#2D2A26] bg-[#F4F1EA] hover:bg-white border border-[#E6E1D8] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
              title={t.syncCloud}
            >
              <Cloud className="w-4 h-4 text-[#6A8E6B]" />
            </button>

            {/* User Account / Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-[#FAF9F6] border border-[#DCD6CA] rounded-lg pl-2 pr-1.5 py-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-[#2D2A26] font-medium max-w-[90px] sm:max-w-[130px] truncate" title={currentUser.email}>
                  {currentUser.email}
                </span>
                <button
                  onClick={onLogout}
                  className="p-1 text-[#78716A] hover:text-red-600 rounded transition-colors"
                  title={t.signOut}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2D2A26] bg-[#F4F1EA] hover:bg-white border border-[#DCD6CA] rounded-lg transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[#C86D51]" />
                <span className="hidden sm:inline">Entrar</span>
              </button>
            )}

            {/* New Notebook Button */}
            <button
              onClick={onOpenNewNotebook}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-semibold bg-[#C86D51] hover:bg-[#B35C42] text-white rounded-lg shadow-sm transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
            >
              <Plus className="w-4 h-4 font-bold" />
              <span className="hidden sm:inline">{t.newBook}</span>
              <span className="sm:hidden">+</span>
            </button>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#4A443F] hover:text-[#2D2A26] bg-[#F4F1EA] rounded-lg border border-[#E6E1D8]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-[#E6E1D8] space-y-2">
            {/* Mobile Language Switcher */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E6E1D8]">
              <span className="text-xs text-[#78716A] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#C86D51]" />
                {t.language}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setLanguage('pt-BR')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                    language === 'pt-BR'
                      ? 'bg-[#C86D51] text-white font-bold'
                      : 'bg-[#FAF9F6] text-[#78716A]'
                  }`}
                >
                  Português
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en-US')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                    language === 'en-US'
                      ? 'bg-[#C86D51] text-white font-bold'
                      : 'bg-[#FAF9F6] text-[#78716A]'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-[#C86D51] text-white font-bold' : 'text-[#4A443F] hover:bg-[#F4F1EA]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#EAE5DC] text-[#4A443F] font-mono">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Mobile Streak Button */}
            <div className="p-1">
              <button
                type="button"
                onClick={() => {
                  onOpenStreak();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-orange-200/60 text-orange-950"
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
                  <div className="text-left">
                    <p className="text-xs font-bold leading-tight">{t.readingStreak}</p>
                    <p className="text-[11px] text-[#78716A]">
                      {streakData.currentStreak} {streakData.currentStreak === 1 ? 'dia consecutivo' : 'dias consecutivos'}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] px-2 py-1 rounded-lg bg-white border border-orange-200 font-bold text-orange-800">
                  Ver
                </span>
              </button>
            </div>

            {/* Mobile App Install Button */}
            {onOpenInstall && (
              <button
                type="button"
                onClick={() => {
                  onOpenInstall();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E6E1D8] text-xs font-semibold text-[#2D2A26] hover:bg-[#FAF9F6] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <img src="/apple-touch-icon.png" alt="" className="w-5 h-5 rounded-md shrink-0 shadow-2xs" />
                  <span>Salvar como aplicativo</span>
                </div>
                <span className="text-[10px] text-[#C86D51] font-mono font-bold bg-[#FAF9F6] px-2 py-0.5 rounded border border-[#E6E1D8]">
                  Instalar
                </span>
              </button>
            )}

            <div className="pt-2 border-t border-[#E6E1D8] flex items-center justify-between px-2">
              <button
                onClick={() => {
                  onOpenSettings();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-[#78716A] hover:text-[#2D2A26] flex items-center gap-1.5 py-1.5"
              >
                <Settings className="w-4 h-4" />
                <span>{t.settings}</span>
              </button>

              <button
                onClick={() => {
                  onOpenTour();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-[#78716A] hover:text-[#2D2A26] flex items-center gap-1.5 py-1.5"
              >
                <HelpCircle className="w-4 h-4" />
                <span>{t.tourGuide}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
