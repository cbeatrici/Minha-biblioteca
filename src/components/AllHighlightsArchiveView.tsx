import React, { useState } from 'react';
import { Layers, Search, Volume2, VolumeX, Star, Copy, CheckCheck, BookOpen, ChevronRight } from 'lucide-react';
import { Notebook, HighlightItem } from '../types';
import { HIGHLIGHT_COLORS, getColorDef, getColorMeaning } from '../data/colorPalette';
import { speakText, stopSpeaking } from '../utils/speech';
import { useLanguage } from '../utils/i18n';

interface AllHighlightsArchiveViewProps {
  notebooks: Notebook[];
  onSelectNotebook: (notebook: Notebook) => void;
  onOpenScanModalForNotebook?: (notebook: Notebook) => void;
}

export const AllHighlightsArchiveView: React.FC<AllHighlightsArchiveViewProps> = ({
  notebooks,
  onSelectNotebook,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedNotebookId, setSelectedNotebookId] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Flatten all highlights
  const allItems: { highlight: HighlightItem; notebook: Notebook }[] = [];
  notebooks.forEach((nb) => {
    nb.highlights.forEach((hl) => {
      allItems.push({ highlight: hl, notebook: nb });
    });
  });

  // Filter
  const filteredItems = allItems.filter(({ highlight, notebook }) => {
    const matchesColor = selectedColor === 'all' || highlight.colorKey === selectedColor;
    const matchesNotebook = selectedNotebookId === 'all' || notebook.id === selectedNotebookId;
    const matchesFav = !onlyFavorites || highlight.isFavorite;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      highlight.text.toLowerCase().includes(q) ||
      highlight.topic.toLowerCase().includes(q) ||
      (highlight.userNote && highlight.userNote.toLowerCase().includes(q)) ||
      notebook.title.toLowerCase().includes(q) ||
      (notebook.author && notebook.author.toLowerCase().includes(q));

    return matchesColor && matchesNotebook && matchesFav && matchesSearch;
  });

  const handleToggleSpeak = (highlight: HighlightItem) => {
    if (speakingId === highlight.id) {
      stopSpeaking();
      setSpeakingId(null);
    } else {
      setSpeakingId(highlight.id);
      speakText(`Citação: ${highlight.text}. ${highlight.userNote ? `Nota: ${highlight.userNote}` : ''}`, () => {
        setSpeakingId(null);
      });
    }
  };

  const handleCopyQuote = (highlight: HighlightItem, notebook: Notebook) => {
    const textToCopy = `"${highlight.text}"\n— ${notebook.title}${notebook.author ? ` por ${notebook.author}` : ''}${highlight.pageNumber ? ` (pág. ${highlight.pageNumber})` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(highlight.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 text-[#4A443F]">
      {/* Top Banner */}
      <div className="bg-[#F4F1EA] border border-[#E6E1D8] rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C86D51]/15 border border-[#C86D51]/30 text-[#A85138] text-xs font-semibold">
              <Layers className="w-3.5 h-3.5" />
              <span>Arquivo geral de citações e grifos</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2D2A26] tracking-tight">
              Todos os grifos da biblioteca ({allItems.length})
            </h2>
            <p className="text-xs text-[#78716A] font-sans max-w-xl">
              Consulte e filtre todas as passagens extraídas em todos os seus livros. Filtre por cor, obra ou citações marcadas como favoritas.
            </p>
          </div>
        </div>
      </div>

      {/* Control Strip */}
      <div className="bg-white border border-[#E6E1D8] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#78716A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar em todas as citações, tópicos e anotações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F6] border border-[#DCD6CA] rounded-xl text-[#2D2A26] placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#C86D51]"
            />
          </div>

          {/* Notebook Filter Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedNotebookId}
              onChange={(e) => setSelectedNotebookId(e.target.value)}
              className="text-xs bg-[#FAF9F6] border border-[#DCD6CA] rounded-xl px-3 py-2 text-[#2D2A26]"
            >
              <option value="all">Todos os livros ({notebooks.length})</option>
              {notebooks.map((nb) => (
                <option key={nb.id} value={nb.id}>
                  {nb.title} ({nb.highlights.length})
                </option>
              ))}
            </select>

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
          </div>
        </div>

        {/* Color Palette Taxonomy Strip */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#E6E1D8]">
          <button
            onClick={() => setSelectedColor('all')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
              selectedColor === 'all'
                ? 'bg-[#2D2A26] text-white font-bold'
                : 'bg-[#FAF9F6] text-[#78716A] hover:text-[#2D2A26] border border-[#DCD6CA]'
            }`}
          >
            Todas as cores ({allItems.length})
          </button>

          {HIGHLIGHT_COLORS.map((color) => {
            const count = allItems.filter((i) => i.highlight.colorKey === color.key).length;
            const isSelected = selectedColor === color.key;

            return (
              <button
                key={color.key}
                onClick={() => setSelectedColor(isSelected ? 'all' : color.key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-all ${
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
      </div>

      {/* Highlights Feed */}
      {filteredItems.length > 0 ? (
        <div className="space-y-4">
          {filteredItems.map(({ highlight, notebook }) => {
            const colorDef = getColorDef(highlight.colorKey);
            const isSpeaking = speakingId === highlight.id;
            const isCopied = copiedId === highlight.id;
            const meaning = getColorMeaning(highlight.colorKey, notebook.customColorMeanings);

            return (
              <div
                key={highlight.id}
                className={`p-5 rounded-2xl border transition-all shadow-xs ${
                  colorDef.lightBgClass
                } ${colorDef.borderClass} space-y-3`}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Parent Notebook link */}
                    <button
                      onClick={() => onSelectNotebook(notebook)}
                      className="text-xs font-serif font-bold text-[#C86D51] hover:underline flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#C86D51]" />
                      {notebook.title}
                    </button>

                    {notebook.author && (
                      <span className="text-[11px] text-[#78716A] font-sans italic">
                        por {notebook.author}
                      </span>
                    )}

                    {/* Color Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${colorDef.badgeClass}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${colorDef.dotClass}`} />
                      <span className="capitalize">{highlight.colorKey}</span>
                      <span className="opacity-70 font-normal">({meaning})</span>
                    </span>

                    {/* Topic */}
                    {highlight.topic && (
                      <span className="px-2 py-0.5 rounded bg-white/70 text-[#4A443F] text-[10px] font-medium border border-[#E6E1D8]">
                        {highlight.topic}
                      </span>
                    )}

                    {highlight.pageNumber && (
                      <span className="text-[11px] text-[#78716A] font-mono">
                        pág. {highlight.pageNumber}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleSpeak(highlight)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isSpeaking
                          ? 'bg-[#C86D51] text-white border-[#C86D51]'
                          : 'bg-white hover:bg-[#F4F1EA] text-[#78716A] hover:text-[#2D2A26] border-[#E6E1D8]'
                      }`}
                      title={isSpeaking ? 'Parar leitura' : 'Ouvir leitura em voz alta'}
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleCopyQuote(highlight, notebook)}
                      className="p-1.5 rounded-lg bg-white hover:bg-[#F4F1EA] text-[#78716A] hover:text-[#2D2A26] border border-[#E6E1D8] transition-colors"
                      title="Copiar citação com referência"
                    >
                      {isCopied ? <CheckCheck className="w-3.5 h-3.5 text-[#6A8E6B]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => onSelectNotebook(notebook)}
                      className="p-1.5 rounded-lg bg-white hover:bg-[#F4F1EA] text-[#C86D51] border border-[#E6E1D8] transition-colors text-xs font-semibold flex items-center gap-1"
                      title="Abrir no livro"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Highlight Quote */}
                <blockquote className="font-serif text-sm sm:text-base text-[#2D2A26] leading-relaxed pl-3 border-l-2 border-[#DCD6CA] italic">
                  "{highlight.text}"
                </blockquote>

                {/* Note */}
                {highlight.userNote && (
                  <div className="pt-2 border-t border-[#E6E1D8]/60 text-xs text-[#4A443F]">
                    <strong className="text-[#A85138] mr-1.5">Nota:</strong>
                    {highlight.userNote}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-[#E6E1D8] rounded-3xl p-8 space-y-4 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#C86D51]/10 border border-[#C86D51]/20 flex items-center justify-center text-[#C86D51]">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-serif font-bold text-[#2D2A26]">Nenhum grifo encontrado</h3>
          <p className="text-xs text-[#78716A] max-w-sm mx-auto">
            Tente mudar a busca, selecionar outra cor ou abrir um livro para escanear páginas físicas.
          </p>
        </div>
      )}
    </div>
  );
};
