import React, { useState } from 'react';
import { BrainCircuit, Play, BookOpen, Layers, ChevronRight } from 'lucide-react';
import { Notebook, Flashcard } from '../types';
import { FlashcardStudyModal } from './FlashcardStudyModal';

interface AllFlashcardsHubViewProps {
  notebooks: Notebook[];
  onSelectNotebook: (notebook: Notebook) => void;
  onUpdateNotebook: (notebook: Notebook) => void;
}

export const AllFlashcardsHubView: React.FC<AllFlashcardsHubViewProps> = ({
  notebooks,
  onSelectNotebook,
  onUpdateNotebook,
}) => {
  const [activeStudyCards, setActiveStudyCards] = useState<Flashcard[] | null>(null);
  const [activeStudyTitle, setActiveStudyTitle] = useState<string>('');
  const [activeStudyNotebookId, setActiveStudyNotebookId] = useState<string | null>(null);

  // Aggregate flashcards
  const allCards: { card: Flashcard; notebook: Notebook }[] = [];
  notebooks.forEach((nb) => {
    nb.flashcards.forEach((c) => {
      allCards.push({ card: c, notebook: nb });
    });
  });

  const now = new Date();
  const dueCards = allCards.filter(({ card }) => new Date(card.nextReviewDate) <= now);
  const masteredCards = allCards.filter(({ card }) => card.status === 'mastered');

  // Start study for specific notebook
  const handleStartDeck = (notebook: Notebook) => {
    setActiveStudyCards(notebook.flashcards);
    setActiveStudyTitle(notebook.title);
    setActiveStudyNotebookId(notebook.id);
  };

  // Start study for all due cards
  const handleStartAllDue = () => {
    if (dueCards.length === 0) return;
    setActiveStudyCards(dueCards.map((i) => i.card));
    setActiveStudyTitle('Revisões pendentes de hoje');
    setActiveStudyNotebookId(null);
  };

  // Finish study session handler
  const handleFinishStudy = (updatedCards: Flashcard[]) => {
    const cardMap = new Map(updatedCards.map((c) => [c.id, c]));

    // Update notebooks
    notebooks.forEach((nb) => {
      let hasChanges = false;
      const newFlashcards = nb.flashcards.map((c) => {
        if (cardMap.has(c.id)) {
          hasChanges = true;
          return cardMap.get(c.id)!;
        }
        return c;
      });

      if (hasChanges) {
        onUpdateNotebook({
          ...nb,
          flashcards: newFlashcards,
          updatedAt: new Date().toISOString(),
        });
      }
    });

    setActiveStudyCards(null);
  };

  return (
    <div className="space-y-6 text-[#4A443F]">
      {/* Top Banner */}
      <div className="bg-[#F4F1EA] border border-[#E6E1D8] rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8F7285]/15 border border-[#8F7285]/30 text-[#8F7285] text-xs font-semibold">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Central de repetição espaçada</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2D2A26] tracking-tight">
              Baralhos de flashcards ({allCards.length} cartões)
            </h2>
            <p className="text-xs text-[#78716A] font-sans">
              Fortaleça a retenção da leitura a longo prazo com testes programados com base nos grifos dos seus livros.
            </p>
          </div>

          {/* Quick Metrics & All Due Trigger */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="grid grid-cols-3 gap-3 bg-white p-3 rounded-2xl border border-[#E6E1D8] text-center shadow-xs">
              <div className="px-2">
                <span className="block text-xl font-bold font-mono text-[#C86D51]">
                  {allCards.length}
                </span>
                <span className="text-[10px] text-[#78716A] font-mono">Total</span>
              </div>
              <div className="px-2 border-x border-[#E6E1D8]">
                <span className="block text-xl font-bold font-mono text-[#D9534F]">
                  {dueCards.length}
                </span>
                <span className="text-[10px] text-[#78716A] font-mono">Para hoje</span>
              </div>
              <div className="px-2">
                <span className="block text-xl font-bold font-mono text-[#6A8E6B]">
                  {masteredCards.length}
                </span>
                <span className="text-[10px] text-[#78716A] font-mono">Dominados</span>
              </div>
            </div>

            <button
              onClick={handleStartAllDue}
              disabled={dueCards.length === 0}
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-[#C86D51] hover:bg-[#B35C42] text-white font-bold rounded-2xl shadow-xs transition-transform active:scale-95 disabled:opacity-50 text-xs whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Revisar pendentes ({dueCards.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Decks Grid Organized by Notebook */}
      <div className="space-y-4">
        <h3 className="text-sm font-serif font-bold text-[#2D2A26] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#C86D51]" />
          <span>Baralhos de estudo por livro</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notebooks.map((notebook) => {
            const nbDue = notebook.flashcards.filter((c) => new Date(c.nextReviewDate) <= now);
            const nbMastered = notebook.flashcards.filter((c) => c.status === 'mastered');

            return (
              <div
                key={notebook.id}
                className="bg-white border border-[#E6E1D8] rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between hover:border-[#C86D51]/50 transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-[#C86D51]/10 text-[#A85138] border border-[#C86D51]/20">
                      {notebook.type === 'book' ? 'Livro' : 'Estudo'}
                    </span>
                    <span className="text-xs font-mono text-[#78716A]">
                      {notebook.flashcards.length} cartões
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-base text-[#2D2A26] line-clamp-1">
                    {notebook.title}
                  </h4>

                  {notebook.author && (
                    <p className="text-xs text-[#78716A] italic">por {notebook.author}</p>
                  )}

                  {/* Deck Stats Bar */}
                  <div className="grid grid-cols-2 gap-2 bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E6E1D8] text-center text-xs">
                    <div>
                      <span className="text-[10px] text-[#78716A] block">Para revisar</span>
                      <span className="font-bold text-[#D9534F] font-mono">{nbDue.length}</span>
                    </div>
                    <div className="border-l border-[#E6E1D8]">
                      <span className="text-[10px] text-[#78716A] block">Dominados</span>
                      <span className="font-bold text-[#6A8E6B] font-mono">{nbMastered.length}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#E6E1D8]">
                  <button
                    onClick={() => handleStartDeck(notebook)}
                    disabled={notebook.flashcards.length === 0}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#8F7285] hover:bg-[#7D6173] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-40"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Estudar baralho</span>
                  </button>

                  <button
                    onClick={() => onSelectNotebook(notebook)}
                    className="p-2 bg-[#FAF9F6] hover:bg-[#F4F1EA] text-[#4A443F] rounded-xl border border-[#E6E1D8] transition-colors"
                    title="Abrir livro"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Study Session Modal */}
      {activeStudyCards && activeStudyCards.length > 0 && (
        <FlashcardStudyModal
          cards={activeStudyCards}
          notebookTitle={activeStudyTitle}
          onFinishStudy={handleFinishStudy}
          onClose={() => setActiveStudyCards(null)}
        />
      )}
    </div>
  );
};
