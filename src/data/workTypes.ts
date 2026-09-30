export interface WorkTypeItem {
  id: string;
  label: string;
  icon?: string;
  isCustom?: boolean;
}

export const DEFAULT_WORK_TYPES: WorkTypeItem[] = [
  { id: 'book', label: '📖 Livro / Não-ficção' },
  { id: 'fiction', label: '🌹 Romance / Ficção' },
  { id: 'study', label: '🎓 Estudo acadêmico' },
  { id: 'paper', label: '📑 Artigo ou ensaio' },
  { id: 'research', label: '🔬 Filosofia ou tópico' },
  { id: 'theology', label: '⛪ Teologia / Espiritualidade' },
];

const STORAGE_KEY_PREFIX = 'exlibris_custom_work_types_';

export function getUserWorkTypes(userEmail?: string): WorkTypeItem[] {
  try {
    const key = `${STORAGE_KEY_PREFIX}${userEmail || 'default'}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed: WorkTypeItem[] = JSON.parse(stored);
      // Merge with defaults avoiding duplicate IDs
      const map = new Map<string, WorkTypeItem>();
      DEFAULT_WORK_TYPES.forEach((t) => map.set(t.id, t));
      parsed.forEach((t) => map.set(t.id, t));
      return Array.from(map.values());
    }
  } catch (err) {
    console.error('Failed to parse custom work types:', err);
  }
  return [...DEFAULT_WORK_TYPES];
}

export function saveUserWorkTypes(types: WorkTypeItem[], userEmail?: string) {
  try {
    const key = `${STORAGE_KEY_PREFIX}${userEmail || 'default'}`;
    localStorage.setItem(key, JSON.stringify(types));
  } catch (err) {
    console.error('Failed to save custom work types:', err);
  }
}

export function addUserWorkType(label: string, userEmail?: string): WorkTypeItem {
  const cleanLabel = label.trim();
  const id = `custom_${cleanLabel.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
  const newItem: WorkTypeItem = {
    id,
    label: cleanLabel.startsWith('📚') || cleanLabel.startsWith('📖') || cleanLabel.startsWith('📑')
      ? cleanLabel
      : `📚 ${cleanLabel}`,
    isCustom: true,
  };

  const current = getUserWorkTypes(userEmail);
  const updated = [...current, newItem];
  saveUserWorkTypes(updated, userEmail);
  return newItem;
}

export function removeUserWorkType(id: string, userEmail?: string): WorkTypeItem[] {
  const current = getUserWorkTypes(userEmail);
  const updated = current.filter((t) => t.id !== id);
  saveUserWorkTypes(updated, userEmail);
  return updated;
}
