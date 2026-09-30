import React, { useState } from 'react';
import {
  BookOpen,
  Star,
  Calendar,
  CheckCircle,
  Clock,
  Bookmark,
  Sparkles,
  Camera,
  Layers,
  Landmark,
  BrainCircuit,
  Share2,
  ExternalLink,
  Edit3,
  Save,
  Check,
  Quote,
  TrendingUp,
  FileText,
  Tag,
} from 'lucide-react';
import { Notebook, ReadingStatus, HistoricalContextData } from '../types';
import { HIGHLIGHT_COLORS, getColorDef, getColorMeaning } from '../data/colorPalette';
import { GenrePicker } from './GenrePicker';

interface BookOverviewTabProps {
  notebook: Notebook;
  onUpdateNotebook: (updated: Notebook) => void;
  onNavigateTab: (tab: 'highlights' | 'context' | 'flashcards' | 'assistant' | 'colors') => void;
  onOpenScanModal: () => void;
  onOpenNotionSync: () => void;
}

export const BookOverviewTab: React.FC<BookOverviewTabProps> = ({
  notebook,
  onUpdateNotebook,
  onNavigateTab,
  onOpenScanModal,
  onOpenNotionSync,
}) => {
  // Review & Comments state
  const [userReview, setUserReview] = useState(notebook.userReview || '');
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);

  // Reading status & progress
  const [readingStatus, setReadingStatus] = useState<ReadingStatus>(
    notebook.readingStatus || 'reading'
  );
  const [rating, setRating] = useState<number>(notebook.rating || 5);
  const [currentPage, setCurrentPage] = useState<number>(notebook.currentPage || (notebook.highlights.length > 0 ? Math.max(...notebook.highlights.map(h => h.pageNumber || 0), 1) : 1));
  const [totalPages, setTotalPages] = useState<number>(notebook.totalPages || 320);
  const [startDate, setStartDate] = useState<string>(notebook.startDate || notebook.createdAt.split('T')[0]);
  const [finishDate, setFinishDate] = useState<string>(notebook.finishDate || '');
  const [genre, setGenre] = useState<string>(notebook.genre || (notebook.type === 'book' ? 'Não-Ficção / Desenvolvimento' : 'Estudo Científico'));
  const [isEditingGenre, setIsEditingGenre] = useState(false);

  // Save changes to general book metadata and review
  const handleSaveOverview = () => {
    const updated: Notebook = {
      ...notebook,
      userReview: userReview.trim(),
      readingStatus,
      rating,
      currentPage: Number(currentPage) || 0,
      totalPages: Number(totalPages) || 100,
      startDate,
      finishDate: readingStatus === 'completed' ? (finishDate || new Date().toISOString().split('T')[0]) : finishDate,
      readYear: finishDate ? finishDate.substring(0, 4) : notebook.readYear,
      genre,
      updatedAt: new Date().toISOString(),
    };
    onUpdateNotebook(updated);
    setIsEditingReview(false);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2500);
  };

  // Quick prompt injection into user review
  const handleAddPrompt = (prompt: string) => {
    setUserReview((prev) => {
      const separator = prev ? '\n\n' : '';
      return `${prev}${separator}### ${prompt}\n`;
    });
    setIsEditingReview(true);
  };

  // Color distribution calculations
  const colorCounts: Record<string, number> = {};
  notebook.highlights.forEach((h) => {
    colorCounts[h.colorKey] = (colorCounts[h.colorKey] || 0) + 1;
  });

  const progressPercent = totalPages > 0 ? Math.min(100, Math.round((currentPage / totalPages) * 100)) : 0;
  const favoriteHighlights = notebook.highlights.filter((h) => h.isFavorite);

  return (
    <div className="space-y-6">
      {/* Top Banner / Book Status & Reading Progress Card */}
      <div className="bg-white border border-[#E6E1D8] rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Book Cover Spines & Metadata */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 bg-[#FAF9F6] border border-[#E6E1D8] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-[#78716A] tracking-wider">
                  Status de leitura
                </span>
                {saveFeedback && (
                  <span className="flex items-center gap-1 text-[11px] text-[#6A8E6B] font-semibold animate-pulse">
                    <Check className="w-3 h-3" /> Salvo
                  </span>
                )}
              </div>

              {/* Status Selectors */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F4F1EA] rounded-xl border border-[#E6E1D8]">
                <button
                  type="button"
                  onClick={() => {
                    setReadingStatus('reading');
                    onUpdateNotebook({ ...notebook, readingStatus: 'reading' });
                  }}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg flex flex-col items-center gap-1 transition-all ${
                    readingStatus === 'reading'
                      ? 'bg-white text-[#C86D51] shadow-xs border border-[#E6E1D8]'
                      : 'text-[#78716A] hover:text-[#2D2A26]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Lendo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReadingStatus('completed');
                    onUpdateNotebook({
                      ...notebook,
                      readingStatus: 'completed',
                      currentPage: totalPages,
                      finishDate: finishDate || new Date().toISOString().split('T')[0],
                    });
                    setCurrentPage(totalPages);
                  }}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg flex flex-col items-center gap-1 transition-all ${
                    readingStatus === 'completed'
                      ? 'bg-white text-[#6A8E6B] shadow-xs border border-[#E6E1D8]'
                      : 'text-[#78716A] hover:text-[#2D2A26]'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Lido</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReadingStatus('want_to_read');
                    onUpdateNotebook({ ...notebook, readingStatus: 'want_to_read' });
                  }}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg flex flex-col items-center gap-1 transition-all ${
                    readingStatus === 'want_to_read'
                      ? 'bg-white text-[#5C7D8A] shadow-xs border border-[#E6E1D8]'
                      : 'text-[#78716A] hover:text-[#2D2A26]'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Quero ler</span>
                </button>
              </div>

              {/* Star Rating */}
              <div className="pt-2 border-t border-[#E6E1D8] flex items-center justify-between">
                <span className="text-xs text-[#78716A]">Avaliação:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        setRating(star);
                        onUpdateNotebook({ ...notebook, rating: star });
                      }}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= rating
                            ? 'fill-[#D4A373] text-[#D4A373]'
                            : 'text-[#DCD6CA]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Pages Read & Progress */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#78716A]">Progresso:</span>
                  <span className="font-mono font-bold text-[#2D2A26]">
                    {currentPage} / {totalPages} págs ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-[#EAE5DC] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#C86D51] to-[#E29578] h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="range"
                    min={0}
                    max={totalPages || 500}
                    value={currentPage}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setCurrentPage(val);
                      onUpdateNotebook({ ...notebook, currentPage: val });
                    }}
                    className="w-full accent-[#C86D51] cursor-pointer"
                  />
                </div>
              </div>

              {/* Literary Genre Metadata & Quick Editor */}
              <div className="pt-2.5 border-t border-[#E6E1D8] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#78716A] flex items-center gap-1.5 font-medium">
                    <Tag className="w-3.5 h-3.5 text-[#C86D51]" />
                    <span>Gênero:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingGenre(!isEditingGenre)}
                    className="text-[11px] font-semibold text-[#C86D51] hover:underline"
                  >
                    {isEditingGenre ? 'Concluir' : 'Alterar'}
                  </button>
                </div>

                {!isEditingGenre ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#E6E1D8] text-xs font-semibold text-[#2D2A26] shadow-2xs">
                      {genre || 'Não categorizado'}
                    </span>
                    {notebook.readYear && (
                      <span className="text-[11px] font-mono text-[#78716A]">
                        Ano {notebook.readYear}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="pt-1 bg-white p-2.5 rounded-xl border border-[#C86D51]/30">
                    <GenrePicker
                      value={genre}
                      onChange={(newGenre) => {
                        setGenre(newGenre);
                        onUpdateNotebook({ ...notebook, genre: newGenre });
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Single Scan Button */}
            <button
              type="button"
              onClick={onOpenScanModal}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#C86D51] hover:bg-[#B35C42] text-white font-bold rounded-xl text-xs shadow-xs transition-transform active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Escanear página e grifos</span>
            </button>
          </div>

          {/* Right: Personal Book Review & Reader Comments */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E1D8] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#C86D51]/10 text-[#C86D51] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#2D2A26]">
                    Meus comentários e resenha geral
                  </h3>
                  <p className="text-[11px] text-[#78716A]">
                    Suas conclusões, ideias centrais, críticas e anotações pessoais sobre a obra
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenNotionSync}
                  className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 bg-[#FAF9F6] hover:bg-[#F4F1EA] text-[#2D2A26] border border-[#DCD6CA] rounded-xl transition-colors"
                  title="Sincronizar livro e grifos no Notion em blocos"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#5C7D8A]" />
                  <span>Sincronizar com o Notion</span>
                </button>

                {!isEditingReview ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingReview(true)}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-[#FAF9F6] hover:bg-[#F4F1EA] text-[#2D2A26] border border-[#DCD6CA] rounded-xl transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#C86D51]" />
                    <span>Editar resenha</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveOverview}
                    className="flex items-center gap-1 text-xs font-bold px-3.5 py-1.5 bg-[#C86D51] hover:bg-[#B35C42] text-white rounded-xl shadow-xs transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar comentários</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Prompt Ingestion Chips */}
            {isEditingReview && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-mono text-[#78716A] font-bold">
                  Sugestões:
                </span>
                {[
                  '💡 O que mais me impressionou',
                  '🎯 Principais aprendizados',
                  '⚡ Como pretendo aplicar',
                  '🔍 Crítica pessoal',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleAddPrompt(prompt)}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-[#FAF9F6] hover:bg-[#F4F1EA] text-[#78716A] hover:text-[#2D2A26] border border-[#E6E1D8] transition-colors"
                  >
                    + {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Textarea or Rendered Review */}
            {isEditingReview ? (
              <div className="space-y-3">
                <textarea
                  rows={7}
                  value={userReview}
                  onChange={(e) => setUserReview(e.target.value)}
                  placeholder="Escreva aqui sua síntese pessoal do livro, lições mais valiosas, críticas, reflexões ou resumo executivo dos capítulos..."
                  className="w-full text-xs sm:text-sm bg-[#FAF9F6] border border-[#DCD6CA] rounded-2xl p-4 text-[#2D2A26] font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingReview(false)}
                    className="px-3 py-1.5 text-xs text-[#78716A] hover:text-[#2D2A26]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveOverview}
                    className="px-4 py-1.5 bg-[#C86D51] hover:bg-[#B35C42] text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Salvar comentários
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-5 bg-[#FAF9F6] border border-[#E6E1D8] rounded-2xl min-h-[140px] flex flex-col justify-between">
                {userReview ? (
                  <div className="prose prose-stone text-xs sm:text-sm text-[#4A443F] leading-relaxed whitespace-pre-wrap">
                    {userReview}
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-2">
                    <p className="text-xs text-[#78716A] italic">
                      Você ainda não escreveu comentários gerais ou resenha para este livro.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsEditingReview(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C86D51] hover:underline"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Adicionar meus comentários e reflexões</span>
                    </button>
                  </div>
                )}
                
                <div className="mt-3 pt-3 border-t border-[#E6E1D8]/60 flex items-center justify-between text-[11px] text-[#78716A]">
                  <span>Última atualização: {new Date(notebook.updatedAt).toLocaleDateString('pt-BR')}</span>
                  {notebook.notionLastSyncedAt && (
                    <span className="flex items-center gap-1 text-[#5C7D8A] font-medium">
                      <Share2 className="w-3 h-3" />
                      Sincronizado no Notion em {new Date(notebook.notionLastSyncedAt).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Grid: (1) Citações & Grifos Summary, (2) Contexto Histórico & Autor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Citações & Grifos Extraídos do Livro */}
        <div className="bg-white border border-[#E6E1D8] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E6E1D8] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#C86D51]/10 text-[#C86D51] flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-[#2D2A26]">
                  Citações e grifos ({notebook.highlights.length})
                </h3>
                <p className="text-[11px] text-[#78716A]">
                  Passagens capturadas via câmera ou inserção manual
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('highlights')}
              className="text-xs font-semibold text-[#C86D51] hover:underline flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Color Breakdown Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {HIGHLIGHT_COLORS.map((c) => {
              const count = colorCounts[c.key] || 0;
              if (count === 0) return null;
              const meaning = getColorMeaning(c.key, notebook.customColorMeanings);
              return (
                <span
                  key={c.key}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${c.lightBgClass} ${c.borderClass} ${c.textClass}`}
                  title={meaning}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.hex }} />
                  <span className="capitalize">{c.key}</span>
                  <span className="opacity-80">({count})</span>
                </span>
              );
            })}
          </div>

          {/* Preview of Latest or Starred Highlights */}
          {notebook.highlights.length > 0 ? (
            <div className="space-y-3">
              {notebook.highlights.slice(0, 3).map((hl) => {
                const colorDef = getColorDef(hl.colorKey);
                return (
                  <div
                    key={hl.id}
                    className={`p-3.5 rounded-xl border ${colorDef.lightBgClass} ${colorDef.borderClass} space-y-1.5`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-[#2D2A26] capitalize flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorDef.hex }} />
                        {hl.topic || hl.colorKey}
                      </span>
                      {hl.pageNumber && (
                        <span className="font-mono text-[#78716A]">Pág. {hl.pageNumber}</span>
                      )}
                    </div>
                    <p className="text-xs font-serif italic text-[#2D2A26] line-clamp-2">
                      "{hl.text}"
                    </p>
                    {hl.userNote && (
                      <p className="text-[11px] text-[#78716A] font-sans">
                        💡 {hl.userNote}
                      </p>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => onNavigateTab('highlights')}
                className="w-full py-2 bg-[#FAF9F6] hover:bg-[#F4F1EA] text-[#4A443F] hover:text-[#2D2A26] border border-[#DCD6CA] rounded-xl text-xs font-semibold transition-colors"
              >
                Acessar coleção completa de citações ({notebook.highlights.length})
              </button>
            </div>
          ) : (
            <div className="text-center py-6 space-y-3 bg-[#FAF9F6] rounded-2xl border border-dashed border-[#DCD6CA]">
              <Quote className="w-8 h-8 text-[#A8A29E] mx-auto opacity-50" />
              <p className="text-xs text-[#78716A]">Nenhum grifo adicionado ainda.</p>
              <button
                type="button"
                onClick={onOpenScanModal}
                className="px-3.5 py-1.5 bg-[#C86D51] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#B35C42]"
              >
                Escanear página com a câmera
              </button>
            </div>
          )}
        </div>

        {/* Card 2: Contexto Histórico, Biografia e Tese Central */}
        <div className="bg-white border border-[#E6E1D8] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E6E1D8] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#6A8E6B]/10 text-[#6A8E6B] flex items-center justify-center">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-[#2D2A26]">
                  Contexto histórico e autor
                </h3>
                <p className="text-[11px] text-[#78716A]">
                  Tese central, biografia intelectual e época da obra
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('context')}
              className="text-xs font-semibold text-[#6A8E6B] hover:underline flex items-center gap-1"
            >
              <span>Ver completo</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {notebook.historicalContext ? (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#FAF9F6] border border-[#E6E1D8] rounded-xl space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#C86D51]">
                  Tese central da obra
                </span>
                <p className="text-[#2D2A26] font-serif leading-relaxed line-clamp-3">
                  {notebook.historicalContext.coreThesis}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#78716A]">
                  Biografia do autor e época
                </span>
                <p className="text-[#4A443F] leading-relaxed line-clamp-3">
                  {notebook.historicalContext.authorBio}
                </p>
              </div>

              {notebook.historicalContext.themes?.length > 0 && (
                <div className="pt-1">
                  <span className="text-[10px] font-mono font-bold text-[#78716A] block mb-1.5">
                    Temas principais
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {notebook.historicalContext.themes.slice(0, 4).map((theme, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-full bg-[#FAF9F6] text-[#4A443F] border border-[#DCD6CA] text-[10px]"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => onNavigateTab('context')}
                className="w-full py-2 bg-[#FAF9F6] hover:bg-[#F4F1EA] text-[#4A443F] hover:text-[#2D2A26] border border-[#DCD6CA] rounded-xl text-xs font-semibold transition-colors"
              >
                Explorar análise histórica e lentes de estudo
              </button>
            </div>
          ) : (
            <div className="text-center py-6 space-y-3 bg-[#FAF9F6] rounded-2xl border border-dashed border-[#DCD6CA]">
              <Sparkles className="w-8 h-8 text-[#6A8E6B] mx-auto opacity-70" />
              <p className="text-xs text-[#78716A]">
                Nenhum contexto histórico gerado para este livro ainda.
              </p>
              <button
                type="button"
                onClick={() => onNavigateTab('context')}
                className="px-3.5 py-1.5 bg-[#6A8E6B] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#587959]"
              >
                Gerar contexto histórico
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card 3: Resumos e Aprofundamentos dos Capítulos e Temas (IA) */}
      {notebook.chapterTopicSummaries && notebook.chapterTopicSummaries.length > 0 && (
        <div className="bg-white border border-[#E6E1D8] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E6E1D8] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#5C7D8A]/10 text-[#5C7D8A] flex items-center justify-center">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-[#2D2A26]">
                  Resumos executivos e aprofundamentos por capítulo ou tema ({notebook.chapterTopicSummaries.length})
                </h3>
                <p className="text-[11px] text-[#78716A]">
                  Sínteses geradas pela IA conectando citações, lições e teorias
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('highlights')}
              className="text-xs font-semibold text-[#5C7D8A] hover:underline flex items-center gap-1"
            >
              <span>Gerenciar na aba de grifos</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notebook.chapterTopicSummaries.map((sum) => (
              <div
                key={sum.id}
                className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#DCD6CA] space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-[#5C7D8A] px-2 py-0.5 rounded-md bg-white border border-[#E6E1D8]">
                    {sum.type === 'chapter' ? 'Capítulo' : 'Tema'}: {sum.targetName}
                  </span>
                  <span className="text-[10px] text-[#78716A]">
                    {sum.quoteCount} citações analisadas
                  </span>
                </div>

                <p className="text-xs font-serif text-[#2D2A26] leading-relaxed line-clamp-3">
                  {sum.executiveSummary}
                </p>

                {sum.keyTakeaways && sum.keyTakeaways.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-[#E6E1D8]">
                    <span className="text-[10px] font-bold text-[#78716A] font-mono">
                      Pontos principais:
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-[#4A443F]">
                      {sum.keyTakeaways.slice(0, 2).map((takeaway, i) => (
                        <li key={i} className="line-clamp-1">
                          {takeaway}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
