import React from 'react';
import { BookOpen, Bookmark, Sparkles, Layers, BrainCircuit, Calendar, ChevronRight, MoreVertical, Trash2, Edit, Star, Share2, CheckCircle2, Clock } from 'lucide-react';
import { Notebook } from '../types';
import { COVER_THEMES, getColorDef } from '../data/colorPalette';

interface NotebookCardProps {
  notebook: Notebook;
  onSelect: (notebook: Notebook) => void;
  onDelete?: (id: string, e: React.MouseEvent) => void;
}

export const NotebookCard: React.FC<NotebookCardProps> = ({ notebook, onSelect, onDelete }) => {
  const theme = COVER_THEMES.find((t) => t.key === notebook.coverTheme) || COVER_THEMES[0];

  // Group highlights by color for the preview strip
  const colorCounts: Record<string, number> = {};
  notebook.highlights.forEach((h) => {
    colorCounts[h.colorKey] = (colorCounts[h.colorKey] || 0) + 1;
  });

  const uniqueColors = Object.keys(colorCounts);

  const statusBadges = {
    reading: { label: 'Lendo', bg: 'bg-[#C86D51]/25 text-white border-white/30', icon: Clock },
    completed: { label: 'Lido', bg: 'bg-[#6A8E6B]/35 text-white border-white/30', icon: CheckCircle2 },
    want_to_read: { label: 'Quero ler', bg: 'bg-[#5C7D8A]/35 text-white border-white/30', icon: Bookmark },
  };

  const currentStatus = notebook.readingStatus || 'reading';
  const StatusIcon = statusBadges[currentStatus].icon;

  // Year read detection
  const displayYear = notebook.readYear || (notebook.finishDate ? notebook.finishDate.substring(0, 4) : undefined);

  const progress = notebook.totalPages && notebook.currentPage
    ? Math.min(100, Math.round((notebook.currentPage / notebook.totalPages) * 100))
    : null;

  return (
    <div
      onClick={() => onSelect(notebook)}
      className="group relative cursor-pointer flex flex-col bg-white rounded-3xl border border-[#E6E1D8] hover:border-[#C86D51]/60 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden transform hover:-translate-y-0.5"
    >
      {/* Top Book Cover Spine & Texture */}
      <div className={`h-44 relative p-4 bg-gradient-to-br ${theme.bg} overflow-hidden border-b border-[#E6E1D8] flex flex-col justify-between`}>
        {/* Background Real Cover Image if present */}
        {notebook.coverUrl && (
          <div className="absolute inset-0 z-0">
            <img
              src={notebook.coverUrl}
              alt={notebook.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter brightness-90 group-hover:scale-105 transition-transform duration-500"
            />
            {/* Scrim gradient for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/60" />
          </div>
        )}

        {/* Notebook Spine Visual */}
        <div className={`absolute left-0 top-0 bottom-0 w-3.5 z-10 ${theme.spine} border-r border-black/15 shadow-inner flex flex-col justify-between py-2 items-center`}>
          <div className="w-1 h-2 bg-white/40 rounded-full" />
          <div className="w-1 h-2 bg-white/40 rounded-full" />
          <div className="w-1 h-2 bg-white/40 rounded-full" />
        </div>

        {/* Top Badges */}
        <div className="pl-3 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border backdrop-blur-sm flex items-center gap-1 ${statusBadges[currentStatus].bg}`}>
              <StatusIcon className="w-3 h-3" />
              <span>{statusBadges[currentStatus].label}</span>
            </span>

            {displayYear && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/30 bg-black/35 backdrop-blur-sm text-white flex items-center gap-1" title="Ano de leitura">
                <Calendar className="w-3 h-3 text-[#F9E8B2]" />
                <span>{displayYear}</span>
              </span>
            )}

            {notebook.genre && (
              <span className="hidden sm:inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm text-white/90 line-clamp-1 max-w-[100px] truncate" title={notebook.genre}>
                {notebook.genre}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {notebook.coverUrl && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/40 text-white border border-white/20 flex items-center gap-1" title="Capa do livro">
                <BookOpen className="w-3 h-3 text-[#A7F3D0]" />
              </span>
            )}
            {notebook.notionLastSyncedAt && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/40 text-white border border-white/20 flex items-center gap-1" title="Sincronizado com o Notion">
                <Share2 className="w-3 h-3 text-[#BEE3F8]" />
              </span>
            )}
            {notebook.historicalContext && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/40 text-white border border-white/20 flex items-center gap-1" title="Contexto histórico do autor">
                <Sparkles className="w-3 h-3 text-[#F9E8B2]" />
              </span>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notebook.id, e);
                }}
                className="p-1 rounded-full bg-black/30 hover:bg-black/60 text-white/80 hover:text-white transition-colors"
                title="Excluir livro"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Book Title & Author on Cover */}
        <div className="pl-3 pr-2 relative z-10">
          <h3 className="font-serif font-bold text-base sm:text-lg text-white line-clamp-2 leading-snug tracking-tight drop-shadow-md">
            {notebook.title}
          </h3>
          <div className="flex items-center justify-between mt-1">
            {notebook.author && (
              <p className="text-xs text-white/95 font-sans line-clamp-1 italic drop-shadow-xs">
                por {notebook.author}
              </p>
            )}
            {notebook.rating && (
              <div className="flex items-center gap-0.5 text-xs text-[#F9E8B2]">
                {'⭐'.repeat(notebook.rating)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Body Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white space-y-3">
        {/* Description or User Review */}
        <p className="text-xs text-[#78716A] line-clamp-2 leading-relaxed font-sans">
          {notebook.userReview ? `“${notebook.userReview}”` : (notebook.description || 'Sem descrição informada.')}
        </p>

        {/* Progress Bar (if exists) */}
        {progress !== null && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-[#78716A]">
              <span>Progresso</span>
              <span className="font-mono font-semibold text-[#2D2A26]">{notebook.currentPage}/{notebook.totalPages} págs ({progress}%)</span>
            </div>
            <div className="w-full bg-[#EAE5DC] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#C86D51] h-full rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Highlight Color Taxonomy Pill Badges */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-[#78716A]">
            <span>Grifos salvos ({notebook.highlights.length})</span>
            <span className="text-[#A8A29E] font-mono text-[10px]">
              {notebook.pageScans.length} páginas
            </span>
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            {uniqueColors.length > 0 ? (
              uniqueColors.map((ck) => {
                const def = getColorDef(ck);
                const count = colorCounts[ck];
                return (
                  <span
                    key={ck}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-[#FAF9F6] border border-[#E6E1D8]"
                    title={`${count} grifos ${ck}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${def.dotClass}`} />
                    <span className="text-[#4A443F] capitalize">{ck}</span>
                    <span className="text-[#78716A] font-mono">({count})</span>
                  </span>
                );
              })
            ) : (
              <span className="text-[11px] text-[#A8A29E] italic">Nenhum grifo adicionado ainda</span>
            )}
          </div>
        </div>

        {/* Card Footer Summary */}
        <div className="pt-3 border-t border-[#E6E1D8] flex items-center justify-between text-xs text-[#78716A]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[#4A443F] font-medium" title="Citações">
              <Layers className="w-3.5 h-3.5 text-[#C86D51]" />
              {notebook.highlights.length}
            </span>
            <span className="flex items-center gap-1 text-[#4A443F] font-medium" title="Flashcards">
              <BrainCircuit className="w-3.5 h-3.5 text-[#6A8E6B]" />
              {notebook.flashcards.length}
            </span>
          </div>

          <span className="flex items-center gap-1 text-[#C86D51] group-hover:translate-x-0.5 transition-transform text-xs font-bold">
            Abrir livro
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};

