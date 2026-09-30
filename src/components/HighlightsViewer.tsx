import React, { useState } from 'react';
import {
  Layers,
  Search,
  Plus,
  Volume2,
  VolumeX,
  Star,
  Trash2,
  Edit3,
  Check,
  Copy,
  CheckCheck,
  BookOpen,
  Sparkles,
  BookMarked,
  Tag,
  FileText,
  ChevronDown,
  ChevronUp,
  Brain,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  FolderTree,
} from 'lucide-react';
import { HighlightItem, Notebook, ChapterTopicSummary } from '../types';
import { HIGHLIGHT_COLORS, getColorDef, getColorMeaning } from '../data/colorPalette';
import { speakText, stopSpeaking } from '../utils/speech';

interface HighlightsViewerProps {
  notebook: Notebook;
  onAddHighlight: (highlight: HighlightItem) => void;
  onUpdateHighlight: (highlight: HighlightItem) => void;
  onDeleteHighlight: (id: string) => void;
  onOpenScanModal: () => void;
  onUpdateNotebook?: (updated: Notebook) => void;
}

export const HighlightsViewer: React.FC<HighlightsViewerProps> = ({
  notebook,
  onAddHighlight,
  onUpdateHighlight,
  onDeleteHighlight,
  onOpenScanModal,
  onUpdateNotebook,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColorFilter, setSelectedColorFilter] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [groupBy, setGroupBy] = useState<'chapter' | 'topic' | 'color' | 'page' | 'all'>('chapter');

  // Audio Speech State
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Copied State
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Editing / Adding States
  const [editingHighlightId, setEditingHighlightId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState('');
  const [isAddingManual, setIsAddingManual] = useState(false);
  const [newQuoteText, setNewQuoteText] = useState('');
  const [newColorKey, setNewColorKey] = useState('yellow');
  const [newTopic, setNewTopic] = useState('');
  const [newPageNum, setNewPageNum] = useState('');
  const [newChapter, setNewChapter] = useState('');
  const [newUserNote, setNewUserNote] = useState('');

  // AI Synthesis Loading States
  const [synthesizingGroup, setSynthesizingGroup] = useState<string | null>(null);
  const [collapsedSummaries, setCollapsedSummaries] = useState<Record<string, boolean>>({});

  // Handle Speech
  const handleToggleSpeak = (highlight: HighlightItem) => {
    if (speakingId === highlight.id) {
      stopSpeaking();
      setSpeakingId(null);
    } else {
      setSpeakingId(highlight.id);
      speakText(`Citação: ${highlight.text}. ${highlight.userNote ? `Nota do leitor: ${highlight.userNote}` : ''}`, () => {
        setSpeakingId(null);
      });
    }
  };

  // Handle Copy
  const handleCopyQuote = (highlight: HighlightItem) => {
    const textToCopy = `"${highlight.text}"\n— ${notebook.title}${notebook.author ? ` por ${notebook.author}` : ''}${
      highlight.pageNumber ? ` (pág. ${highlight.pageNumber})` : ''
    }${highlight.chapter ? ` [${highlight.chapter}]` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(highlight.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle Submit Manual Highlight
  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuoteText.trim()) return;

    const newHl: HighlightItem = {
      id: `hl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      notebookId: notebook.id,
      text: newQuoteText.trim(),
      colorKey: newColorKey,
      topic: newTopic.trim() || 'Geral',
      userNote: newUserNote.trim() || undefined,
      pageNumber: newPageNum ? parseInt(newPageNum, 10) : undefined,
      chapter: newChapter.trim() || undefined,
      createdAt: new Date().toISOString(),
      isFavorite: newColorKey === 'red' || newColorKey === 'purple',
    };

    onAddHighlight(newHl);
    setIsAddingManual(false);
    setNewQuoteText('');
    setNewTopic('');
    setNewUserNote('');
    setNewPageNum('');
    setNewChapter('');
  };

  // AI Synthesis for Chapter or Topic
  const handleGenerateAISummary = async (
    targetType: 'chapter' | 'topic' | 'general',
    targetName: string,
    groupQuotes: HighlightItem[]
  ) => {
    if (!groupQuotes.length) return;

    setSynthesizingGroup(targetName);

    try {
      const res = await fetch('/api/synthesize-chapter-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notebookTitle: notebook.title,
          author: notebook.author,
          targetType,
          targetName,
          quotes: groupQuotes.map((q) => ({
            text: q.text,
            userNote: q.userNote,
            pageNumber: q.pageNumber,
            colorKey: q.colorKey,
            topic: q.topic,
          })),
        }),
      });

      const json = await res.json();

      if (res.ok && json.success && json.data && onUpdateNotebook) {
        const data = json.data;
        const newSummary: ChapterTopicSummary = {
          id: `sum-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          notebookId: notebook.id,
          type: targetType,
          targetName,
          executiveSummary: data.executiveSummary,
          keyTakeaways: data.keyTakeaways || [],
          deepDiveAnalysis: data.deepDiveAnalysis,
          practicalApplications: data.practicalApplications || [],
          criticalQuestions: data.criticalQuestions || [],
          quoteCount: groupQuotes.length,
          generatedAt: new Date().toISOString(),
        };

        const existingSummaries = (notebook.chapterTopicSummaries || []).filter(
          (s) => !(s.type === targetType && s.targetName.toLowerCase() === targetName.toLowerCase())
        );

        onUpdateNotebook({
          ...notebook,
          chapterTopicSummaries: [newSummary, ...existingSummaries],
          updatedAt: new Date().toISOString(),
        });

        // Ensure not collapsed
        setCollapsedSummaries((prev) => ({ ...prev, [targetName]: false }));
      }
    } catch (err) {
      console.error('Failed to generate synthesis:', err);
    } finally {
      setSynthesizingGroup(null);
    }
  };

  // Filter Highlights
  const filteredHighlights = notebook.highlights.filter((hl) => {
    const matchesColor = selectedColorFilter === 'all' || hl.colorKey === selectedColorFilter;
    const matchesFav = !onlyFavorites || hl.isFavorite;
    const matchesSearch =
      hl.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hl.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (hl.userNote && hl.userNote.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (hl.chapter && hl.chapter.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesColor && matchesFav && matchesSearch;
  });

  // Calculate Color Distribution
  const colorCounts: Record<string, number> = {};
  notebook.highlights.forEach((h) => {
    colorCounts[h.colorKey] = (colorCounts[h.colorKey] || 0) + 1;
  });

  // Group highlights according to active groupBy setting
  interface GroupedSection {
    key: string;
    title: string;
    subtitle?: string;
    type: 'chapter' | 'topic' | 'color' | 'page' | 'general';
    items: HighlightItem[];
  }

  const groupedSections: GroupedSection[] = React.useMemo(() => {
    if (groupBy === 'all') {
      return [
        {
          key: 'all_quotes',
          title: 'Todas as citações',
          subtitle: `${filteredHighlights.length} citações e reflexões`,
          type: 'general',
          items: filteredHighlights,
        },
      ];
    }

    if (groupBy === 'chapter') {
      const map: Record<string, HighlightItem[]> = {};
      filteredHighlights.forEach((hl) => {
        const k = hl.chapter?.trim() || 'Sem capítulo definido';
        if (!map[k]) map[k] = [];
        map[k].push(hl);
      });
      return Object.entries(map).map(([chap, items]) => ({
        key: chap,
        title: chap,
        subtitle: `${items.length} citações extraídas`,
        type: 'chapter',
        items,
      }));
    }

    if (groupBy === 'topic') {
      const map: Record<string, HighlightItem[]> = {};
      filteredHighlights.forEach((hl) => {
        const k = hl.topic?.trim() || 'Geral';
        if (!map[k]) map[k] = [];
        map[k].push(hl);
      });
      return Object.entries(map).map(([topic, items]) => ({
        key: topic,
        title: topic,
        subtitle: `${items.length} citações marcadas neste tema`,
        type: 'topic',
        items,
      }));
    }

    if (groupBy === 'page') {
      const map: Record<string, HighlightItem[]> = {};
      filteredHighlights.forEach((hl) => {
        const k = hl.pageNumber ? `Página ${hl.pageNumber}` : 'Página não informada';
        if (!map[k]) map[k] = [];
        map[k].push(hl);
      });
      return Object.entries(map).map(([pageLabel, items]) => ({
        key: pageLabel,
        title: pageLabel,
        subtitle: `${items.length} citações`,
        type: 'page',
        items,
      }));
    }

    // Color group
    const map: Record<string, HighlightItem[]> = {};
    filteredHighlights.forEach((hl) => {
      if (!map[hl.colorKey]) map[hl.colorKey] = [];
      map[hl.colorKey].push(hl);
    });
    return Object.entries(map).map(([colorKey, items]) => {
      const meaning = getColorMeaning(colorKey, notebook.customColorMeanings);
      return {
        key: colorKey,
        title: `${colorKey.toUpperCase()} — ${meaning}`,
        subtitle: `${items.length} citações desta categoria`,
        type: 'color',
        items,
      };
    });
  }, [filteredHighlights, groupBy, notebook.customColorMeanings]);

  // Lookup summary if one exists for a given group
  const getSummaryForGroup = (sectionType: string, sectionTitle: string) => {
    if (!notebook.chapterTopicSummaries) return null;
    return notebook.chapterTopicSummaries.find(
      (s) =>
        (s.type === sectionType || sectionType === 'general') &&
        s.targetName.toLowerCase() === sectionTitle.toLowerCase()
    );
  };

  return (
    <div className="space-y-6 text-[#4A443F]">
      {/* Top Filter & Organization Bar */}
      <div className="bg-white border border-[#E6E1D8] rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#78716A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar citações, capítulos, temas, notas pessoais..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F6] border border-[#DCD6CA] rounded-xl text-[#2D2A26] placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#C86D51]"
            />
          </div>

          {/* Grouping & Action Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Group By Selector */}
            <div className="flex items-center bg-[#FAF9F6] border border-[#DCD6CA] rounded-xl p-1 text-xs">
              <span className="text-[11px] font-semibold text-[#78716A] px-2 flex items-center gap-1">
                <FolderTree className="w-3 h-3" />
                Agrupar:
              </span>
              <button
                onClick={() => setGroupBy('chapter')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  groupBy === 'chapter'
                    ? 'bg-[#2D2A26] text-white font-bold shadow-xs'
                    : 'text-[#4A443F] hover:text-[#2D2A26]'
                }`}
              >
                Capítulo
              </button>
              <button
                onClick={() => setGroupBy('topic')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  groupBy === 'topic'
                    ? 'bg-[#2D2A26] text-white font-bold shadow-xs'
                    : 'text-[#4A443F] hover:text-[#2D2A26]'
                }`}
              >
                Tema
              </button>
              <button
                onClick={() => setGroupBy('color')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  groupBy === 'color'
                    ? 'bg-[#2D2A26] text-white font-bold shadow-xs'
                    : 'text-[#4A443F] hover:text-[#2D2A26]'
                }`}
              >
                Cor
              </button>
              <button
                onClick={() => setGroupBy('page')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  groupBy === 'page'
                    ? 'bg-[#2D2A26] text-white font-bold shadow-xs'
                    : 'text-[#4A443F] hover:text-[#2D2A26]'
                }`}
              >
                Página
              </button>
            </div>

            {/* Favorite Star Filter */}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl font-medium border transition-colors ${
                onlyFavorites
                  ? 'bg-[#C28238]/15 text-[#9C662B] border-[#C28238]/30 font-semibold'
                  : 'bg-[#FAF9F6] text-[#78716A] hover:text-[#2D2A26] border-[#DCD6CA]'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-[#C28238] text-[#C28238]' : ''}`} />
              <span>Favoritos</span>
            </button>

            {/* Manual Note Add */}
            <button
              onClick={() => setIsAddingManual(!isAddingManual)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#F4F1EA] hover:bg-[#EAE5DC] text-[#2D2A26] border border-[#DCD6CA] rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar grifo</span>
            </button>

            {/* Scan Page Button */}
            <button
              onClick={onOpenScanModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#C86D51] hover:bg-[#B35C42] text-white rounded-xl shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Escanear página</span>
            </button>
          </div>
        </div>

        {/* Color Filter Taxonomy Strip */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#E6E1D8]">
          <button
            onClick={() => setSelectedColorFilter('all')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
              selectedColorFilter === 'all'
                ? 'bg-[#2D2A26] text-white font-bold'
                : 'bg-[#FAF9F6] text-[#78716A] hover:text-[#2D2A26] border border-[#DCD6CA]'
            }`}
          >
            Todos os grifos ({notebook.highlights.length})
          </button>

          {HIGHLIGHT_COLORS.map((color) => {
            const count = colorCounts[color.key] || 0;
            const meaning = getColorMeaning(color.key, notebook.customColorMeanings);
            const isSelected = selectedColorFilter === color.key;

            return (
              <button
                key={color.key}
                onClick={() => setSelectedColorFilter(isSelected ? 'all' : color.key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-all ${
                  isSelected
                    ? `${color.bgClass} text-white font-bold shadow-xs`
                    : `${color.lightBgClass} ${color.borderClass} ${color.textClass} hover:opacity-90`
                }`}
                title={meaning}
              >
                <span
                  className="w-2 h-2 rounded-full shadow-xs"
                  style={{ backgroundColor: isSelected ? '#FFFFFF' : color.hex }}
                />
                <span className="capitalize">{color.key}</span>
                <span className="font-mono text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Add Highlight Card */}
      {isAddingManual && (
        <form
          onSubmit={handleSubmitManual}
          className="bg-white border border-[#C86D51]/40 rounded-3xl p-5 sm:p-6 shadow-md space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-serif font-bold text-[#2D2A26] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#C86D51]" />
              Adicionar grifo ou citação manual
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingManual(false)}
              className="text-[#78716A] hover:text-[#2D2A26] text-xs"
            >
              Cancelar
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2D2A26] mb-1">
              Trecho grifado do livro *
            </label>
            <textarea
              required
              rows={3}
              value={newQuoteText}
              onChange={(e) => setNewQuoteText(e.target.value)}
              placeholder="Cole ou transcreva a citação destacada na página..."
              className="w-full text-xs bg-[#FAF9F6] border border-[#DCD6CA] rounded-xl p-3 text-[#2D2A26] font-serif leading-relaxed focus:ring-1 focus:ring-[#C86D51]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#2D2A26] mb-1">Cor do grifo</label>
              <select
                value={newColorKey}
                onChange={(e) => setNewColorKey(e.target.value)}
                className="w-full text-xs bg-[#FAF9F6] border border-[#DCD6CA] rounded-lg p-2 text-[#2D2A26]"
              >
                {HIGHLIGHT_COLORS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.key.toUpperCase()} - {getColorMeaning(c.key, notebook.customColorMeanings)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#2D2A26] mb-1">Capítulo ou seção</label>
              <input
                type="text"
                value={newChapter}
                onChange={(e) => setNewChapter(e.target.value)}
                placeholder="Ex: Capítulo 1: Os dois sistemas"
                className="w-full text-xs bg-[#FAF9F6] border border-[#DCD6CA] rounded-lg p-2 text-[#2D2A26]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#2D2A26] mb-1">Tema ou tópico</label>
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Ex: Vieses cognitivos"
                className="w-full text-xs bg-[#FAF9F6] border border-[#DCD6CA] rounded-lg p-2 text-[#2D2A26]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#2D2A26] mb-1">Número da página</label>
              <input
                type="number"
                value={newPageNum}
                onChange={(e) => setNewPageNum(e.target.value)}
                placeholder="Ex: 42"
                className="w-full text-xs bg-[#FAF9F6] border border-[#DCD6CA] rounded-lg p-2 text-[#2D2A26]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2D2A26] mb-1">
              Comentário ou reflexão pessoal do leitor
            </label>
            <input
              type="text"
              value={newUserNote}
              onChange={(e) => setNewUserNote(e.target.value)}
              placeholder="Por que você destacou este trecho ou como aplicá-lo..."
              className="w-full text-xs bg-[#FAF9F6] border border-[#DCD6CA] rounded-xl p-2.5 text-[#2D2A26]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              className="px-4 py-2 bg-[#C86D51] hover:bg-[#B35C42] text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Salvar grifo
            </button>
          </div>
        </form>
      )}

      {/* Structured Highlights Grouped by Chapter / Topic / Color / Page */}
      {groupedSections.length > 0 && filteredHighlights.length > 0 ? (
        <div className="space-y-8">
          {groupedSections.map((section) => {
            const summary = getSummaryForGroup(section.type, section.title);
            const isSynthesizing = synthesizingGroup === section.title;
            const isCollapsed = collapsedSummaries[section.title] ?? false;

            return (
              <div
                key={section.key}
                className="bg-white border border-[#E6E1D8] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4"
              >
                {/* Group Section Header with AI Summarize Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E1D8]">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#FAF9F6] border border-[#DCD6CA] text-[#C86D51]">
                      {section.type === 'chapter' ? (
                        <BookMarked className="w-4 h-4" />
                      ) : section.type === 'topic' ? (
                        <Tag className="w-4 h-4" />
                      ) : (
                        <Layers className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#2D2A26]">
                        {section.title}
                      </h3>
                      <p className="text-xs text-[#78716A]">{section.subtitle}</p>
                    </div>
                  </div>

                  {/* AI Resumo & Aprofundamento Action */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleGenerateAISummary(
                          section.type === 'chapter' ? 'chapter' : 'topic',
                          section.title,
                          section.items
                        )
                      }
                      disabled={isSynthesizing}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5C7D8A]/10 hover:bg-[#5C7D8A]/20 text-[#5C7D8A] border border-[#5C7D8A]/30 rounded-xl text-xs font-bold transition-all shadow-2xs disabled:opacity-50"
                      title="Sintetizar resumo executivo e gerar aprofundamento analítico deste bloco usando IA"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isSynthesizing ? 'animate-spin' : ''}`} />
                      <span>
                        {isSynthesizing
                          ? 'Sintetizando com IA...'
                          : summary
                          ? 'Atualizar síntese e aprofundamento (IA)'
                          : 'Gerar resumo e aprofundamento (IA) ✨'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* AI Summary Card for Chapter/Topic (if available) */}
                {summary && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-[#FAF9F6] to-[#F4F1EA] border border-[#C86D51]/30 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-lg bg-[#C86D51]/10 text-[#C86D51]">
                          <Brain className="w-4 h-4" />
                        </span>
                        <h4 className="text-xs font-serif font-bold text-[#2D2A26] tracking-wide">
                          Síntese executiva e aprofundamento teórico (IA)
                        </h4>
                      </div>

                      <button
                        onClick={() =>
                          setCollapsedSummaries((prev) => ({
                            ...prev,
                            [section.title]: !isCollapsed,
                          }))
                        }
                        className="text-xs text-[#78716A] hover:text-[#2D2A26] flex items-center gap-1"
                      >
                        <span>{isCollapsed ? 'Expandir' : 'Ocultar'}</span>
                        {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {!isCollapsed && (
                      <div className="space-y-4 text-xs pt-1">
                        {/* Executive Summary */}
                        <div className="space-y-1 bg-white p-3.5 rounded-xl border border-[#E6E1D8]">
                          <span className="font-semibold text-[#2D2A26] text-[11px] font-mono text-[#C86D51]">
                            📌 Resumo do capítulo ou tema:
                          </span>
                          <p className="text-[#2D2A26] leading-relaxed font-serif text-[13px] pt-1">
                            {summary.executiveSummary}
                          </p>
                        </div>

                        {/* Key Takeaways */}
                        {summary.keyTakeaways?.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="font-semibold text-[#2D2A26] text-[11px] font-mono flex items-center gap-1.5">
                              <Lightbulb className="w-3.5 h-3.5 text-[#C28238]" />
                              Principais lições e conceitos:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {summary.keyTakeaways.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-[#E6E1D8]"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#6A8E6B] flex-shrink-0 mt-0.5" />
                                  <span className="text-[#4A443F] leading-snug">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Theoretical Deep Dive Analysis */}
                        {summary.deepDiveAnalysis && (
                          <div className="space-y-1 bg-[#5C7D8A]/5 p-3.5 rounded-xl border border-[#5C7D8A]/20">
                            <span className="font-semibold text-[#5C7D8A] text-[11px] font-mono flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" />
                              Aprofundamento analítico e filosófico:
                            </span>
                            <p className="text-[#2D2A26] leading-relaxed pt-1">
                              {summary.deepDiveAnalysis}
                            </p>
                          </div>
                        )}

                        {/* Practical Applications & Critical Questions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {summary.practicalApplications && summary.practicalApplications.length > 0 && (
                            <div className="space-y-1 bg-white p-3 rounded-xl border border-[#E6E1D8]">
                              <span className="font-semibold text-[#2D2A26] text-[11px] font-mono">
                                🎯 Aplicações práticas:
                              </span>
                              <ul className="list-disc pl-4 space-y-1 text-[#4A443F] pt-1">
                                {summary.practicalApplications.map((appItem, idx) => (
                                  <li key={idx} className="leading-snug">
                                    {appItem}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {summary.criticalQuestions && summary.criticalQuestions.length > 0 && (
                            <div className="space-y-1 bg-white p-3 rounded-xl border border-[#E6E1D8]">
                              <span className="font-semibold text-[#2D2A26] text-[11px] font-mono flex items-center gap-1">
                                <HelpCircle className="w-3 h-3 text-[#5C7D8A]" />
                                Reflexões críticas:
                              </span>
                              <ul className="list-disc pl-4 space-y-1 text-[#4A443F] pt-1">
                                {summary.criticalQuestions.map((qItem, idx) => (
                                  <li key={idx} className="leading-snug italic">
                                    {qItem}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Highlights inside this section */}
                <div className="space-y-3.5 pt-1">
                  {section.items.map((hl) => {
                    const colorDef = getColorDef(hl.colorKey);
                    const colorMeaning = getColorMeaning(hl.colorKey, notebook.customColorMeanings);
                    const isEditing = editingHighlightId === hl.id;
                    const isSpeaking = speakingId === hl.id;
                    const isCopied = copiedId === hl.id;

                    return (
                      <div
                        key={hl.id}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all shadow-2xs ${
                          colorDef.lightBgClass
                        } ${colorDef.borderClass} space-y-3`}
                      >
                        {/* Highlight Header */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Color Tag */}
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${colorDef.badgeClass}`}
                            >
                              <span className={`w-2 h-2 rounded-full ${colorDef.dotClass}`} />
                              <span className="capitalize">{hl.colorKey}</span>
                              <span className="opacity-70 font-normal">({colorMeaning})</span>
                            </span>

                            {/* Topic Badge */}
                            {hl.topic && (
                              <span className="px-2 py-0.5 rounded-md bg-white/80 text-[#4A443F] text-[11px] border border-[#E6E1D8] font-medium">
                                {hl.topic}
                              </span>
                            )}

                            {/* Page / Chapter */}
                            {(hl.pageNumber || hl.chapter) && (
                              <span className="text-[11px] text-[#78716A] font-mono">
                                {hl.pageNumber ? `Pág. ${hl.pageNumber}` : ''}
                                {hl.pageNumber && hl.chapter ? ' • ' : ''}
                                {hl.chapter || ''}
                              </span>
                            )}
                          </div>

                          {/* Actions (Speech, Copy, Star, Delete) */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggleSpeak(hl)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isSpeaking
                                  ? 'bg-[#C86D51] text-white border-[#C86D51]'
                                  : 'bg-white hover:bg-[#F4F1EA] text-[#78716A] hover:text-[#2D2A26] border-[#E6E1D8]'
                              }`}
                              title={isSpeaking ? 'Parar áudio' : 'Ler citação em voz alta'}
                            >
                              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => handleCopyQuote(hl)}
                              className="p-1.5 rounded-lg bg-white hover:bg-[#F4F1EA] text-[#78716A] hover:text-[#2D2A26] border border-[#E6E1D8] transition-colors"
                              title="Copiar citação formatada"
                            >
                              {isCopied ? (
                                <CheckCheck className="w-3.5 h-3.5 text-[#6A8E6B]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() =>
                                onUpdateHighlight({
                                  ...hl,
                                  isFavorite: !hl.isFavorite,
                                })
                              }
                              className="p-1.5 rounded-lg bg-white hover:bg-[#F4F1EA] text-[#78716A] hover:text-[#C28238] border border-[#E6E1D8] transition-colors"
                              title="Favoritar citação"
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${hl.isFavorite ? 'fill-[#C28238] text-[#C28238]' : ''}`}
                              />
                            </button>

                            <button
                              onClick={() => onDeleteHighlight(hl.id)}
                              className="p-1.5 rounded-lg bg-white hover:bg-red-50 text-[#78716A] hover:text-red-600 border border-[#E6E1D8] transition-colors"
                              title="Remover grifo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Extracted Highlight Quote */}
                        <blockquote className="font-serif text-sm sm:text-base text-[#2D2A26] leading-relaxed pl-3 border-l-2 border-[#DCD6CA] italic">
                          "{hl.text}"
                        </blockquote>

                        {/* Personal Note Section */}
                        <div className="pt-2 border-t border-[#E6E1D8]/60 flex items-start justify-between gap-3 text-xs">
                          {isEditing ? (
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="text"
                                value={editNoteText}
                                onChange={(e) => setEditNoteText(e.target.value)}
                                placeholder="Adicionar ou editar anotação pessoal..."
                                className="flex-1 text-xs bg-white border border-[#DCD6CA] rounded-lg px-2.5 py-1.5 text-[#2D2A26]"
                                autoFocus
                              />
                              <button
                                onClick={() => {
                                  onUpdateHighlight({ ...hl, userNote: editNoteText.trim() });
                                  setEditingHighlightId(null);
                                }}
                                className="p-1.5 bg-[#C86D51] hover:bg-[#B35C42] text-white rounded-lg font-bold"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex-1">
                              {hl.userNote ? (
                                <p className="text-[#4A443F] font-sans leading-relaxed">
                                  <span className="font-semibold text-[#A85138] mr-1.5">Comentário do leitor:</span>
                                  {hl.userNote}
                                </p>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingHighlightId(hl.id);
                                    setEditNoteText('');
                                  }}
                                  className="text-[#A8A29E] hover:text-[#78716A] italic text-[11px]"
                                >
                                  + Adicionar comentário ou reflexão pessoal
                                </button>
                              )}
                            </div>
                          )}

                          {!isEditing && hl.userNote && (
                            <button
                              onClick={() => {
                                setEditingHighlightId(hl.id);
                                setEditNoteText(hl.userNote || '');
                              }}
                              className="text-[#78716A] hover:text-[#2D2A26] p-1"
                              title="Editar nota"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-[#E6E1D8] rounded-3xl p-8 space-y-4 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#C86D51]/10 border border-[#C86D51]/20 flex items-center justify-center text-[#C86D51]">
            <Layers className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-bold text-[#2D2A26]">Nenhum grifo encontrado</h3>
            <p className="text-xs text-[#78716A] max-w-sm mx-auto">
              {searchQuery || selectedColorFilter !== 'all'
                ? 'Nenhuma citação corresponde ao filtro de busca ou cor selecionado.'
                : 'Tire uma foto da página do seu livro com a câmera ou adicione uma citação manual para começar seus estudos.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onOpenScanModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#C86D51] hover:bg-[#B35C42] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Escanear página com a câmera</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
