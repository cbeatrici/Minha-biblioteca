import { ReadingStreakData, ReadingSessionRecord } from '../types';

export const DEFAULT_STREAK: ReadingStreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastSessionDate: '',
  totalDaysRead: 0,
  totalMinutesRead: 0,
  history: {},
};

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d);
}

export function isDateToday(dateStr: string): boolean {
  if (!dateStr) return false;
  return dateStr === getLocalDateString();
}

export function isDateYesterday(dateStr: string): boolean {
  if (!dateStr) return false;
  return dateStr === getYesterdayDateString();
}

/**
 * Computes the effective current streak.
 * If the last recorded session was today or yesterday, the streak is alive.
 * If it was earlier than yesterday, the streak is considered broken (0).
 */
export function getEffectiveStreak(streak: ReadingStreakData): {
  currentStreak: number;
  readToday: boolean;
  status: 'completed_today' | 'pending_today' | 'broken';
} {
  const today = getLocalDateString();
  const yesterday = getYesterdayDateString();

  if (streak.lastSessionDate === today) {
    return {
      currentStreak: Math.max(1, streak.currentStreak),
      readToday: true,
      status: 'completed_today',
    };
  }

  if (streak.lastSessionDate === yesterday) {
    return {
      currentStreak: streak.currentStreak,
      readToday: false,
      status: 'pending_today',
    };
  }

  // Older than yesterday or never read
  return {
    currentStreak: 0,
    readToday: false,
    status: 'broken',
  };
}

/**
 * Registers or extends today's reading session
 */
export function recordReadingSession(
  existingStreak: ReadingStreakData = DEFAULT_STREAK,
  minutes: number = 15,
  bookTitle?: string,
  note?: string
): { updatedStreak: ReadingStreakData; isFirstToday: boolean } {
  const today = getLocalDateString();
  const yesterday = getYesterdayDateString();

  const isFirstToday = existingStreak.lastSessionDate !== today;
  let newCurrentStreak = existingStreak.currentStreak;

  if (isFirstToday) {
    if (existingStreak.lastSessionDate === yesterday) {
      newCurrentStreak = existingStreak.currentStreak + 1;
    } else {
      newCurrentStreak = 1;
    }
  }

  const newLongestStreak = Math.max(existingStreak.longestStreak, newCurrentStreak);
  const newTotalDays = isFirstToday ? existingStreak.totalDaysRead + 1 : existingStreak.totalDaysRead;
  const newTotalMinutes = existingStreak.totalMinutesRead + minutes;

  const currentHistoryItem = existingStreak.history?.[today];
  const newHistoryItem: ReadingSessionRecord = {
    minutes: (currentHistoryItem?.minutes || 0) + minutes,
    bookTitle: bookTitle || currentHistoryItem?.bookTitle || 'Sessão de Leitura',
    timestamp: new Date().toISOString(),
    note: note || currentHistoryItem?.note,
  };

  const updatedStreak: ReadingStreakData = {
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    lastSessionDate: today,
    totalDaysRead: newTotalDays,
    totalMinutesRead: newTotalMinutes,
    history: {
      ...(existingStreak.history || {}),
      [today]: newHistoryItem,
    },
  };

  return { updatedStreak, isFirstToday };
}

/**
 * Generates an array of the last 7 days for the weekly habit chart
 */
export function getLast7DaysStatus(history: Record<string, ReadingSessionRecord> = {}): {
  dayLabel: string;
  dateStr: string;
  isCompleted: boolean;
  isToday: boolean;
  minutes: number;
}[] {
  const result = [];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const todayStr = getLocalDateString();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);
    const dayLabel = dayNames[d.getDay()];
    const session = history[dateStr];

    result.push({
      dayLabel,
      dateStr,
      isCompleted: !!session && session.minutes > 0,
      isToday: dateStr === todayStr,
      minutes: session?.minutes || 0,
    });
  }

  return result;
}

export const MOTIVATIONAL_READING_QUOTES = [
  {
    quote: 'A leitura de todos os bons livros é uma conversa com os homens mais ilustres dos séculos passados.',
    author: 'René Descartes',
  },
  {
    quote: 'Um livro é um dispositivo para acender a imaginação.',
    author: 'Alan Bennett',
  },
  {
    quote: 'Quem lê vive mil vidas antes de morrer. O homem que nunca lê vive apenas uma.',
    author: 'George R.R. Martin',
  },
  {
    quote: 'Ler 15 minutos por dia constrói uma mente brilhante ao longo do ano.',
    author: 'Hábito de Ouro',
  },
  {
    quote: 'Os livros não mudam o mundo, quem muda o mundo são as pessoas. Os livros mudam as pessoas.',
    author: 'Mário Quintana',
  },
];
