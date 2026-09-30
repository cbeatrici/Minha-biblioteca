import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  ArrowUpDown,
  Trash2,
  Calendar,
  Tag,
  LayoutGrid,
  List,
  Clock,
  Layers,
  BrainCircuit,
  Filter,
  X,
  ChevronRight,
  BookMarked,
  Sparkles,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';
import { Notebook, ReadingStatus } from '../types';
import { NotebookCard } from './NotebookCard';
import { useLanguage } from '../utils/i18n';
import { getAllAvailableGenres } from '../data/genres';

interface NotebookListProps {
  notebooks: Notebook[];
  onSelectNotebook: (notebook: Notebook) => void;
  onOpenNewNotebook: () => void;
  onDeleteNotebook?: (id: string, e: React.MouseEvent) => void;
  onResetHistory?: () => void;
}

export type ViewMode = 'grid' | 'timeline' | 'genre' | 'compact';

export const NotebookList: React.FC<NotebookListProps> = ({
  notebooks,
  onSelectNotebook,
  onOpenNewNotebook,
  onDeleteNotebook,
  onResetHistory,
}) => {
  const { t } = useLanguage();

  // Search & Type Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'title' | 'highlights' | 'rating'>('updated');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Stats calculation
  const totalHighlights = notebooks.reduce((acc, nb) => acc + (nb.highlights?.length || 0), 0);
  const totalFlashcards = notebooks.reduce((acc, nb) => acc + (nb.flashcards?.length || 0), 0);

  // Helper to extract reading year from a notebook
  const getNotebookYear = (nb: Notebook): string => {
    if (nb.readYear) return String(nb.readYear);
    if (nb.finishDate && nb.finishDate.length >= 4) return nb.finishDate.substring(0, 4);
    if (nb.startDate && nb.startDate.length >= 4) return nb.startDate.substring(0, 4);
    if (nb.createdAt && nb.createdAt.length >= 4) return nb.createdAt.substring(0, 4);
    return '2026';
  };

  // Helper to normalize genre
  const getNotebookGenre = (nb: Notebook): string => {
    if (!nb.genre || !nb.genre.trim()) return 'Geral';
    return nb.genre.trim();
  };

  // Discover all distinct years available in current library (include current year 2026 as reference)
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>(['2026', '2025', '2024']);
    notebooks.forEach((nb) => {
      yearsSet.add(getNotebookYear(nb));
    });
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [notebooks]);

  // Discover all distinct genres available in current library (presets + custom + existing notebooks)
  const availableGenres = useMemo(() => {
    return getAllAvailableGenres(notebooks.map((nb) => nb.genre));
  }, [notebooks]);

  // Filter notebooks
  const filteredNotebooks = useMemo(() => {
    return notebooks.filter((nb) => {
      const matchesType = selectedType === 'all' || nb.type === selectedType;
      const nbYear = getNotebookYear(nb);
      const matchesYear = selectedYear === 'all' || nbYear === selectedYear;
      const nbGenre = getNotebookGenre(nb).toLowerCase();
      const matchesGenre = selectedGenre === 'all' || nbGenre.includes(selectedGenre.toLowerCase());
      const nbStatus = nb.readingStatus || 'reading';
      const matchesStatus = selectedStatus === 'all' || nbStatus === selectedStatus;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        nb.title.toLowerCase().includes(q) ||
        (nb.author && nb.author.toLowerCase().includes(q)) ||
        nb.description.toLowerCase().includes(q) ||
        (nb.genre && nb.genre.toLowerCase().includes(q)) ||
        nb.highlights.some(
          (h) =>
            h.text.toLowerCase().includes(q) ||
            h.topic.toLowerCase().includes(q) ||
            (h.userNote && h.userNote.toLowerCase().includes(q))
        );

      return matchesType && matchesYear && matchesGenre && matchesStatus && matchesSearch;
    });
  }, [notebooks, selectedType, selectedYear, selectedGenre, selectedStatus, searchQuery]);

  // Sort notebooks
  const sortedNotebooks = useMemo(() => {
    const list = [...filteredNotebooks];
    list.sort((a, b) => {
      if (sortBy === 'updated') {
        return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
      }
      if (sortBy === 'highlights') {
        return (b.highlights?.length || 0) - (a.highlights?.length || 0);
      }
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      return a.title.localeCompare(b.title);
    });
    return list;
  }, [filteredNotebooks, sortBy]);

  // Groupings for Timeline View (By Year)
  const notebooksByYear = useMemo(() => {
    const groups: Record<string, Notebook[]> = {};
    sortedNotebooks.forEach((nb) => {
      const year = getNotebookYear(nb);
      if (!groups[year]) groups[year] = [];
      groups[year].push(nb);
    });
    // Sort years descending
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((year) => ({
        year,
        items: groups[year],
        totalHighlights: groups[year].reduce((acc, n) => acc + (n.highlights?.length || 0), 0),
        totalPages: groups[year].reduce((acc, n) => acc + (n.currentPage || n.totalPages || 0), 0),
      }));
  }, [sortedNotebooks]);

  // Groupings for Genre View (By Literary Category)
  const notebooksByGenre = useMemo(() => {
    const groups: Record<string, Notebook[]> = {};
    sortedNotebooks.forEach((nb) => {
      const genre = getNotebookGenre(nb);
      if (!groups[genre]) groups[genre] = [];
      groups[genre].push(nb);
    });
    return Object.keys(groups)
      .sort()
      .map((genre) => ({
        genre,
        items: groups[genre],
        totalHighlights: groups[genre].reduce((acc, n) => acc + (n.highlights?.length || 0), 0),
      }));
  }, [sortedNotebooks]);

  const typeTabs: { id: string; label: string; count?: number }[] = [
    { id: 'all', label: t.allBooks, count: notebooks.length },
    { id: 'book', label: t.booksTab, count: notebooks.filter((n) => n.type === 'book').length },
    { id: 'study', label: t.studyTab, count: notebooks.filter((n) => n.type === 'study').length },
    { id: 'paper', label: t.paperTab, count: notebooks.filter((n) => n.type === 'paper').length },
  ];

  const hasActiveFilters =
    selectedYear !== 'all' ||
    selectedGenre !== 'all' ||
    selectedStatus !== 'all' ||
    selectedType !== 'all' ||
    searchQuery.trim() !== '';

  const handleClearFilters = () => {
    setSelectedYear('all');
    setSelectedGenre('all');
    setSelectedStatus('all');
    setSelectedType('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Summary Card */}
      <div className="bg-[#FAF9F6] border border-[#E6E1D8] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#2D2A26] tracking-tight">
            {t.libraryTitle}
          </h1>
          <p className="text-xs text-[#78716A] mt-1">
            {t.librarySubtitle}
          </p>
        </div>

        {/* Quick Metrics & Actions */}
        <div className="flex items-center gap-3 self-start lg:self-auto flex-wrap">
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border border-[#E6E1D8] shadow-2xs">
            <div>
              <span className="block text-base font-bold font-mono text-[#C86D51]">
                {notebooks.length}
              </span>
              <span className="text-[10px] text-[#78716A] font-medium">
                {t.booksCount}
              </span>
            </div>
            <div className="h-6 w-px bg-[#E6E1D8]" />
            <div>
              <span className="block text-base font-bold font-mono text-[#C28238]">
                {totalHighlights}
              </span>
              <span className="text-[10px] text-[#78716A] font-medium">
                {t.highlightsCount}
              </span>
            </div>
            <div className="h-6 w-px bg-[#E6E1D8]" />
            <div>
              <span className="block text-base font-bold font-mono text-[#6A8E6B]">
                {totalFlashcards}
              </span>
              <span className="text-[10px] text-[#78716A] font-medium">
                {t.flashcardsCount}
              </span>
            </div>
          </div>

          {notebooks.length > 0 && onResetHistory && (
            <button
              onClick={() => {
                if (window.confirm(t.resetConfirm)) {
                  onResetHistory();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-rose-50 text-[#78716A] hover:text-rose-600 border border-[#E6E1D8] hover:border-rose-200 rounded-2xl text-xs transition-colors shadow-2xs font-medium"
              title={t.resetHistory}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.resetHistory}</span>
            </button>
          )}
        </div>
      </div>

      {/* Control Bar: View Switchers, Type Tabs, Filters */}
      <div className="space-y-3">
        {/* Row 1: Type Tabs & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {typeTabs.map((tab) => {
              const isActive = selectedType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedType(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#C86D51] text-white font-bold shadow-xs'
                      : 'bg-white hover:bg-[#F4F1EA] text-[#4A443F] border border-[#E6E1D8]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? 'bg-white/20 text-white font-bold' : 'bg-[#F4F1EA] text-[#78716A]'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* View Mode Switcher (Grid, By Year, By Genre, Compact) */}
          <div className="flex items-center gap-1 bg-[#F4F1EA] p-1 rounded-2xl border border-[#E6E1D8] self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-[#2D2A26] font-bold shadow-2xs'
                  : 'text-[#78716A] hover:text-[#2D2A26]'
              }`}
              title="Exibir em grade de cartões"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#C86D51]" />
              <span>{t.viewGrid}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                viewMode === 'timeline'
                  ? 'bg-white text-[#2D2A26] font-bold shadow-2xs'
                  : 'text-[#78716A] hover:text-[#2D2A26]'
              }`}
              title="Separar leituras por ano (ex: 2026, 2025...)"
            >
              <Calendar className="w-3.5 h-3.5 text-[#C86D51]" />
              <span>{t.viewByYear}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('genre')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                viewMode === 'genre'
                  ? 'bg-white text-[#2D2A26] font-bold shadow-2xs'
                  : 'text-[#78716A] hover:text-[#2D2A26]'
              }`}
              title="Separar leituras por gênero literário"
            >
              <Tag className="w-3.5 h-3.5 text-[#C86D51]" />
              <span>{t.viewByGenre}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('compact')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                viewMode === 'compact'
                  ? 'bg-white text-[#2D2A26] font-bold shadow-2xs'
                  : 'text-[#78716A] hover:text-[#2D2A26]'
              }`}
              title="Visualização em lista compacta"
            >
              <List className="w-3.5 h-3.5 text-[#C86D51]" />
              <span>{t.viewCompact}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Deep Filters (Year, Genre, Status, Search, Sort & New Book Button) */}
        <div className="bg-white border border-[#E6E1D8] rounded-2xl p-3 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Quick Filters Group */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter by Year */}
            <div className="flex items-center gap-1 bg-[#FAF9F6] border border-[#E6E1D8] rounded-xl px-2.5 py-1 text-xs">
              <Calendar className="w-3.5 h-3.5 text-[#78716A]" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-xs text-[#2D2A26] font-medium focus:outline-none cursor-pointer"
                title="Filtrar por ano de leitura"
              >
                <option value="all">{t.allYears}</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    Ano {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Genre */}
            <div className="flex items-center gap-1 bg-[#FAF9F6] border border-[#E6E1D8] rounded-xl px-2.5 py-1 text-xs">
              <Tag className="w-3.5 h-3.5 text-[#78716A]" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-transparent text-xs text-[#2D2A26] font-medium focus:outline-none cursor-pointer max-w-[140px]"
                title="Filtrar por gênero"
              >
                <option value="all">{t.allGenres}</option>
                {availableGenres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-1 bg-[#FAF9F6] border border-[#E6E1D8] rounded-xl px-2.5 py-1 text-xs">
              <Clock className="w-3.5 h-3.5 text-[#78716A]" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-xs text-[#2D2A26] font-medium focus:outline-none cursor-pointer"
                title="Filtrar por status"
              >
                <option value="all">{t.allStatus}</option>
                <option value="reading">{t.statusReading}</option>
                <option value="completed">{t.statusCompleted}</option>
                <option value="want_to_read">{t.statusWantToRead}</option>
              </select>
            </div>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors font-medium"
                title="Limpar todos os filtros"
              >
                <X className="w-3 h-3" />
                <span>Limpar filtros</span>
              </button>
            )}
          </div>

          {/* Search, Sort and New Book Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 text-[#78716A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF9F6] border border-[#E6E1D8] rounded-xl text-[#2D2A26] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
              />
            </div>

            <button
              onClick={() =>
                setSortBy(
                  sortBy === 'updated'
                    ? 'highlights'
                    : sortBy === 'highlights'
                    ? 'rating'
                    : sortBy === 'rating'
                    ? 'title'
                    : 'updated'
                )
              }
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#FAF9F6] border border-[#E6E1D8] rounded-xl text-xs text-[#4A443F] hover:text-[#2D2A26] transition-colors"
              title="Alterar ordenação"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#C86D51]" />
              <span className="text-[11px] font-medium hidden sm:inline">
                {sortBy === 'updated'
                  ? t.sortByRecent
                  : sortBy === 'highlights'
                  ? t.sortByHighlights
                  : sortBy === 'rating'
                  ? t.sortByRating
                  : t.sortByTitle}
              </span>
            </button>

            <button
              onClick={onOpenNewNotebook}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#C86D51] hover:bg-[#B35C42] text-white rounded-xl shadow-xs transition-all whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 font-bold" />
              <span>{t.newBook}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area based on View Mode */}
      {sortedNotebooks.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E6E1D8] rounded-3xl p-8 space-y-4 shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#C86D51]/10 border border-[#C86D51]/20 flex items-center justify-center text-[#C86D51]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-serif font-bold text-[#2D2A26]">
              {hasActiveFilters ? t.noResultsTitle : t.emptyLibraryTitle}
            </h3>
            <p className="text-xs text-[#78716A] max-w-sm mx-auto">
              {hasActiveFilters ? t.noResultsSubtitle : t.emptyLibrarySubtitle}
            </p>
          </div>
          {hasActiveFilters ? (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F4F1EA] hover:bg-[#EAE5DC] text-[#2D2A26] text-xs font-semibold rounded-xl border border-[#E6E1D8] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar filtros de busca</span>
            </button>
          ) : (
            <button
              onClick={onOpenNewNotebook}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C86D51] hover:bg-[#B35C42] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addFirstBook}</span>
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* 1. Standard Cards Grid View (Responsive up to 4 cols) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {sortedNotebooks.map((notebook) => (
            <NotebookCard
              key={notebook.id}
              notebook={notebook}
              onSelect={onSelectNotebook}
              onDelete={onDeleteNotebook}
            />
          ))}
        </div>
      ) : viewMode === 'timeline' ? (
        /* 2. Timeline / Grouped by Reading Year */
        <div className="space-y-8">
          {notebooksByYear.map((group) => (
            <div key={group.year} className="space-y-4">
              {/* Year Section Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E6E1D8]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#C86D51]/10 border border-[#C86D51]/20 flex items-center justify-center text-[#C86D51]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-serif font-bold text-[#2D2A26]">
                      {t.readInYear} {group.year}
                    </h2>
                    <p className="text-xs text-[#78716A]">
                      {group.items.length} {t.booksInYear} • {group.totalHighlights} citações salvas
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[#FAF9F6] border border-[#E6E1D8] text-[#5C554E]">
                  {group.items.length} {group.items.length === 1 ? 'obra' : 'obras'}
                </span>
              </div>

              {/* Books in this Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {group.items.map((notebook) => (
                  <NotebookCard
                    key={notebook.id}
                    notebook={notebook}
                    onSelect={onSelectNotebook}
                    onDelete={onDeleteNotebook}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === 'genre' ? (
        /* 3. Grouped by Literary Genre */
        <div className="space-y-8">
          {notebooksByGenre.map((group) => (
            <div key={group.genre} className="space-y-4">
              {/* Genre Section Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E6E1D8]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#6A8E6B]/15 border border-[#6A8E6B]/30 flex items-center justify-center text-[#6A8E6B]">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-serif font-bold text-[#2D2A26]">
                      {group.genre}
                    </h2>
                    <p className="text-xs text-[#78716A]">
                      {group.items.length} {t.booksInGenre} • {group.totalHighlights} citações
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[#FAF9F6] border border-[#E6E1D8] text-[#5C554E]">
                  {group.items.length} {group.items.length === 1 ? 'livro' : 'livros'}
                </span>
              </div>

              {/* Books in this Genre */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {group.items.map((notebook) => (
                  <NotebookCard
                    key={notebook.id}
                    notebook={notebook}
                    onSelect={onSelectNotebook}
                    onDelete={onDeleteNotebook}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 4. Compact Table / List View */
        <div className="bg-white border border-[#E6E1D8] rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] border-b border-[#E6E1D8] text-[#78716A] uppercase font-mono tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Obra e autor</th>
                  <th className="py-3 px-4">Gênero</th>
                  <th className="py-3 px-4">Ano</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Progresso</th>
                  <th className="py-3 px-4 text-center">Grifos</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1D8]">
                {sortedNotebooks.map((nb) => {
                  const status = nb.readingStatus || 'reading';
                  const year = getNotebookYear(nb);
                  const progress =
                    nb.totalPages && nb.currentPage
                      ? Math.min(100, Math.round((nb.currentPage / nb.totalPages) * 100))
                      : null;

                  return (
                    <tr
                      key={nb.id}
                      onClick={() => onSelectNotebook(nb)}
                      className="hover:bg-[#FAF9F6] transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-10 rounded-md bg-[#F4F1EA] border border-[#E6E1D8] overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {nb.coverUrl ? (
                              <img
                                src={nb.coverUrl}
                                alt={nb.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <BookOpen className="w-3.5 h-3.5 text-[#C86D51]" />
                            )}
                          </div>
                          <div>
                            <p className="font-serif font-bold text-xs sm:text-sm text-[#2D2A26] group-hover:text-[#C86D51] transition-colors line-clamp-1">
                              {nb.title}
                            </p>
                            <p className="text-[11px] text-[#78716A] line-clamp-1 italic">
                              {nb.author ? `por ${nb.author}` : 'Autor não informado'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[#5C554E] font-medium">
                        <span className="px-2 py-0.5 rounded-lg bg-[#FAF9F6] border border-[#E6E1D8] text-[11px]">
                          {nb.genre || 'Geral'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[#5C554E] text-[11px]">
                        {year}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            status === 'completed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : status === 'want_to_read'
                              ? 'bg-sky-50 text-sky-800 border-sky-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {status === 'completed'
                            ? 'Lido'
                            : status === 'want_to_read'
                            ? 'Quero ler'
                            : 'Lendo'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {progress !== null ? (
                          <div className="w-24 space-y-0.5">
                            <div className="flex justify-between text-[10px] font-mono text-[#78716A]">
                              <span>{progress}%</span>
                              <span>{nb.currentPage}/{nb.totalPages}</span>
                            </div>
                            <div className="h-1 bg-[#EAE5DC] rounded-full overflow-hidden">
                              <div
                                className="bg-[#C86D51] h-full rounded-full"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#A8A29E]">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold text-[#C86D51]">
                        {nb.highlights.length}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[#C86D51] font-bold text-xs group-hover:translate-x-0.5 transition-transform">
                          <span>Abrir</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
