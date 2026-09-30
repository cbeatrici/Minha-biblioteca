import React, { useState } from 'react';
import { Landmark, Sparkles, BookOpen, Clock, Lightbulb, Compass, HelpCircle, RefreshCw, CheckCircle, Quote } from 'lucide-react';
import { Notebook, HistoricalContextData } from '../types';

interface HistoricalContextViewProps {
  notebook: Notebook;
  onUpdateContext: (data: HistoricalContextData) => void;
}

export const HistoricalContextView: React.FC<HistoricalContextViewProps> = ({
  notebook,
  onUpdateContext,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const context = notebook.historicalContext;

  const handleGenerateContext = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/historical-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: notebook.title,
          author: notebook.author,
          type: notebook.type,
          description: notebook.description,
          existingHighlights: notebook.highlights.map((h) => h.text),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha ao gerar contexto histórico');
      }

      const generatedData: HistoricalContextData = {
        ...data.data,
        lastUpdated: new Date().toISOString(),
      };

      onUpdateContext(generatedData);
      setSuccessMessage('Contexto histórico e biográfico gerado com sucesso!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Erro ao gerar contexto histórico:', err);
      setErrorMessage(err.message || 'Falha ao gerar contexto. Verifique a conexão com a internet.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-[#4A443F]">
      {/* Top Context Banner */}
      <div className="bg-[#F4F1EA] border border-[#E6E1D8] rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6A8E6B]/15 border border-[#6A8E6B]/30 text-[#4D6F4E] text-xs font-semibold">
              <Landmark className="w-3.5 h-3.5" />
              <span>Contexto literário, biográfico e histórico</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2D2A26] tracking-tight">
              Contexto histórico de "{notebook.title}"
            </h2>
            <p className="text-xs text-[#78716A] font-sans">
              Entenda a época em que o autor viveu, os principais debates da obra e as ideias centrais para aprofundar sua compreensão.
            </p>
          </div>

          <button
            onClick={handleGenerateContext}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C86D51] hover:bg-[#B35C42] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Pesquisando contexto...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{context ? 'Atualizar contexto' : 'Gerar contexto histórico'}</span>
              </>
            )}
          </button>
        </div>

        {/* Status Messages */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mt-4 p-3 bg-[#6A8E6B]/15 border border-[#6A8E6B]/30 text-[#4D6F4E] text-xs rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#6A8E6B]" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* Context Content Cards */}
      {context ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column: Biography, Era, Thesis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Author Biography Card */}
            <div className="bg-white border border-[#E6E1D8] rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-[#C86D51] border-b border-[#E6E1D8] pb-3">
                <BookOpen className="w-4 h-4" />
                <h3 className="font-serif font-bold text-base text-[#2D2A26]">
                  Biografia do autor e trajetória intelectual
                </h3>
              </div>
              {context.authorEra && (
                <div className="inline-block px-2.5 py-0.5 rounded bg-[#FAF9F6] text-[#78716A] text-[11px] font-mono border border-[#E6E1D8]">
                  Época: {context.authorEra}
                </div>
              )}
              <p className="text-xs sm:text-sm text-[#4A443F] font-sans leading-relaxed whitespace-pre-line">
                {context.authorBio}
              </p>
            </div>

            {/* Historical Era Milieu */}
            <div className="bg-white border border-[#E6E1D8] rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-[#5C7D8A] border-b border-[#E6E1D8] pb-3">
                <Clock className="w-4 h-4" />
                <h3 className="font-serif font-bold text-base text-[#2D2A26]">
                  Contexto histórico, cultural e social
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#4A443F] font-sans leading-relaxed">
                {context.historicalEra}
              </p>
            </div>

            {/* Central Thesis */}
            <div className="bg-[#FAF9F6] border border-[#C86D51]/30 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-[#C86D51] border-b border-[#C86D51]/20 pb-3">
                <Lightbulb className="w-4 h-4" />
                <h3 className="font-serif font-bold text-base text-[#2D2A26]">
                  Tese central da obra
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#2D2A26] font-sans leading-relaxed font-medium">
                {context.coreThesis}
              </p>
            </div>

            {/* Cultural Impact */}
            <div className="bg-white border border-[#E6E1D8] rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-[#8F7285] border-b border-[#E6E1D8] pb-3">
                <Quote className="w-4 h-4" />
                <h3 className="font-serif font-bold text-base text-[#2D2A26]">
                  Recepção crítica e legado da obra
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#4A443F] font-sans leading-relaxed">
                {context.culturalImpact}
              </p>
            </div>
          </div>

          {/* Right Sidebar: Themes, Study Tips, Reflection Questions */}
          <div className="space-y-6">
            {/* Key Themes List */}
            {context.themes && context.themes.length > 0 && (
              <div className="bg-white border border-[#E6E1D8] rounded-2xl p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-[#C86D51]">
                  Temas analíticos principais
                </h4>
                <ul className="space-y-2">
                  {context.themes.map((theme, i) => (
                    <li
                      key={i}
                      className="text-xs text-[#2D2A26] bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E6E1D8] flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C86D51] mt-1.5 flex-shrink-0" />
                      <span>{theme}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Study Guide Tips / Reading Lenses */}
            {context.studyGuideTips && context.studyGuideTips.length > 0 && (
              <div className="bg-white border border-[#E6E1D8] rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-1.5 text-[#6A8E6B]">
                  <Compass className="w-4 h-4" />
                  <h4 className="text-xs font-bold">
                    Dicas e lentes de leitura
                  </h4>
                </div>
                <ul className="space-y-2">
                  {context.studyGuideTips.map((tip, i) => (
                    <li
                      key={i}
                      className="text-xs text-[#4A443F] bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E6E1D8] leading-relaxed"
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reflection Questions */}
            {context.reflectionQuestions && context.reflectionQuestions.length > 0 && (
              <div className="bg-white border border-[#E6E1D8] rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-1.5 text-[#5C7D8A]">
                  <HelpCircle className="w-4 h-4" />
                  <h4 className="text-xs font-bold">
                    Perguntas reflexivas
                  </h4>
                </div>
                <ul className="space-y-2">
                  {context.reflectionQuestions.map((q, i) => (
                    <li
                      key={i}
                      className="text-xs text-[#4A443F] italic bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E6E1D8] leading-relaxed"
                    >
                      "{q}"
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-[#E6E1D8] rounded-3xl p-8 space-y-4 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#6A8E6B]/10 border border-[#6A8E6B]/20 flex items-center justify-center text-[#6A8E6B]">
            <Landmark className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-bold text-[#2D2A26]">
              Nenhum contexto histórico gerado ainda
            </h3>
            <p className="text-xs text-[#78716A] max-w-md mx-auto">
              Clique no botão abaixo para pesquisar o histórico do autor, a época histórica da obra, os temas centrais e dicas de estudo para "{notebook.title}".
            </p>
          </div>
          <button
            onClick={handleGenerateContext}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C86D51] hover:bg-[#B35C42] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Gerar contexto histórico e do autor</span>
          </button>
        </div>
      )}
    </div>
  );
};
