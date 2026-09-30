export type NotebookType = 'book' | 'study' | 'paper' | 'research';
export type ReadingStatus = 'reading' | 'completed' | 'want_to_read';

export interface HighlightColorDef {
  key: string;
  name: string;
  hex: string;
  bgClass: string;
  lightBgClass: string;
  borderClass: string;
  textClass: string;
  badgeClass: string;
  dotClass: string;
  defaultMeaning: string;
}

export interface HighlightItem {
  id: string;
  notebookId: string;
  scanId?: string;
  text: string;
  colorKey: string; // 'neutral' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple'
  topic: string;
  style?: 'underline' | 'highlighter' | 'margin' | 'circle';
  userNote?: string;
  pageNumber?: number;
  chapter?: string;
  createdAt: string;
  isFavorite?: boolean;
}

export interface PageScan {
  id: string;
  notebookId: string;
  pageNumber?: number;
  chapter?: string;
  scannedAt: string;
  imageUrl?: string;
  fullText: string;
  summary?: string;
  highlights: HighlightItem[];
}

export interface HistoricalContextData {
  authorBio: string;
  authorEra?: string;
  historicalEra: string;
  coreThesis: string;
  culturalImpact: string;
  themes: string[];
  studyGuideTips: string[];
  reflectionQuestions?: string[];
  lastUpdated: string;
}

export interface Flashcard {
  id: string;
  notebookId: string;
  question: string;
  answer: string;
  quoteContext?: string;
  colorKey?: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  // Spaced repetition metadata
  level: number; // 0 to 5
  intervalDays: number;
  nextReviewDate: string; // ISO date
  lastReviewed?: string;
  reviewCount: number;
  easeFactor: number; // default 2.5
  status: 'new' | 'learning' | 'review' | 'mastered';
}

export interface ChapterTopicSummary {
  id: string;
  notebookId: string;
  type: 'chapter' | 'topic' | 'general';
  targetName: string; // e.g. "Capítulo 1: Âncoras" or "Viés de Confirmação"
  executiveSummary: string;
  keyTakeaways: string[];
  deepDiveAnalysis: string;
  practicalApplications?: string[];
  criticalQuestions?: string[];
  quoteCount?: number;
  generatedAt: string;
}

export interface NotionSyncConfig {
  apiKey?: string;
  databaseId?: string;
  lastSyncedAt?: string;
  autoSyncOnScan?: boolean;
}

export interface Notebook {
  id: string;
  userId?: string;
  title: string;
  author?: string;
  type: NotebookType;
  description: string;
  coverTheme: string; // e.g. 'emerald', 'crimson', 'indigo', 'amber', 'slate', 'violet'
  coverUrl?: string; // High-res cover image URL or uploaded photo
  createdAt: string;
  updatedAt: string;
  customColorMeanings: Record<string, string>; // colorKey -> meaning
  
  // Book Overview & Reader Review
  readingStatus?: ReadingStatus;
  rating?: number; // 1 to 5
  userReview?: string; // General personal review, takeaways and comments
  totalPages?: number;
  currentPage?: number;
  startDate?: string;
  finishDate?: string;
  readYear?: number | string;
  genre?: string;
  
  // Notion Sync tracking
  notionPageId?: string;
  notionLastSyncedAt?: string;

  historicalContext?: HistoricalContextData;
  chapterTopicSummaries?: ChapterTopicSummary[];
  pageScans: PageScan[];
  highlights: HighlightItem[];
  flashcards: Flashcard[];
}

export type ActiveView = 'notebooks' | 'notebook-detail' | 'highlights-archive' | 'flashcards-hub' | 'history-explorer';

export interface UserAccount {
  id: string;
  email: string;
  accessCode: string; // 4 to 6-digit sync code or password
  createdAt: string;
  lastLoginAt?: string;
}

export interface ReadingSessionRecord {
  minutes: number;
  bookTitle?: string;
  timestamp: string;
  note?: string;
}

export interface ReadingStreakData {
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string; // ISO format "YYYY-MM-DD"
  totalDaysRead: number;
  totalMinutesRead: number;
  history: Record<string, ReadingSessionRecord>; // "YYYY-MM-DD" -> ReadingSessionRecord
}


