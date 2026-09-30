import React from 'react';
import { Flame } from 'lucide-react';
import { ReadingStreakData } from '../types';
import { getEffectiveStreak } from '../utils/streakUtils';

interface ReadingStreakBadgeProps {
  streakData: ReadingStreakData;
  onClick: () => void;
  className?: string;
}

export const ReadingStreakBadge: React.FC<ReadingStreakBadgeProps> = ({
  streakData,
  onClick,
  className = '',
}) => {
  const effective = getEffectiveStreak(streakData);
  const count = effective.currentStreak;
  const isReadToday = effective.readToday;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C86D51] active:scale-95 ${
        isReadToday
          ? 'bg-gradient-to-r from-amber-500/15 to-orange-500/15 border-orange-300 text-orange-900 shadow-2xs hover:shadow-xs'
          : count > 0
          ? 'bg-[#FAF9F6] hover:bg-[#F4F1EA] border-[#DCD6CA] text-[#4A443F]'
          : 'bg-[#FAF9F6] hover:bg-[#F4F1EA] border-[#E6E1D8] text-[#78716A]'
      } ${className}`}
      title={
        isReadToday
          ? `Sequência ativa: ${count} ${count === 1 ? 'dia' : 'dias'}! Leitura de hoje já registrada.`
          : count > 0
          ? `Sequência: ${count} ${count === 1 ? 'dia' : 'dias'}. Clique para registrar sua leitura de hoje!`
          : 'Inicie sua sequência de leitura diária!'
      }
    >
      {/* Animated Flame Icon */}
      <div className="relative flex items-center justify-center">
        <Flame
          className={`w-4 h-4 transition-transform group-hover:scale-110 ${
            isReadToday
              ? 'text-orange-500 fill-orange-500 animate-pulse'
              : count > 0
              ? 'text-amber-500 fill-amber-500/60'
              : 'text-[#A8A29E]'
          }`}
        />
        {!isReadToday && count > 0 && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping opacity-75" />
        )}
      </div>

      {/* Streak Number & Label */}
      <span className="font-mono font-bold tracking-tight">
        {count}
      </span>
      <span className="hidden sm:inline font-sans text-[11px] font-medium opacity-90">
        {count === 1 ? 'dia' : 'dias'}
      </span>

      {/* "Ler Hoje" status indicator */}
      {!isReadToday && (
        <span className="hidden lg:inline text-[10px] px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 font-semibold border border-amber-200">
          Ler hoje
        </span>
      )}
    </button>
  );
};
