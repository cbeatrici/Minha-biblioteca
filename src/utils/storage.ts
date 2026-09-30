import { Notebook } from '../types';
import { SEED_NOTEBOOKS } from '../data/seedData';

const STORAGE_KEY = 'lumina_study_notebooks_v1';
const INITIALIZED_KEY = 'lumina_study_initialized_v1';
const CLEAN_SLATE_RESET_KEY = 'lumina_force_clean_zero_v3';
const AUTH_USER_KEY = 'lumina_auth_user_v1';
const AUTH_TOKEN_KEY = 'lumina_auth_token_v1';

export interface AuthSession {
  id: string;
  email: string;
  accessCode: string;
  createdAt: string;
}

export function getStoredUser(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveAuthSession(user: AuthSession, token: string): void {
  try {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (err) {
    console.error('Failed to save auth session:', err);
  }
}

export function clearAuthSession(): void {
  try {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (err) {
    console.error('Failed to clear auth session:', err);
  }
}

export function hasSeenTour(email?: string): boolean {
  try {
    const key = email ? `lumina_tour_seen_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}` : 'lumina_tour_seen_general';
    return localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}

export function markTourSeen(email?: string): void {
  try {
    const key = email ? `lumina_tour_seen_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}` : 'lumina_tour_seen_general';
    localStorage.setItem(key, 'true');
  } catch (err) {
    console.error('Failed to mark tour seen:', err);
  }
}

export async function fetchServerNotebooks(token: string): Promise<Notebook[] | null> {
  try {
    const res = await fetch('/api/user/notebooks', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data.notebooks) ? data.notebooks : [];
  } catch (err) {
    console.error('Failed to fetch notebooks from server:', err);
    return null;
  }
}

export async function syncNotebooksToServer(token: string, notebooks: Notebook[]): Promise<boolean> {
  try {
    const res = await fetch('/api/user/notebooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ notebooks }),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to sync notebooks to server:', err);
    return false;
  }
}

export function loadNotebooks(): Notebook[] {
  try {
    // If user hasn't had the clean slate reset yet, clear any old demo books
    const hasCleanSlate = localStorage.getItem(CLEAN_SLATE_RESET_KEY);
    if (!hasCleanSlate) {
      localStorage.setItem(CLEAN_SLATE_RESET_KEY, 'true');
      localStorage.setItem(INITIALIZED_KEY, 'true');
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Filter out demo/seed notebooks (nb-1, nb-2, nb-3) to ensure notes start strictly from scratch
    const userOnlyNotebooks = parsed.filter(
      (nb) => nb && !['nb-1', 'nb-2', 'nb-3'].includes(nb.id)
    );

    if (userOnlyNotebooks.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userOnlyNotebooks));
    }

    return userOnlyNotebooks;
  } catch (err) {
    console.error('Failed to load notebooks from localStorage:', err);
    return [];
  }
}

export function clearAllNotebooks(): void {
  try {
    localStorage.setItem(CLEAN_SLATE_RESET_KEY, 'true');
    localStorage.setItem(INITIALIZED_KEY, 'true');
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch (err) {
    console.error('Failed to clear notebooks:', err);
  }
}

export function loadSeedNotebooks(): Notebook[] {
  try {
    localStorage.setItem(INITIALIZED_KEY, 'true');
    saveNotebooks(SEED_NOTEBOOKS);
    return SEED_NOTEBOOKS;
  } catch (err) {
    console.error('Failed to load seed notebooks:', err);
    return [];
  }
}

export function saveNotebooks(notebooks: Notebook[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notebooks));
  } catch (err) {
    console.error('Failed to save notebooks to localStorage:', err);
  }
}

export function exportAllDataAsJson(notebooks: Notebook[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(notebooks, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `lumina-study-backup-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importDataFromJson(jsonString: string): Notebook[] | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title && parsed[0].id) {
      saveNotebooks(parsed);
      return parsed;
    }
    return null;
  } catch (e) {
    console.error('Failed to parse imported json data', e);
    return null;
  }
}

export function exportNotebookAsMarkdown(notebook: Notebook): void {
  let md = `# ${notebook.title}\n`;
  if (notebook.author) md += `**Author:** ${notebook.author}\n`;
  md += `**Category:** ${notebook.type.toUpperCase()}\n`;
  md += `**Description:** ${notebook.description}\n\n`;
  md += `---\n\n`;

  if (notebook.historicalContext) {
    md += `## 🏛️ Historical & Author Context\n\n`;
    md += `**Author Biography & Milieu:**\n${notebook.historicalContext.authorBio}\n\n`;
    md += `**Historical Era:**\n${notebook.historicalContext.historicalEra}\n\n`;
    md += `**Central Thesis:**\n${notebook.historicalContext.coreThesis}\n\n`;
    md += `**Cultural Impact & Legacy:**\n${notebook.historicalContext.culturalImpact}\n\n`;
    if (notebook.historicalContext.themes?.length) {
      md += `**Key Themes:**\n`;
      notebook.historicalContext.themes.forEach(t => {
        md += `- ${t}\n`;
      });
      md += `\n`;
    }
    md += `---\n\n`;
  }

  md += `## 🖍️ Highlights & Excerpts (${notebook.highlights.length} total)\n\n`;
  if (notebook.highlights.length === 0) {
    md += `*No highlights recorded yet.*\n\n`;
  } else {
    notebook.highlights.forEach((hl, idx) => {
      const colorMeaning = notebook.customColorMeanings?.[hl.colorKey] || hl.colorKey;
      md += `### ${idx + 1}. [${colorMeaning}] ${hl.topic ? `— ${hl.topic}` : ''}\n`;
      if (hl.pageNumber) md += `*Page ${hl.pageNumber}${hl.chapter ? `, ${hl.chapter}` : ''}*\n\n`;
      md += `> "${hl.text}"\n\n`;
      if (hl.userNote) {
        md += `**Personal Note / Analysis:** ${hl.userNote}\n\n`;
      }
    });
  }

  if (notebook.flashcards.length > 0) {
    md += `---\n\n## 📇 Flashcards Deck (${notebook.flashcards.length} cards)\n\n`;
    notebook.flashcards.forEach((fc, idx) => {
      md += `**Card ${idx + 1} (${fc.topic || 'General'}):**\n`;
      md += `- **Q:** ${fc.question}\n`;
      md += `- **A:** ${fc.answer}\n`;
      if (fc.quoteContext) md += `  *(Context: "${fc.quoteContext}")*\n`;
      md += `\n`;
    });
  }

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', url);
  downloadAnchor.setAttribute('download', `${notebook.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-study-notes.md`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  URL.revokeObjectURL(url);
}

export const exportNotebookToMarkdown = exportNotebookAsMarkdown;
