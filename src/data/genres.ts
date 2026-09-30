// Preset of popular literary and academic genres
export const DEFAULT_MAIN_GENRES: string[] = [
  'Romance',
  'Suspense',
  'Ficção científica',
  'Fantasia',
  'Ficção',
  'Não-ficção',
  'Biografia & Memórias',
  'Desenvolvimento pessoal',
  'Psicologia',
  'Filosofia',
  'História',
  'Negócios',
  'Ciência',
  'Poesia',
  'Terror & Horror',
  'Policial & Mistério',
  'Autoajuda',
  'Clássicos',
  'Sociologia & Política',
  'Espiritualidade',
  'Arte & Design',
];

const CUSTOM_GENRES_STORAGE_KEY = 'app_custom_genres_v1';

export function getCustomGenres(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOM_GENRES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
  } catch {
    return [];
  }
}

export function saveCustomGenre(genre: string): string[] {
  const trimmed = genre.trim();
  if (!trimmed) return getCustomGenres();

  const current = getCustomGenres();
  // Check if already in default or current custom
  const existsInDefault = DEFAULT_MAIN_GENRES.some((g) => g.toLowerCase() === trimmed.toLowerCase());
  const existsInCustom = current.some((g) => g.toLowerCase() === trimmed.toLowerCase());

  if (!existsInDefault && !existsInCustom) {
    const updated = [...current, trimmed];
    try {
      localStorage.setItem(CUSTOM_GENRES_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  }
  return current;
}

export function deleteCustomGenre(genre: string): string[] {
  const current = getCustomGenres();
  const updated = current.filter((g) => g.toLowerCase() !== genre.toLowerCase());
  try {
    localStorage.setItem(CUSTOM_GENRES_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

export function getAllAvailableGenres(additionalGenres: (string | undefined)[] = []): string[] {
  const custom = getCustomGenres();
  const set = new Set<string>();

  // Add default genres
  DEFAULT_MAIN_GENRES.forEach((g) => set.add(g));

  // Add user custom genres
  custom.forEach((g) => set.add(g));

  // Add any genres passed from existing notebooks
  additionalGenres.forEach((g) => {
    if (g && g.trim()) {
      set.add(g.trim());
    }
  });

  return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}
