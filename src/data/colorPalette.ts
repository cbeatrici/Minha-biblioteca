import { HighlightColorDef } from '../types';

export const BASE_HIGHLIGHT_COLORS: HighlightColorDef[] = [
  {
    key: 'red',
    name: 'Vermelho',
    hex: '#D9534F',
    bgClass: 'bg-[#D9534F]',
    lightBgClass: 'bg-[#FDF2F2]',
    borderClass: 'border-[#F8D7DA]',
    textClass: 'text-[#9E2A2B]',
    badgeClass: 'bg-[#FCE8E6] text-[#A8282B] border-[#F5C2C4]',
    dotClass: 'bg-[#D9534F]',
    defaultMeaning: 'Ideia central / Tese principal',
  },
  {
    key: 'orange',
    name: 'Laranja',
    hex: '#E67E22',
    bgClass: 'bg-[#E67E22]',
    lightBgClass: 'bg-[#FEF7EE]',
    borderClass: 'border-[#FDE3C8]',
    textClass: 'text-[#B45309]',
    badgeClass: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
    dotClass: 'bg-[#E67E22]',
    defaultMeaning: '',
  },
  {
    key: 'yellow',
    name: 'Amarelo',
    hex: '#D4A017',
    bgClass: 'bg-[#D4A017]',
    lightBgClass: 'bg-[#FEFCE8]',
    borderClass: 'border-[#FEF08A]',
    textClass: 'text-[#854D0E]',
    badgeClass: 'bg-[#FEF9C3] text-[#713F12] border-[#FEF08A]',
    dotClass: 'bg-[#D4A017]',
    defaultMeaning: '',
  },
  {
    key: 'green',
    name: 'Verde',
    hex: '#6A8E6B',
    bgClass: 'bg-[#6A8E6B]',
    lightBgClass: 'bg-[#F0FDF4]',
    borderClass: 'border-[#DCFCE7]',
    textClass: 'text-[#166534]',
    badgeClass: 'bg-[#E8F5E9] text-[#2E6930] border-[#C8E6C9]',
    dotClass: 'bg-[#6A8E6B]',
    defaultMeaning: '',
  },
  {
    key: 'blue',
    name: 'Azul',
    hex: '#4A7C99',
    bgClass: 'bg-[#4A7C99]',
    lightBgClass: 'bg-[#F0F9FF]',
    borderClass: 'border-[#BAE6FD]',
    textClass: 'text-[#075985]',
    badgeClass: 'bg-[#E0F2FE] text-[#0C4A6E] border-[#BAE6FD]',
    dotClass: 'bg-[#4A7C99]',
    defaultMeaning: '',
  },
  {
    key: 'purple',
    name: 'Roxo',
    hex: '#8E6CA8',
    bgClass: 'bg-[#8E6CA8]',
    lightBgClass: 'bg-[#FAF5FF]',
    borderClass: 'border-[#E9D5FF]',
    textClass: 'text-[#6B21A8]',
    badgeClass: 'bg-[#F3E8FF] text-[#581C87] border-[#E9D5FF]',
    dotClass: 'bg-[#8E6CA8]',
    defaultMeaning: '',
  },
  {
    key: 'neutral',
    name: 'Neutro',
    hex: '#64748B',
    bgClass: 'bg-[#64748B]',
    lightBgClass: 'bg-[#F8FAFC]',
    borderClass: 'border-[#CBD5E1]',
    textClass: 'text-[#334155]',
    badgeClass: 'bg-[#F1F5F9] text-[#334155] border-[#CBD5E1]',
    dotClass: 'bg-[#64748B]',
    defaultMeaning: '',
  },
];

// Preset pool of extra colors the user can add to their palette
export const AVAILABLE_EXTRA_COLORS: HighlightColorDef[] = [
  {
    key: 'pink',
    name: 'Rosa',
    hex: '#D81B60',
    bgClass: 'bg-[#D81B60]',
    lightBgClass: 'bg-[#FDF2F8]',
    borderClass: 'border-[#FBCFE8]',
    textClass: 'text-[#9D174D]',
    badgeClass: 'bg-[#FCE7F3] text-[#9D174D] border-[#FBCFE8]',
    dotClass: 'bg-[#D81B60]',
    defaultMeaning: '',
  },
  {
    key: 'teal',
    name: 'Turquesa',
    hex: '#0D9488',
    bgClass: 'bg-[#0D9488]',
    lightBgClass: 'bg-[#F0FDFA]',
    borderClass: 'border-[#99F6E4]',
    textClass: 'text-[#115E59]',
    badgeClass: 'bg-[#CCFBF1] text-[#115E59] border-[#99F6E4]',
    dotClass: 'bg-[#0D9488]',
    defaultMeaning: '',
  },
  {
    key: 'brown',
    name: 'Castanho / Terra',
    hex: '#8D6E63',
    bgClass: 'bg-[#8D6E63]',
    lightBgClass: 'bg-[#EFEBE9]',
    borderClass: 'border-[#D7CCC8]',
    textClass: 'text-[#4E342E]',
    badgeClass: 'bg-[#D7CCC8] text-[#4E342E] border-[#BCAAA4]',
    dotClass: 'bg-[#8D6E63]',
    defaultMeaning: '',
  },
  {
    key: 'indigo',
    name: 'Índigo',
    hex: '#4338CA',
    bgClass: 'bg-[#4338CA]',
    lightBgClass: 'bg-[#EEF2FF]',
    borderClass: 'border-[#C7D2FE]',
    textClass: 'text-[#3730A3]',
    badgeClass: 'bg-[#E0E7FF] text-[#3730A3] border-[#C7D2FE]',
    dotClass: 'bg-[#4338CA]',
    defaultMeaning: '',
  },
  {
    key: 'gold',
    name: 'Dourado',
    hex: '#B45309',
    bgClass: 'bg-[#B45309]',
    lightBgClass: 'bg-[#FFFBEB]',
    borderClass: 'border-[#FDE68A]',
    textClass: 'text-[#78350F]',
    badgeClass: 'bg-[#FEF3C7] text-[#78350F] border-[#FDE68A]',
    dotClass: 'bg-[#B45309]',
    defaultMeaning: '',
  },
];

export const HIGHLIGHT_COLORS: HighlightColorDef[] = [...BASE_HIGHLIGHT_COLORS];

const STORAGE_KEY_PALETTE_PREFIX = 'exlibris_user_palette_';

export function getUserColorPalette(userEmail?: string): HighlightColorDef[] {
  try {
    const key = `${STORAGE_KEY_PALETTE_PREFIX}${userEmail || 'default'}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load user color palette:', err);
  }
  return [...BASE_HIGHLIGHT_COLORS];
}

export function saveUserColorPalette(colors: HighlightColorDef[], userEmail?: string) {
  try {
    const key = `${STORAGE_KEY_PALETTE_PREFIX}${userEmail || 'default'}`;
    localStorage.setItem(key, JSON.stringify(colors));
  } catch (err) {
    console.error('Failed to save user color palette:', err);
  }
}

export function getColorDef(key: string, customPalette?: HighlightColorDef[]): HighlightColorDef {
  const normalized = (key || '').toLowerCase();
  const searchPool = customPalette && customPalette.length > 0 ? customPalette : HIGHLIGHT_COLORS;

  if (normalized === 'underline' || normalized === 'none') {
    return searchPool.find((c) => c.key === 'neutral') || HIGHLIGHT_COLORS[HIGHLIGHT_COLORS.length - 1];
  }
  const found = searchPool.find((c) => c.key === normalized);
  if (found) return found;

  // Search extra pool
  const extraFound = AVAILABLE_EXTRA_COLORS.find((c) => c.key === normalized);
  if (extraFound) return extraFound;

  return searchPool[searchPool.length - 1] || HIGHLIGHT_COLORS[HIGHLIGHT_COLORS.length - 1];
}

export function getColorMeaning(key: string, customMeanings?: Record<string, string>): string {
  if (customMeanings && customMeanings[key] !== undefined && customMeanings[key].trim() !== '') {
    return customMeanings[key];
  }
  const colorDef = getColorDef(key);
  return colorDef.defaultMeaning || '';
}

export const COVER_THEMES = [
  { key: 'sage', name: 'Verde Oliva', bg: 'from-[#556B4A] via-[#687F5D] to-[#45583C]', accent: 'border-[#8C9A7E]', spine: 'bg-[#3A4B31]' },
  { key: 'terracotta', name: 'Terracota', bg: 'from-[#B35446] via-[#C96B5C] to-[#964235]', accent: 'border-[#E5988D]', spine: 'bg-[#7A3227]' },
  { key: 'sand', name: 'Areia do Deserto', bg: 'from-[#A68A68] via-[#B89F7D] to-[#8C7352]', accent: 'border-[#D9C8B2]', spine: 'bg-[#6F5B40]' },
  { key: 'slate', name: 'Ardósia / Azul Cinza', bg: 'from-[#4B5E68] via-[#5C717C] to-[#3B4C55]', accent: 'border-[#9CB2BE]', spine: 'bg-[#2E3C43]' },
  { key: 'ochre', name: 'Ocre Dourado', bg: 'from-[#B87D3B] via-[#CC914E] to-[#9C662B]', accent: 'border-[#E2B77E]', spine: 'bg-[#7E4F1B]' },
  { key: 'forest', name: 'Musgo Profundo', bg: 'from-[#38533D] via-[#48674E] to-[#2B402F]', accent: 'border-[#7DA785]', spine: 'bg-[#203323]' },
  { key: 'plum', name: 'Ameixa Crepúsculo', bg: 'from-[#6E4F68] via-[#82617C] to-[#583D53]', accent: 'border-[#B494AE]', spine: 'bg-[#432C3F]' },
];
