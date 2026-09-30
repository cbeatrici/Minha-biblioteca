import React, { useState } from 'react';
import { X, BookOpen, Sparkles, Check, RefreshCw, AlertCircle, CheckCircle2, Image as ImageIcon, Upload, Globe, Search, Loader2, Calendar, Clock, Bookmark } from 'lucide-react';
import { Notebook, NotebookType, ReadingStatus, HistoricalContextData } from '../types';
import { COVER_THEMES, HIGHLIGHT_COLORS } from '../data/colorPalette';
import { GenrePicker } from './GenrePicker';

interface NewNotebookModalProps {
  onSave: (notebook: Notebook) => void;
  onClose: () => void;
}

export const NewNotebookModal: React.FC<NewNotebookModalProps> = ({ onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [type, setType] = useState<NotebookType>('book');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [readYear, setReadYear] = useState<string>('2026');
  const [readingStatus, setReadingStatus] = useState<ReadingStatus>('reading');
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined);
  const [coverTheme, setCoverTheme] = useState('terracotta');
  const [coverUrl, setCoverUrl] = useState<string>('');
  const [historicalContext, setHistoricalContext] = useState<HistoricalContextData | undefined>(undefined);

  // Cover search & upload state
  const [isSearchingCover, setIsSearchingCover] = useState(false);
  const [coverSearchResults, setCoverSearchResults] = useState<Array<{ title: string; coverUrl: string; source: string; author?: string }>>([]);
  const [showCoverSearch, setShowCoverSearch] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  // AI Auto-enrichment state
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichStatus, setEnrichStatus] = useState<string | null>(null);

  // Custom Color Meanings
  const defaultMeanings: Record<string, string> = {};
  HIGHLIGHT_COLORS.forEach((c) => {
    defaultMeanings[c.key] = c.defaultMeaning;
  });
  const [customColorMeanings, setCustomColorMeanings] = useState<Record<string, string>>(defaultMeanings);

  // Search covers on the internet
  const handleSearchCover = async () => {
    if (!title.trim()) {
      setCoverError('Digite o título da obra para buscar a capa na internet.');
      return;
    }

    setIsSearchingCover(true);
    setCoverError(null);
    setShowCoverSearch(true);

    try {
      const q = encodeURIComponent(title.trim());
      const authParam = author.trim() ? `&author=${encodeURIComponent(author.trim())}` : '';
      const res = await fetch(`/api/search-book-cover?title=${q}${authParam}`);
      const data = await res.json();

      if (res.ok && data.covers && data.covers.length > 0) {
        setCoverSearchResults(data.covers);
        // Automatically select the first best cover
        if (!coverUrl) {
          setCoverUrl(data.covers[0].coverUrl);
        }
      } else {
        setCoverError('Nenhuma capa encontrada na internet. Você pode fazer upload de uma foto da capa.');
      }
    } catch (err: any) {
      setCoverError('Erro ao buscar capa na internet.');
    } finally {
      setIsSearchingCover(false);
    }
  };

  // Upload custom cover file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCoverError('Por favor, selecione um arquivo de imagem (JPEG, PNG ou WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCoverUrl(reader.result);
        setCoverError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Auto-enrich book details using Gemini
  const handleAutoEnrich = async () => {
    if (!title.trim()) {
      setEnrichStatus('Digite pelo menos o título do livro para a IA pesquisar.');
      return;
    }

    setIsEnriching(true);
    setEnrichStatus(null);

    try {
      const res = await fetch('/api/auto-enrich-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success && json.data) {
        const data = json.data;

        if (data.canonicalTitle) setTitle(data.canonicalTitle);
        if (data.author) setAuthor(data.author);
        if (data.description) setDescription(data.description);
        if (data.genre) setGenre(data.genre);
        if (data.estimatedPages) setTotalPages(data.estimatedPages);
        if (data.coverThemeSuggestion) setCoverTheme(data.coverThemeSuggestion);

        // Populate historical context object
        if (data.authorBio || data.coreThesis) {
          setHistoricalContext({
            authorBio: data.authorBio || '',
            authorEra: data.authorEra || '',
            historicalEra: data.historicalEra || '',
            coreThesis: data.coreThesis || '',
            culturalImpact: data.culturalImpact || '',
            themes: data.themes || [],
            studyGuideTips: data.studyGuideTips || [],
            reflectionQuestions: data.reflectionQuestions || [],
            generatedAt: new Date().toISOString(),
          });
        }

        // Apply suggested color meanings if present
        if (data.suggestedColorMeanings) {
          setCustomColorMeanings((prev) => ({
            ...prev,
            ...data.suggestedColorMeanings,
          }));
        }

        setEnrichStatus('✨ Dados do livro, autor e contexto histórico preenchidos com sucesso!');

        // Also attempt to fetch cover if not yet set
        if (!coverUrl) {
          handleSearchCover();
        }
      } else {
        setEnrichStatus(json.error || 'Não foi possível buscar os dados do livro com a IA.');
      }
    } catch (err: any) {
      setEnrichStatus(err?.message || 'Erro ao consultar a IA.');
    } finally {
      setIsEnriching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newNotebook: Notebook = {
      id: `nb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      author: author.trim() || undefined,
      type,
      description: description.trim() || `Caderno de estudos para ${title.trim()}`,
      genre: genre.trim() || undefined,
      totalPages: totalPages || undefined,
      currentPage: readingStatus === 'completed' && totalPages ? totalPages : 0,
      readingStatus,
      readYear: readYear ? parseInt(readYear, 10) || readYear : '2026',
      finishDate: readingStatus === 'completed' ? `${readYear || '2026'}-01-01` : undefined,
      coverTheme,
      coverUrl: coverUrl.trim() || undefined,
      historicalContext,
      chapterTopicSummaries: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customColorMeanings,
      pageScans: [],
      highlights: [],
      flashcards: [],
    };

    onSave(newNotebook);
    onClose();
  };

  const selectedTheme = COVER_THEMES.find(t => t.key === coverTheme) || COVER_THEMES[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-[#E6E1D8] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col text-[#4A443F] max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E6E1D8] flex items-center justify-between bg-[#FAF9F6]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#C86D51]/10 rounded-lg border border-[#C86D51]/20 text-[#C86D51]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#2D2A26]">
                Cadastrar novo livro ou projeto de estudo
              </h2>
              <p className="text-xs text-[#78716A]">
                Organize grifos físicos, capas reais, contexto e sincronize entre celular e computador
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-[#78716A] hover:text-[#2D2A26]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Title & AI Autocomplete Button */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#2D2A26]">
                Título do livro ou obra *
              </label>
              <button
                type="button"
                onClick={handleAutoEnrich}
                disabled={isEnriching || !title.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C86D51]/10 hover:bg-[#C86D51]/20 text-[#C86D51] border border-[#C86D51]/30 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                title="Buscar automaticamente autor, sinopse, tese e contexto histórico com IA"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isEnriching ? 'animate-spin' : ''}`} />
                <span>{isEnriching ? 'Buscando dados...' : 'Preencher com IA ✨'}</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Rápido e Devagar, Sapiens, Meditações, Hábitos Atômicos..."
                className="w-full text-xs bg-[#FAF9F6] border border-[#DCD6CA] rounded-xl p-3 text-[#2D2A26] focus:ring-1 focus:ring-[#C86D51]"
              />
            </div>

            {enrichStatus && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  enrichStatus.includes('✨')
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium'
                    : 'bg-amber-50 border border-amber-200 text-amber-800'
                }`}
              >
                {enrichStatus.includes('✨') ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                )}
                <span>{enrichStatus}</span>
              </div>
            )}
          </div>

          {/* Author & Pages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#2D2A26] mb-1">
                Autor(a) ou pensador(a)
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Ex: Daniel Kahneman, Machado de Assis..."
                className="w-full text-xs bg-[#FAF9F6] border border-[#DCD6CA] rounded-xl p-3 text-[#2D2A26] focus:ring-1 focus:ring-[#C86D51]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D2A26] mb-1">
                Número total de páginas
              </label>
              <input
                type="number"
                value={totalPages || ''}
                onChange={(e) => setTotalPages(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                placeholder="Ex: 512"
                className="w-full text-xs bg-[#FAF9F6] border border-[#DCD6CA] rounded-xl p-3 text-[#2D2A26] focus:ring-1 focus:ring-[#C86D51]"
              />
            </div>
          </div>

          {/* Literary Genre Selection with Presets (Romance, Suspense, etc.) + Custom Addition */}
          <div className="p-3.5 bg-[#FAF9F6] border border-[#E6E1D8] rounded-2xl space-y-2">
            <label className="block text-xs font-semibold text-[#2D2A26]">
              Gênero literário ou categoria
            </label>
            <GenrePicker
              value={genre}
              onChange={setGenre}
            />
          </div>

          {/* Reading Status & Reading Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#FAF9F6] border border-[#E6E1D8] rounded-2xl">
            <div>
              <label className="block text-xs font-semibold text-[#2D2A26] mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C86D51]" />
                <span>Status de leitura</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'reading' as ReadingStatus, label: 'Lendo', icon: Clock },
                  { id: 'completed' as ReadingStatus, label: 'Lido', icon: CheckCircle2 },
                  { id: 'want_to_read' as ReadingStatus, label: 'Quero ler', icon: Bookmark },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setReadingStatus(s.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1 transition-all ${
                      readingStatus === s.id
                        ? 'bg-white border-[#C86D51] text-[#C86D51] font-bold shadow-2xs'
                        : 'bg-white/60 border-[#E6E1D8] text-[#78716A] hover:bg-white'
                    }`}
                  >
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D2A26] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C86D51]" />
                <span>Ano de leitura</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={readYear}
                  onChange={(e) => setReadYear(e.target.value)}
                  placeholder="2026"
                  className="w-24 text-xs font-mono bg-white border border-[#DCD6CA] rounded-xl p-2 text-[#2D2A26] focus:ring-1 focus:ring-[#C86D51]"
                />
                <div className="flex items-center gap-1">
                  {['2026', '2025', '2024'].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setReadYear(yr)}
                      className={`text-[11px] px-2.5 py-1.5 rounded-lg border font-mono transition-colors ${
                        readYear === yr
                          ? 'bg-[#C86D51] text-white border-[#C86D51] font-bold'
                          : 'bg-white border-[#E6E1D8] text-[#78716A] hover:text-[#2D2A26]'
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Book Cover Section: Internet Search & Upload */}
          <div className="p-4 bg-[#FAF9F6] border border-[#E6E1D8] rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-[#2D2A26]">
                  Capa do livro (internet ou foto real)
                </label>
                <p className="text-[11px] text-[#78716A]">
                  Puxe a capa oficial pela web ou faça upload da foto do seu livro
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSearchCover}
                  disabled={isSearchingCover || !title.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F4F1EA] text-[#2D2A26] border border-[#DCD6CA] rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                  title="Buscar capas no Google Books e OpenLibrary"
                >
                  {isSearchingCover ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C86D51]" />
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-[#5C7D8A]" />
                  )}
                  <span>Buscar na web</span>
                </button>

                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F4F1EA] text-[#2D2A26] border border-[#DCD6CA] rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-[#6A8E6B]" />
                  <span>Enviar foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Cover Error / Feedback */}
            {coverError && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                {coverError}
              </p>
            )}

            {/* Cover Preview & Custom Link */}
            <div className="flex items-center gap-4 pt-1">
              <div className="w-16 h-22 rounded-lg bg-[#EAE5DC] border border-[#DCD6CA] flex items-center justify-center overflow-hidden shrink-0 shadow-xs relative">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt="Capa do livro"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${selectedTheme.bg} flex items-center justify-center text-white p-1 text-center`}>
                    <BookOpen className="w-6 h-6 opacity-60" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="Ou cole a URL direta da imagem da capa..."
                  className="w-full text-xs bg-white border border-[#DCD6CA] rounded-xl p-2.5 text-[#2D2A26] focus:ring-1 focus:ring-[#C86D51]"
                />
                {coverUrl && (
                  <button
                    type="button"
                    onClick={() => setCoverUrl('')}
                    className="text-[11px] text-red-600 hover:underline"
                  >
                    Remover capa (usar padrão com cor)
                  </button>
                )}
              </div>
            </div>

            {/* Candidate Cover Images from Web Search */}
            {showCoverSearch && coverSearchResults.length > 0 && (
              <div className="pt-2 border-t border-[#E6E1D8]">
                <span className="text-[11px] font-semibold text-[#78716A] block mb-2">
                  Escolha uma das capas encontradas na web:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {coverSearchResults.map((res, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setCoverUrl(res.coverUrl)}
                      className={`relative w-16 h-22 rounded-lg border-2 overflow-hidden shrink-0 transition-transform ${
                        coverUrl === res.coverUrl ? 'border-[#C86D51] scale-105 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                      title={`${res.title} (${res.source})`}
                    >
                      <img
                        src={res.coverUrl}
                        alt={res.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {coverUrl === res.coverUrl && (
                        <div className="absolute inset-0 bg-[#C86D51]/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Project Type */}
          <div>
            <label className="block text-xs font-semibold text-[#2D2A26] mb-1.5">
              Tipo de obra
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'book', label: '📖 Livro ou não ficção' },
                { id: 'study', label: '🎓 Estudo acadêmico' },
                { id: 'paper', label: '📑 Artigo ou ensaio' },
                { id: 'research', label: '🔬 Filosofia ou tópico' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setType(item.id as NotebookType)}
                  className={`p-2.5 rounded-xl text-xs font-medium border transition-all ${
                    type === item.id
                      ? 'bg-[#C86D51] text-white font-bold border-[#C86D51] shadow-xs'
                      : 'bg-[#FAF9F6] text-[#4A443F] border-[#E6E1D8] hover:bg-[#F4F1EA]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description / Synopsis */}
          <div>
            <label className="block text-xs font-semibold text-[#2D2A26] mb-1">
              Visão geral e sinopse da obra
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva as premissas principais ou objetivos de leitura..."
              className="w-full text-xs bg-[#FAF9F6] border border-[#DCD6CA] rounded-xl p-3 text-[#2D2A26] focus:ring-1 focus:ring-[#C86D51] leading-relaxed"
            />
          </div>

          {/* Historical Context Mini-Card if fetched by AI */}
          {historicalContext && (
            <div className="p-4 bg-[#FAF9F6] border border-[#5C7D8A]/30 rounded-2xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#5C7D8A] font-mono">
                  🏛️ Contexto e tese pré-carregados pela IA:
                </span>
              </div>
              <p className="text-xs text-[#2D2A26] leading-relaxed">
                <strong>Tese central:</strong> {historicalContext.coreThesis}
              </p>
              {historicalContext.themes?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {historicalContext.themes.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white text-[#4A443F] text-[11px] border border-[#DCD6CA]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cover Style / Spine Palette */}
          <div>
            <label className="block text-xs font-semibold text-[#2D2A26] mb-1.5">
              Cor de lombada e tema (usado sem foto ou de acabamento)
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {COVER_THEMES.map((c) => (
                <button
                  type="button"
                  key={c.key}
                  onClick={() => setCoverTheme(c.key)}
                  className={`h-12 rounded-xl bg-gradient-to-br ${c.bg} border relative flex items-center justify-center transition-transform ${
                    coverTheme === c.key ? 'ring-2 ring-[#C86D51] scale-105 border-white' : 'border-[#DCD6CA] hover:opacity-90'
                  }`}
                  title={c.name}
                >
                  {coverTheme === c.key && (
                    <Check className="w-4 h-4 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Highlight Meanings */}
          <div className="pt-2 border-t border-[#E6E1D8] space-y-2">
            <label className="block text-xs font-semibold text-[#2D2A26]">
              Significado das cores de grifo para esta obra (opcional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {HIGHLIGHT_COLORS.map((c) => (
                <div key={c.key} className="flex items-center gap-2 bg-[#FAF9F6] p-2 rounded-xl border border-[#E6E1D8]">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.hex }} />
                  <span className="capitalize font-bold text-[#2D2A26] text-[11px] w-14">{c.key}:</span>
                  <input
                    type="text"
                    value={customColorMeanings[c.key] || c.defaultMeaning}
                    onChange={(e) =>
                      setCustomColorMeanings((prev) => ({
                        ...prev,
                        [c.key]: e.target.value,
                      }))
                    }
                    className="flex-1 text-[11px] bg-transparent border-0 text-[#4A443F] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[#E6E1D8]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#78716A] hover:text-[#2D2A26]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#C86D51] hover:bg-[#B35C42] text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95"
            >
              Criar livro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

