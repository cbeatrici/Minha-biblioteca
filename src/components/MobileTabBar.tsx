import React from 'react';
import { BookOpen, Layers, BrainCircuit, Plus, Flame } from 'lucide-react';
import { ActiveView, ReadingStreakData } from '../types';
import { getEffectiveStreak } from '../utils/streakUtils';
import { useLanguage } from '../utils/i18n';

interface MobileTabBarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onOpenNewNotebook: () => void;
  onOpenSearch: () => void;
  totalNotebooks: number;
  totalHighlights: number;
  totalFlashcards: number;
  streakData?: ReadingStreakData;
  onOpenStreak?: () => void;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeView,
  setActiveView,
  onOpenNewNotebook,
  totalNotebooks,
  totalHighlights,
  streakData,
  onOpenStreak,
}) => {
  const { t } = useLanguage();
  const effective = streakData ? getEffectiveStreak(streakData) : { currentStreak: 0, readToday: false };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-t border-[#E6E1D8] px-2 py-1.5 flex items-center justify-around shadow-lg pb-safe">
      <button
        type="button"
        onClick={() => setActiveView('notebooks')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors relative ${
          activeView === 'notebooks' || activeView === 'notebook-detail'
            ? 'text-[#C86D51] font-bold'
            : 'text-[#78716A] hover:text-[#2D2A26]'
        }`}
      >
        <BookOpen className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{t.booksTab}</span>
        {totalNotebooks > 0 && (
          <span className="absolute top-0.5 right-1 w-2 h-2 rounded-full bg-[#C86D51]" />
        )}
      </button>

      <button
        type="button"
        onClick={() => setActiveView('highlights-archive')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors relative ${
          activeView === 'highlights-archive'
            ? 'text-[#C86D51] font-bold'
            : 'text-[#78716A] hover:text-[#2D2A26]'
        }`}
      >
        <Layers className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{t.highlightsCount}</span>
        {totalHighlights > 0 && (
          <span className="absolute top-0.5 right-1 text-[9px] px-1 bg-[#F4F1EA] text-[#78716A] rounded-full border border-[#E6E1D8]">
            {totalHighlights}
          </span>
        )}
      </button>

      {/* Floating Center Action Button for New Book */}
      <button
        type="button"
        onClick={onOpenNewNotebook}
        className="flex flex-col items-center justify-center -mt-5"
        title={t.newBook}
      >
        <div className="w-11 h-11 rounded-full bg-[#C86D51] hover:bg-[#B35C42] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform border-2 border-white">
          <Plus className="w-6 h-6" />
        </div>
        <span className="text-[10px] text-[#4A443F] font-semibold mt-0.5">+</span >
      </button>

      <button
        type="button"
        onClick={() => setActiveView('flashcards-hub')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors relative ${
          activeView === 'flashcards-hub'
            ? 'text-[#C86D51] font-bold'
            : 'text-[#78716A] hover:text-[#2D2A26]'
        }`}
      >
        <BrainCircuit className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{t.studyTab}</span>
      </button>

      {/* Streak Mobile Tab Button */}
      <button
        type="button"
        onClick={onOpenStreak}
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[#78716A] hover:text-[#2D2A26] transition-colors relative"
      >
        <Flame
          className={`w-5 h-5 transition-transform ${
            effective.readToday
              ? 'text-orange-500 fill-orange-500 animate-pulse'
              : effective.currentStreak > 0
              ? 'text-amber-500 fill-amber-500/50'
              : 'text-[#A8A29E]'
          }`}
        />
        <span className="text-[10px] mt-0.5 font-mono font-bold">
          {effective.currentStreak}d
        </span>
        {!effective.readToday && effective.currentStreak > 0 && (
          <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-500 animate-ping opacity-75" />
        )}
      </button>
    </div>
  );
};
