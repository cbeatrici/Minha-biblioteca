import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, BookOpen, Quote, Copy, CheckCheck, ChevronRight, Layers, Star, Sparkles } from 'lucide-react';
import { Notebook, HighlightItem } from '../types';
import { HIGHLIGHT_COLORS, getColorDef, getColorMeaning } from '../data/colorPalette';

interface GlobalSearchModalProps {
  notebooks: Notebook[];
  onSelectNotebook: (notebook: Notebook) => void;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  notebooks,
  onSelectNotebook,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Flatten all highlights with their parent notebook metadata
  const allHighlightsWithNotebook = useMemo(() => {
    const list: { highlight: HighlightItem; notebook: Notebook }[] = [];
    notebooks.forEach((nb) => {
      nb.highlights.forEach((hl) => {
        list.push({ highlight: hl, notebook: nb });
      });
    });
    return list;
  }, [notebooks]);

  // Filter highlights
  const searchResults = useMemo(() => {
    return allHighlightsWithNotebook.filter(({ highlight, notebook }) => {
      const matchesColor = selectedColor === 'all' || highlight.colorKey === selectedColor;
      if (!matchesColor) return false;

      if (!query.trim()) return true;

      const q = query.toLowerCase();
      return (
        highlight.text.toLowerCase().includes(q) ||
        highlight.topic.toLowerCase().includes(q) ||
        (highlight.userNote && highlight.userNote.toLowerCase().includes(q)) ||
        notebook.title.toLowerCase().includes(q) ||
        (notebook.author && notebook.author.toLowerCase().includes(q))
      );
    });
  }, [allHighlightsWithNotebook, query, selectedColor]);

  // Copy Quote Helper
  const handleCopyQuote = (highlight: HighlightItem, notebook: Notebook, e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `"${highlight.text}"\n— ${notebook.title}${notebook.author ? ` by ${notebook.author}` : ''}${highlight.pageNumber ? ` (p. ${highlight.pageNumber})` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(highlight.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-[#E6E1D8] rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Search Bar Input */}
        <div className="p-4 sm:p-5 border-b border-[#E6E1D8] bg-[#FAF9F6] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#C86D51] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search quotes, topics, notes, or authors across all notebooks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm sm:text-base text-[#2D2A26] placeholder-[#A8A29E] focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#78716A] hover:text-[#2D2A26] hover:bg-[#F4F1EA]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Color Filters */}
        <div className="px-5 py-3 border-b border-[#E6E1D8] bg-[#FAF9F6] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedColor('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedColor === 'all'
                ? 'bg-[#C86D51] text-white font-bold'
                : 'bg-white text-[#78716A] hover:text-[#2D2A26] border border-[#E6E1D8]'
            }`}
          >
            All Colors ({allHighlightsWithNotebook.length})
          </button>

          {HIGHLIGHT_COLORS.map((color) => {
            const count = allHighlightsWithNotebook.filter((item) => item.highlight.colorKey === color.key).length;
            const isSelected = selectedColor === color.key;

            return (
              <button
                key={color.key}
                onClick={() => setSelectedColor(isSelected ? 'all' : color.key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border whitespace-nowrap transition-all ${
                  isSelected
                    ? `${color.bgClass} text-white font-bold shadow-xs`
                    : `${color.lightBgClass} ${color.borderClass} ${color.textClass}`
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${color.dotClass}`} />
                <span className="capitalize">{color.key}</span>
                <span className="font-mono text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Results List */}
        <div className="p-5 space-y-3.5 max-h-[60vh] overflow-y-auto">
          {searchResults.length > 0 ? (
            searchResults.map(({ highlight, notebook }) => {
              const colorDef = getColorDef(highlight.colorKey);
              const isCopied = copiedId === highlight.id;

              return (
                <div
                  key={highlight.id}
                  onClick={() => {
                    onSelectNotebook(notebook);
                    onClose();
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] shadow-xs ${
                    colorDef.lightBgClass
                  } ${colorDef.borderClass} space-y-2 group`}
                >
                  {/* Result Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-[#A85138] group-hover:underline flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-[#C86D51]" />
                        {notebook.title}
                      </span>
                      {notebook.author && (
                        <span className="text-[11px] text-[#78716A] font-sans italic">
                          by {notebook.author}
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${colorDef.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${colorDef.dotClass}`} />
                        <span className="capitalize">{highlight.colorKey}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleCopyQuote(highlight, notebook, e)}
                        className="p-1.5 rounded-lg bg-white/80 hover:bg-[#F4F1EA] text-[#4A443F] border border-[#E6E1D8] transition-colors"
                        title="Copy Quote"
                      >
                        {isCopied ? (
                          <CheckCheck className="w-3.5 h-3.5 text-[#4D6F4E]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <span className="p-1 text-[#78716A] group-hover:text-[#C86D51]">
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* Quote Text */}
                  <p className="text-xs sm:text-sm font-serif text-[#2D2A26] leading-relaxed italic pl-2 border-l-2 border-[#C86D51]/50">
                    "{highlight.text}"
                  </p>

                  {/* Note / Citation */}
                  <div className="flex items-center justify-between text-[11px] text-[#78716A] pt-1 border-t border-[#E6E1D8]/60">
                    {highlight.userNote ? (
                      <span className="truncate max-w-md">
                        <strong className="text-[#A85138]">Note:</strong> {highlight.userNote}
                      </span>
                    ) : (
                      <span className="text-[#78716A] font-mono">Topic: {highlight.topic}</span>
                    )}

                    {highlight.pageNumber && (
                      <span className="font-mono text-[#78716A]">Page {highlight.pageNumber}</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-[#78716A] space-y-2">
              <Search className="w-8 h-8 mx-auto text-[#A8A29E]" />
              <p className="text-sm font-medium text-[#2D2A26]">No quotes or notes found</p>
              <p className="text-xs text-[#78716A]">
                Try searching for different keywords or clear the color filter.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E6E1D8] bg-[#FAF9F6] flex items-center justify-between text-xs text-[#78716A]">
          <span>Found {searchResults.length} matching highlights</span>
          <span className="font-mono text-[11px]">Click result to jump into notebook</span>
        </div>
      </div>
    </div>
  );
};
