import React, { useState } from 'react';
import { Landmark, BookOpen } from 'lucide-react';
import { Notebook } from '../types';
import { HistoricalContextView } from './HistoricalContextView';

interface HistoryExplorerHubViewProps {
  notebooks: Notebook[];
  onSelectNotebook: (notebook: Notebook) => void;
  onUpdateNotebook: (notebook: Notebook) => void;
}

export const HistoryExplorerHubView: React.FC<HistoryExplorerHubViewProps> = ({
  notebooks,
  onUpdateNotebook,
}) => {
  const [activeNotebookId, setActiveNotebookId] = useState<string>(notebooks[0]?.id || '');

  const activeNotebook = notebooks.find((n) => n.id === activeNotebookId) || notebooks[0];

  return (
    <div className="space-y-6 text-[#4A443F]">
      {/* Top Banner */}
      <div className="bg-[#F4F1EA] border border-[#E6E1D8] rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6A8E6B]/15 border border-[#6A8E6B]/30 text-[#4D6F4E] text-xs font-semibold">
            <Landmark className="w-3.5 h-3.5" />
            <span>História intelectual e contexto de época</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2D2A26] tracking-tight">
            Explorador de contexto literário e histórico
          </h2>
          <p className="text-xs text-[#78716A] font-sans leading-relaxed">
            Compreenda o mundo filosófico, político e cultural que moldou cada autor e obra. Enriqueça sua leitura com lentes históricas e questões reflexivas.
          </p>
        </div>
      </div>

      {/* Book Selector Horizontal Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {notebooks.map((nb) => {
          const isSelected = activeNotebook?.id === nb.id;
          const hasContext = !!nb.historicalContext;

          return (
            <button
              key={nb.id}
              onClick={() => setActiveNotebookId(nb.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-medium border whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#C86D51] text-white font-bold border-[#C86D51] shadow-xs'
                  : 'bg-white text-[#4A443F] border-[#E6E1D8] hover:bg-[#FAF9F6]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{nb.title}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isSelected
                    ? 'bg-white/20 text-white font-extrabold'
                    : hasContext
                    ? 'bg-[#6A8E6B]/15 text-[#4D6F4E] border border-[#6A8E6B]/30'
                    : 'bg-[#FAF9F6] text-[#78716A] border border-[#E6E1D8]'
                }`}
              >
                {hasContext ? 'Analisado' : 'Sem análise'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Context Detail View */}
      {activeNotebook && (
        <HistoricalContextView
          notebook={activeNotebook}
          onUpdateContext={(newContext) => {
            onUpdateNotebook({
              ...activeNotebook,
              historicalContext: newContext,
              updatedAt: new Date().toISOString(),
            });
          }}
        />
      )}
    </div>
  );
};
