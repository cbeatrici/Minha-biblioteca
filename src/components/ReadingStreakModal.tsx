import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  X,
  CheckCircle2,
  Calendar,
  Clock,
  Trophy,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  BookOpen,
  Quote,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ReadingStreakData, Notebook } from '../types';
import {
  getEffectiveStreak,
  recordReadingSession,
  getLast7DaysStatus,
  MOTIVATIONAL_READING_QUOTES,
} from '../utils/streakUtils';

interface ReadingStreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakData: ReadingStreakData;
  onUpdateStreak: (updated: ReadingStreakData) => void;
  notebooks?: Notebook[];
}

export const ReadingStreakModal: React.FC<ReadingStreakModalProps> = ({
  isOpen,
  onClose,
  streakData,
  onUpdateStreak,
  notebooks = [],
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(15);
  const [selectedBook, setSelectedBook] = useState<string>(notebooks[0]?.title || '');
  const [sessionNote, setSessionNote] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'timer'>('overview');

  // Reading Timer State
  const [timerSeconds, setTimerSeconds] = useState<number>(15 * 60);
  const [timerInitialSeconds, setTimerInitialSeconds] = useState<number>(15 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerIntervalRef = useRef<any>(null);

  // Quote index
  const quoteIndex = (streakData.currentStreak + streakData.totalDaysRead) % MOTIVATIONAL_READING_QUOTES.length;
  const currentQuote = MOTIVATIONAL_READING_QUOTES[quoteIndex] || MOTIVATIONAL_READING_QUOTES[0];

  const effective = getEffectiveStreak(streakData);
  const last7Days = getLast7DaysStatus(streakData.history);

  // Timer Effect
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            handleFinishTimerSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [isTimerRunning]);

  const handleFinishTimerSession = () => {
    const elapsedMinutes = Math.round(timerInitialSeconds / 60);
    fireConfetti();
    const { updatedStreak } = recordReadingSession(
      streakData,
      elapsedMinutes,
      selectedBook || 'Sessão com cronômetro',
      'Leitura focada com o cronômetro do aplicativo'
    );
    onUpdateStreak(updatedStreak);
  };

  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C86D51', '#E07A5F', '#F4A261', '#E76F51', '#2A9D8F'],
      });
    } catch {
      // Safe fallback
    }
  };

  const handleQuickLog = () => {
    fireConfetti();
    const { updatedStreak } = recordReadingSession(
      streakData,
      selectedMinutes,
      selectedBook || undefined,
      sessionNote.trim() || undefined
    );
    onUpdateStreak(updatedStreak);
    setSessionNote('');
  };

  const getStreakTier = (days: number) => {
    if (days >= 30) return { label: 'Lenda da leitura', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (days >= 14) return { label: 'Mestre da disciplina', color: 'text-purple-600 bg-purple-50 border-purple-200' };
    if (days >= 7) return { label: 'Leitor consistente', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    if (days >= 3) return { label: 'Hábito em chamas', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    if (days >= 1) return { label: 'Faísca inicial', color: 'text-[#C86D51] bg-[#C86D51]/10 border-[#C86D51]/20' };
    return { label: 'Pronto para começar', color: 'text-stone-600 bg-stone-100 border-stone-200' };
  };

  const tier = getStreakTier(effective.currentStreak);

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const setTimerDuration = (mins: number) => {
    setIsTimerRunning(false);
    setTimerInitialSeconds(mins * 60);
    setTimerSeconds(mins * 60);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-[#E6E1D8] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#4A443F]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#E6E1D8] flex items-center justify-between bg-[#FAF9F6]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-[#C86D51] flex items-center justify-center text-white shadow-sm shadow-orange-500/20">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#2D2A26]">
                Sequência de leitura (streak)
              </h2>
              <p className="text-[11px] text-[#78716A]">Mantenha o hábito diário de leitura aceso</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#78716A] hover:text-[#2D2A26] hover:bg-[#F4F1EA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E6E1D8] bg-[#FAF9F6] px-5 sm:px-6 pt-2 gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-[#C86D51] text-[#C86D51]'
                : 'border-transparent text-[#78716A] hover:text-[#2D2A26]'
            }`}
          >
            🔥 Visão geral e registro
          </button>
          <button
            onClick={() => setActiveTab('timer')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'timer'
                ? 'border-[#C86D51] text-[#C86D51]'
                : 'border-transparent text-[#78716A] hover:text-[#2D2A26]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Cronômetro de foco</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'overview' ? (
            <>
              {/* Flame Hero Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FAF9F6] to-[#F4F1EA] border border-[#E6E1D8] p-5 text-center space-y-3">
                <div className="relative inline-flex items-center justify-center">
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                      effective.readToday
                        ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-[#C86D51] shadow-lg shadow-orange-500/30 scale-105'
                        : 'bg-[#EAE5DC] text-[#A8A29E]'
                    }`}
                  >
                    <Flame
                      className={`w-11 h-11 ${
                        effective.readToday ? 'text-white fill-white animate-pulse' : 'text-[#78716A]'
                      }`}
                    />
                  </div>
                  {effective.readToday && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-xs">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-serif font-bold text-[#2D2A26]">
                      {effective.currentStreak}
                    </span>
                    <span className="text-sm font-semibold text-[#78716A]">
                      {effective.currentStreak === 1 ? 'dia seguido' : 'dias seguidos'}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${tier.color}`}
                    >
                      {tier.label}
                    </span>
                  </div>
                </div>

                {/* Status Message */}
                <p className="text-xs text-[#5C554E] max-w-sm mx-auto">
                  {effective.readToday ? (
                    <span className="text-emerald-700 font-medium">
                      ✨ Parabéns! Você já registrou sua leitura hoje e sua chama está acesa.
                    </span>
                  ) : effective.status === 'pending_today' ? (
                    <span className="text-amber-800 font-medium">
                      ⚡ Leia alguns minutos hoje para manter sua sequência de {effective.currentStreak} dias!
                    </span>
                  ) : (
                    <span>
                      Inicie hoje uma nova jornada de leitura diária e veja sua sequência crescer!
                    </span>
                  )}
                </p>
              </div>

              {/* Weekly Habit Tracker (Last 7 Days) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#2D2A26]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C86D51]" />
                    <span>Últimos 7 dias</span>
                  </span>
                  <span className="text-[11px] text-[#78716A] font-normal">
                    {streakData.totalDaysRead} dias lidos no total
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {last7Days.map((d, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                        d.isCompleted
                          ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                          : d.isToday
                          ? 'bg-white border-[#C86D51] ring-1 ring-[#C86D51]/30 text-[#2D2A26]'
                          : 'bg-[#FAF9F6] border-[#E6E1D8] text-[#A8A29E]'
                      }`}
                    >
                      <span className="text-[10px] font-semibold uppercase">{d.dayLabel}</span>
                      <div className="my-1">
                        {d.isCompleted ? (
                          <Flame className="w-4 h-4 text-orange-500 fill-orange-500 mx-auto" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-dashed border-[#C8C2B7] mx-auto" />
                        )}
                      </div>
                      <span className="text-[9px] font-mono text-[#78716A]">
                        {d.isCompleted ? `${d.minutes}m` : d.isToday ? 'Hoje' : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Log Reading Session Action */}
              <div className="bg-[#FAF9F6] border border-[#E6E1D8] rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-[#2D2A26] flex items-center justify-between">
                  <span>{effective.readToday ? 'Adicionar mais tempo de leitura' : 'Registrar leitura de hoje'}</span>
                  <span className="text-[11px] font-normal text-[#78716A]">1 clique</span>
                </h4>

                {/* Duration options */}
                <div className="flex gap-2">
                  {[10, 15, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setSelectedMinutes(mins)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        selectedMinutes === mins
                          ? 'bg-[#C86D51] text-white border-[#C86D51] shadow-2xs'
                          : 'bg-white text-[#4A443F] border-[#DCD6CA] hover:bg-[#F4F1EA]'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>

                {/* Optional Book Select */}
                {notebooks.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-medium text-[#78716A] mb-1">
                      Livro lido (opcional):
                    </label>
                    <select
                      value={selectedBook}
                      onChange={(e) => setSelectedBook(e.target.value)}
                      className="w-full h-8 px-2.5 text-xs bg-white border border-[#DCD6CA] rounded-lg text-[#2D2A26] focus:outline-none focus:border-[#C86D51]"
                    >
                      <option value="">Selecione um livro...</option>
                      {notebooks.map((nb) => (
                        <option key={nb.id} value={nb.title}>
                          {nb.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Action button */}
                <button
                  type="button"
                  onClick={handleQuickLog}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 via-orange-600 to-[#C86D51] hover:brightness-105 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <Flame className="w-4 h-4 fill-white" />
                  <span>
                    {effective.readToday
                      ? `Registrar +${selectedMinutes} min lidos hoje`
                      : `Concluir leitura de hoje (${selectedMinutes} min)`}
                  </span>
                </button>
              </div>

              {/* Stats Overview Grid */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 bg-[#FAF9F6] border border-[#E6E1D8] rounded-xl space-y-0.5">
                  <div className="flex items-center justify-center gap-1 text-[#78716A] text-[10px] font-bold">
                    <Trophy className="w-3 h-3 text-amber-500" />
                    <span>Recorde</span>
                  </div>
                  <p className="text-base font-serif font-bold text-[#2D2A26]">
                    {streakData.longestStreak} {streakData.longestStreak === 1 ? 'dia' : 'dias'}
                  </p>
                </div>

                <div className="p-3 bg-[#FAF9F6] border border-[#E6E1D8] rounded-xl space-y-0.5">
                  <div className="flex items-center justify-center gap-1 text-[#78716A] text-[10px] font-bold">
                    <Calendar className="w-3 h-3 text-emerald-600" />
                    <span>Total de dias</span>
                  </div>
                  <p className="text-base font-serif font-bold text-[#2D2A26]">
                    {streakData.totalDaysRead} dias
                  </p>
                </div>

                <div className="p-3 bg-[#FAF9F6] border border-[#E6E1D8] rounded-xl space-y-0.5">
                  <div className="flex items-center justify-center gap-1 text-[#78716A] text-[10px] font-bold">
                    <Clock className="w-3 h-3 text-[#C86D51]" />
                    <span>Tempo lido</span>
                  </div>
                  <p className="text-base font-serif font-bold text-[#2D2A26]">
                    {streakData.totalMinutesRead >= 60
                      ? `${(streakData.totalMinutesRead / 60).toFixed(1)}h`
                      : `${streakData.totalMinutesRead}m`}
                  </p>
                </div>
              </div>

              {/* Inspiring Literary Quote */}
              <div className="p-3.5 bg-amber-50/50 border border-amber-200/60 rounded-xl space-y-1 text-left">
                <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-semibold">
                  <Quote className="w-3 h-3 text-amber-600" />
                  <span>Inspiração para sua leitura</span>
                </div>
                <p className="text-xs text-[#5C554E] italic font-serif leading-relaxed">
                  "{currentQuote.quote}"
                </p>
                <p className="text-[10px] text-[#78716A] font-medium">— {currentQuote.author}</p>
              </div>
            </>
          ) : (
            /* Timer Tab */
            <div className="space-y-5 text-center py-2">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#2D2A26]">Sessão de leitura focada</h3>
                <p className="text-xs text-[#78716A]">
                  Inicie o cronômetro enquanto lê seu livro físico. Ao finalizar, sua leitura será registrada automaticamente.
                </p>
              </div>

              {/* Big Timer Display */}
              <div className="py-6 bg-[#FAF9F6] border border-[#E6E1D8] rounded-3xl space-y-4">
                <div className="text-5xl font-mono font-bold tracking-tight text-[#2D2A26]">
                  {formatTimer(timerSeconds)}
                </div>

                {/* Duration Presets */}
                <div className="flex justify-center gap-2 px-4">
                  {[10, 15, 20, 25, 30].map((m) => (
                    <button
                      key={m}
                      type="button"
                      disabled={isTimerRunning}
                      onClick={() => setTimerDuration(m)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all disabled:opacity-50 ${
                        timerInitialSeconds === m * 60
                          ? 'bg-[#C86D51] text-white border-[#C86D51]'
                          : 'bg-white text-[#4A443F] border-[#DCD6CA] hover:bg-[#F4F1EA]'
                      }`}
                    >
                      {m} min
                    </button>
                  ))}
                </div>

                {/* Timer Controls */}
                <div className="flex justify-center items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C86D51] hover:bg-[#B35C42] text-white font-bold text-xs shadow-sm transition-all"
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Pausar</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>Iniciar leitura</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds(timerInitialSeconds);
                    }}
                    className="p-2.5 rounded-xl bg-white border border-[#DCD6CA] text-[#78716A] hover:text-[#2D2A26] transition-colors"
                    title="Reiniciar cronômetro"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Manual Complete Now Button */}
              {isTimerRunning && (
                <button
                  type="button"
                  onClick={() => {
                    setIsTimerRunning(false);
                    handleFinishTimerSession();
                  }}
                  className="text-xs text-[#C86D51] hover:underline font-semibold"
                >
                  Concluir sessão agora e salvar sequência
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
