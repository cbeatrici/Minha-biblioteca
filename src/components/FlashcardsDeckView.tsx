import React, { useState } from 'react';
import { BrainCircuit, Sparkles, Play, Plus, RefreshCw, Layers, CheckCircle2, RotateCcw, Trash2, Edit3, Filter, HelpCircle } from 'lucide-react';
import { Flashcard, Notebook, HighlightItem } from '../types';
import { HIGHLIGHT_COLORS, getColorDef, getColorMeaning } from '../data/colorPalette';

interface FlashcardsDeckViewProps {
  notebook: Notebook;
  onUpdateFlashcards: (flashcards: Flashcard[]) => void;
  onStartStudy: (cards: Flashcard[]) => void;
}

export const FlashcardsDeckView: React.FC<FlashcardsDeckViewProps> = ({
  notebook,
  onUpdateFlashcards,
  onStartStudy,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showGeneratePanel, setShowGeneratePanel] = useState(false);

  // Generator Options
  const [selectedColorForGen, setSelectedColorForGen] = useState<string>('all');
  const [customTopicForGen, setCustomTopicForGen] = useState<string>('');
  const [cardCountForGen, setCardCountForGen] = useState<number>(5);

  // Manual Add State
  const [isAddingManual, setIsAddingManual] = useState(false);
  const [manualQuestion, setManualQuestion] = useState('');
  const [manualAnswer, setManualAnswer] = useState('');
  const [manualQuote, setManualQuote] = useState('');
  const [manualTopic, setManualTopic] = useState('');
  const [manualColorKey, setManualColorKey] = useState('yellow');

  // Filter state in list
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('all');
  const [revealedCardIds, setRevealedCardIds] = useState<Set<string>>(new Set());

  // Review Status Calculation
  const now = new Date();
  const dueCards = notebook.flashcards.filter((c) => new Date(c.nextReviewDate) <= now);
  const masteredCards = notebook.flashcards.filter((c) => c.status === 'mastered');
  const learningCards = notebook.flashcards.filter((c) => c.status === 'learning' || c.status === 'new');

  // Toggle card flip reveal in list
  const toggleReveal = (id: string) => {
    setRevealedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // AI Flashcard Generation
  const handleGenerateAiFlashcards = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      // Filter source highlights based on user selection
      let sourceHighlights = notebook.highlights;
      if (selectedColorForGen !== 'all') {
        sourceHighlights = sourceHighlights.filter((h) => h.colorKey === selectedColorForGen);
      }

      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notebookTitle: notebook.title,
          author: notebook.author,
          highlights: sourceHighlights,
          colorFilter: selectedColorForGen !== 'all' ? selectedColorForGen : undefined,
          customTopic: customTopicForGen.trim() || undefined,
          count: cardCountForGen,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate flashcards');
      }

      const generated: Flashcard[] = (data.flashcards || []).map((card: any, idx: number) => ({
        id: `fc-${Date.now()}-${idx}`,
        notebookId: notebook.id,
        question: card.question,
        answer: card.answer,
        quoteContext: card.quoteContext,
        colorKey: card.colorKey?.toLowerCase() || 'yellow',
        topic: card.topic || 'General',
        difficulty: card.difficulty || 'medium',
        level: 0,
        intervalDays: 1,
        nextReviewDate: new Date().toISOString(),
        reviewCount: 0,
        easeFactor: 2.5,
        status: 'new',
      }));

      onUpdateFlashcards([...generated, ...notebook.flashcards]);
      setShowGeneratePanel(false);
    } catch (err: any) {
      console.error('Error generating flashcards:', err);
      setGenerationError(err.message || 'Failed to generate flashcards. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Submit Manual Card
  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuestion.trim() || !manualAnswer.trim()) return;

    const newCard: Flashcard = {
      id: `fc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      notebookId: notebook.id,
      question: manualQuestion.trim(),
      answer: manualAnswer.trim(),
      quoteContext: manualQuote.trim() || undefined,
      topic: manualTopic.trim() || 'General',
      colorKey: manualColorKey,
      level: 0,
      intervalDays: 1,
      nextReviewDate: new Date().toISOString(),
      reviewCount: 0,
      easeFactor: 2.5,
      status: 'new',
    };

    onUpdateFlashcards([newCard, ...notebook.flashcards]);
    setIsAddingManual(false);
    setManualQuestion('');
    setManualAnswer('');
    setManualQuote('');
    setManualTopic('');
  };

  // Delete Card
  const handleDeleteCard = (id: string) => {
    onUpdateFlashcards(notebook.flashcards.filter((c) => c.id !== id));
  };

  // Filtered Cards
  const filteredCards = notebook.flashcards.filter((c) => {
    if (selectedTopicFilter === 'all') return true;
    return c.topic === selectedTopicFilter || c.colorKey === selectedTopicFilter;
  });

  return (
    <div className="space-y-6 text-[#4A443F]">
      {/* Deck Hero & Spaced Repetition Stats */}
      <div className="bg-[#F4F1EA] border border-[#E6E1D8] rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8F7285]/15 border border-[#8F7285]/30 text-[#8F7285] text-xs font-semibold">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Baralho de recordação ativa e repetição espaçada</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2D2A26] tracking-tight">
              Baralho de estudos de "{notebook.title}"
            </h2>
            <p className="text-xs text-[#78716A] font-sans max-w-lg">
              Teste sua retenção de memória usando recordação ativa cognitiva. Os cartões de estudo podem ser gerados automaticamente pela IA a partir dos seus grifos ou criados manualmente.
            </p>
          </div>

          {/* Quick Metrics & Start Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="grid grid-cols-3 gap-3 bg-white p-3 rounded-2xl border border-[#E6E1D8] text-center shadow-xs">
              <div className="px-2">
                <span className="block text-xl font-bold font-mono text-[#C86D51]">
                  {notebook.flashcards.length}
                </span>
                <span className="text-[10px] uppercase text-[#78716A] font-mono">Total</span>
              </div>
              <div className="px-2 border-x border-[#E6E1D8]">
                <span className="block text-xl font-bold font-mono text-[#D9534F]">
                  {dueCards.length}
                </span>
                <span className="text-[10px] uppercase text-[#78716A] font-mono">Para hoje</span>
              </div>
              <div className="px-2">
                <span className="block text-xl font-bold font-mono text-[#6A8E6B]">
                  {masteredCards.length}
                </span>
                <span className="text-[10px] uppercase text-[#78716A] font-mono">Dominados</span>
              </div>
            </div>

            <button
              onClick={() => onStartStudy(notebook.flashcards)}
              disabled={notebook.flashcards.length === 0}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#C86D51] hover:bg-[#B35C42] text-white font-bold rounded-2xl shadow-xs transition-transform active:scale-95 disabled:opacity-50 text-sm whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Iniciar sessão de estudos ({notebook.flashcards.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Strip: AI Generator Toggle & Manual Card Toggle */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowGeneratePanel(!showGeneratePanel);
              setIsAddingManual(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#F4F1EA] text-[#8F7285] border border-[#DCD6CA] rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8F7285]" />
            <span>Gerar cartões com IA</span>
          </button>

          <button
            onClick={() => {
              setIsAddingManual(!isAddingManual);
              setShowGeneratePanel(false);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F4F1EA] text-[#4A443F] border border-[#E6E1D8] rounded-xl text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar cartão manual</span>
          </button>
        </div>

        <span className="text-xs text-[#78716A] font-mono">
          Exibindo {filteredCards.length} de {notebook.flashcards.length} cartões
        </span>
      </div>

      {/* AI Generator Panel */}
      {showGeneratePanel && (
        <div className="bg-white border border-[#8F7285]/30 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold text-[#2D2A26] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8F7285]" />
              Configurações de geração de cartões com IA
            </h3>
            <button
              onClick={() => setShowGeneratePanel(false)}
              className="text-[#78716A] hover:text-[#2D2A26] text-xs"
            >
              Fechar
            </button>
          </div>

          <p className="text-xs text-[#78716A] leading-relaxed">
            Escolha se deseja criar cartões a partir de todos os grifos ou direcionar para temas de alta prioridade com cores específicas.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Color Highlight Filter */}
            <div>
              <label className="block text-xs font-medium text-[#4A443F] mb-1.5">
                Filtrar grifos por cor:
              </label>
              <select
                value={selectedColorForGen}
                onChange={(e) => setSelectedColorForGen(e.target.value)}
                className="w-full text-xs bg-[#FAF9F6] border border-[#DCD6CA] rounded-xl p-2.5 text-[#2D2A26]"
              >
                <option value="all">Todas as cores e conteúdo da obra</option>
                {HIGHLIGHT_COLORS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.key.toUpperCase()} - {getColorMeaning(c.key, notebook.customColorMeanings)}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Topic Focus */}
            <div>
              <label className="block text-xs font-medium text-[#4A443F] mb-1.5">
                Foco em tema ou pergunta específica:
              </label>
              <input
                type="text"
                value={customTopicForGen}
                onChange={(e) => setCustomTopicForGen(e.target.value)}
                placeholder="Ex: Sistema 1 vs Sistema 2, aversão à perda..."
                className="w-full text-xs bg-[#FAF9F6] border border-[#DCD6CA] rounded-xl p-2.5 text-[#2D2A26]"
              />
            </div>

            {/* Number of Cards */}
            <div>
              <label className="block text-xs font-medium text-[#4A443F] mb-1.5">
                Quantidade de cartões:
              </label>
              <select
                value={cardCountForGen}
                onChange={(e) => setCardCountForGen(parseInt(e.target.value, 10))}
                className="w-full text-xs bg-[#FAF9F6] border border-[#DCD6CA] rounded-xl p-2.5 text-[#2D2A26]"
              >
                <option value={4}>4 cartões</option>
                <option value={6}>6 cartões (recomendado)</option>
                <option value={8}>8 cartões</option>
                <option value={12}>12 cartões (completo)</option>
              </select>
            </div>
          </div>

          {generationError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {generationError}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleGenerateAiFlashcards}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#8F7285] hover:bg-[#7D6173] text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sintetizando cartões...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Gerar {cardCountForGen} cartões</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Manual Add Card Panel */}
      {isAddingManual && (
        <form
          onSubmit={handleSubmitManual}
          className="bg-white border border-[#C86D51]/40 rounded-2xl p-5 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-serif font-bold text-[#2D2A26] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#C86D51]" />
              Criar cartão personalizado
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingManual(false)}
              className="text-[#78716A] hover:text-[#2D2A26] text-xs"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#78716A] mb-1">Frente: pergunta ou estímulo *</label>
              <textarea
                required
                rows={3}
                value={manualQuestion}
                onChange={(e) => setManualQuestion(e.target.value)}
                placeholder="Ex: O que é a regra do pico-fim na avaliação da memória?"
                className="w-full text-xs bg-[#FAF9F6] border border-[#DCD6CA] rounded-xl p-3 text-[#2D2A26]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#78716A] mb-1">Verso: resposta ou lição principal *</label>
              <textarea
                required
                rows={3}
                value={manualAnswer}
                onChange={(e) => setManualAnswer(e.target.value)}
                placeholder="Ex: Julgamentos retrospectivos são definidos pelo momento mais intenso e pelo desfecho..."
                className="w-full text-xs bg-[#FAF9F6] border border-[#DCD6CA] rounded-xl p-3 text-[#2D2A26]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-[#78716A] mb-1">Citação original (opcional)</label>
              <input
                type="text"
                value={manualQuote}
                onChange={(e) => setManualQuote(e.target.value)}
                placeholder="Trecho do livro..."
                className="w-full text-xs bg-[#FAF9F6] border border-[#DCD6CA] rounded-lg p-2 text-[#2D2A26]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#78716A] mb-1">Tema</label>
              <input
                type="text"
                value={manualTopic}
                onChange={(e) => setManualTopic(e.target.value)}
                placeholder="Ex: Dois sistemas"
                className="w-full text-xs bg-[#FAF9F6] border border-[#DCD6CA] rounded-lg p-2 text-[#2D2A26]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#78716A] mb-1">Categoria de cor</label>
              <select
                value={manualColorKey}
                onChange={(e) => setManualColorKey(e.target.value)}
                className="w-full text-xs bg-[#FAF9F6] border border-[#DCD6CA] rounded-lg p-2 text-[#2D2A26]"
              >
                {HIGHLIGHT_COLORS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.key.toUpperCase()} - {getColorMeaning(c.key, notebook.customColorMeanings)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#C86D51] hover:bg-[#B35C42] text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Adicionar cartão ao baralho
            </button>
          </div>
        </form>
      )}

      {/* Flashcards List */}
      {filteredCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCards.map((card, idx) => {
            const isRevealed = revealedCardIds.has(card.id);
            const colorDef = getColorDef(card.colorKey || 'yellow');

            const statusLabel =
              card.status === 'mastered'
                ? 'Dominado'
                : card.status === 'learning'
                ? 'Em aprendizado'
                : 'Novo';

            return (
              <div
                key={card.id}
                className="bg-white border border-[#E6E1D8] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-[#78716A] font-bold">
                        #{idx + 1}
                      </span>
                      {card.topic && (
                        <span className="px-2 py-0.5 rounded bg-[#FAF9F6] text-[#4A443F] text-[10px] font-medium border border-[#E6E1D8]">
                          {card.topic}
                        </span>
                      )}
                      {card.colorKey && (
                        <span className={`w-2 h-2 rounded-full ${colorDef.dotClass}`} />
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          card.status === 'mastered'
                            ? 'bg-[#6A8E6B]/15 text-[#6A8E6B] border border-[#6A8E6B]/30'
                            : card.status === 'learning'
                            ? 'bg-[#C28238]/15 text-[#C28238] border border-[#C28238]/30'
                            : 'bg-[#F4F1EA] text-[#78716A]'
                        }`}
                      >
                        {statusLabel}
                      </span>
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="p-1 rounded text-[#A8A29E] hover:text-red-500"
                        title="Excluir cartão"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Question */}
                  <div>
                    <span className="text-[10px] font-mono text-[#C86D51] font-bold block mb-1">
                      Pergunta ou estímulo
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-[#2D2A26] leading-snug">
                      {card.question}
                    </p>
                  </div>

                  {/* Answer / Reveal */}
                  {isRevealed ? (
                    <div className="pt-2 border-t border-[#E6E1D8] space-y-1.5">
                      <span className="text-[10px] font-mono text-[#6A8E6B] font-bold block">
                        Resposta
                      </span>
                      <p className="text-xs sm:text-sm text-[#4A443F] font-sans leading-relaxed">
                        {card.answer}
                      </p>
                      {card.quoteContext && (
                        <p className="text-[11px] text-[#78716A] italic pt-1 border-t border-[#E6E1D8]/60">
                          "{card.quoteContext}"
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>

                <div className="pt-2 border-t border-[#E6E1D8] flex items-center justify-between">
                  <button
                    onClick={() => toggleReveal(card.id)}
                    className="text-xs text-[#C86D51] hover:text-[#A85138] font-medium"
                  >
                    {isRevealed ? 'Ocultar resposta' : 'Ver resposta'}
                  </button>

                  <span className="text-[10px] text-[#A8A29E] font-mono">
                    Revisões: {card.reviewCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-[#E6E1D8] rounded-3xl p-8 space-y-4 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#8F7285]/10 border border-[#8F7285]/20 flex items-center justify-center text-[#8F7285]">
            <BrainCircuit className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-bold text-[#2D2A26]">Nenhum cartão criado ainda</h3>
            <p className="text-xs text-[#78716A] max-w-sm mx-auto">
              Gere automaticamente cartões de estudo a partir dos seus grifos ou crie novos cartões manualmente.
            </p>
          </div>
          <button
            onClick={() => setShowGeneratePanel(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#8F7285] hover:bg-[#7D6173] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Gerar cartões com IA</span>
          </button>
        </div>
      )}
    </div>
  );
};
