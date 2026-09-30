import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Camera,
  Layers,
  Landmark,
  BrainCircuit,
  Bot,
  Sliders,
  BookOpen,
  Calendar,
  Share2,
  Edit2,
  Trash2,
  HelpCircle,
  FileText,
  Volume2,
  Star,
  CheckCircle,
} from 'lucide-react';
import { Notebook, HighlightItem, PageScan, Flashcard, HistoricalContextData } from '../types';
import { BookOverviewTab } from './BookOverviewTab';
import { HighlightsViewer } from './HighlightsViewer';
import { HistoricalContextView } from './HistoricalContextView';
import { FlashcardsDeckView } from './FlashcardsDeckView';
import { AskNotebookAssistant } from './AskNotebookAssistant';
import { ColorLegendEditor } from './ColorLegendEditor';
import { ScanPageModal } from './ScanPageModal';
import { FlashcardStudyModal } from './FlashcardStudyModal';
import { NotionSyncModal } from './NotionSyncModal';
import { HIGHLIGHT_COLORS, getColorDef, getColorMeaning } from '../data/colorPalette';

interface NotebookDetailViewProps {
  notebook: Notebook;
  onBack: () => void;
  onUpdateNotebook: (updated: Notebook) => void;
  onDeleteNotebook: (id: string) => void;
}

export const NotebookDetailView: React.FC<NotebookDetailViewProps> = ({
  notebook,
  onBack,
  onUpdateNotebook,
  onDeleteNotebook,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'highlights' | 'context' | 'flashcards' | 'assistant' | 'colors'>('overview');
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isNotionModalOpen, setIsNotionModalOpen] = useState(false);
  const [studyCards, setStudyCards] = useState<Flashcard[] | null>(null);

  // Editable notebook meta
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [editTitle, setEditTitle] = useState(notebook.title);
  const [editAuthor, setEditAuthor] = useState(notebook.author || '');
  const [editDescription, setEditDescription] = useState(notebook.description);

  // Save Scanned Page & Highlights
  const handleSaveScan = (scan: PageScan, newHighlights: HighlightItem[]) => {
    const updatedNotebook: Notebook = {
      ...notebook,
      updatedAt: new Date().toISOString(),
      pageScans: [scan, ...notebook.pageScans],
      highlights: [...newHighlights, ...notebook.highlights],
    };
    onUpdateNotebook(updatedNotebook);
  };

  // Add Single Highlight
  const handleAddHighlight = (highlight: HighlightItem) => {
    const updatedNotebook: Notebook = {
      ...notebook,
      updatedAt: new Date().toISOString(),
      highlights: [highlight, ...notebook.highlights],
    };
    onUpdateNotebook(updatedNotebook);
  };

  // Update Single Highlight
  const handleUpdateHighlight = (highlight: HighlightItem) => {
    const updatedNotebook: Notebook = {
      ...notebook,
      updatedAt: new Date().toISOString(),
      highlights: notebook.highlights.map((h) => (h.id === highlight.id ? highlight : h)),
    };
    onUpdateNotebook(updatedNotebook);
  };

  // Delete Single Highlight
  const handleDeleteHighlight = (id: string) => {
    const updatedNotebook: Notebook = {
      ...notebook,
      updatedAt: new Date().toISOString(),
      highlights: notebook.highlights.filter((h) => h.id !== id),
    };
    onUpdateNotebook(updatedNotebook);
  };

  // Update Historical Context
  const handleUpdateContext = (contextData: HistoricalContextData) => {
    const updatedNotebook: Notebook = {
      ...notebook,
      updatedAt: new Date().toISOString(),
      historicalContext: contextData,
    };
    onUpdateNotebook(updatedNotebook);
  };

  // Update Flashcards
  const handleUpdateFlashcards = (flashcards: Flashcard[]) => {
    const updatedNotebook: Notebook = {
      ...notebook,
      updatedAt: new Date().toISOString(),
      flashcards,
    };
    onUpdateNotebook(updatedNotebook);
  };

  // Finish Study Session
  const handleFinishStudy = (updatedSessionCards: Flashcard[]) => {
    const cardMap = new Map(updatedSessionCards.map((c) => [c.id, c]));
    const newCards = notebook.flashcards.map((c) => cardMap.get(c.id) || c);
    handleUpdateFlashcards(newCards);
    setStudyCards(null);
  };

  // Save Meta Changes
  const handleSaveMeta = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Notebook = {
      ...notebook,
      title: editTitle.trim() || notebook.title,
      author: editAuthor.trim() || undefined,
      description: editDescription.trim() || notebook.description,
      updatedAt: new Date().toISOString(),
    };
    onUpdateNotebook(updated);
    setIsEditingMeta(false);
  };

  const navTabs = [
    {
      id: 'overview' as const,
      label: 'Visão geral e resenha',
      icon: BookOpen,
      count: notebook.readingStatus === 'completed' ? 'Lido' : 'Lendo',
      badgeColor: 'text-[#C86D51]',
    },
    {
      id: 'highlights' as const,
      label: 'Citações e grifos',
      icon: Layers,
      count: notebook.highlights.length,
      badgeColor: 'text-[#C86D51]',
    },
    {
      id: 'context' as const,
      label: 'Contexto e autor',
      icon: Landmark,
      count: notebook.historicalContext ? 'Pronto' : 'Gerar contexto',
      badgeColor: 'text-[#6A8E6B]',
    },
    {
      id: 'flashcards' as const,
      label: 'Flashcards',
      icon: BrainCircuit,
      count: notebook.flashcards.length,
      badgeColor: 'text-[#C28238]',
    },
    {
      id: 'assistant' as const,
      label: 'Assistente de leitura',
      icon: Bot,
      count: 'Perguntas',
      badgeColor: 'text-[#5C7D8A]',
    },
    {
      id: 'colors' as const,
      label: 'Significado das cores',
      icon: Sliders,
      count: 'Cores',
      badgeColor: 'text-[#8F7285]',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#78716A] hover:text-[#2D2A26] bg-white hover:bg-[#F4F1EA] px-3.5 py-2 rounded-xl border border-[#E6E1D8] transition-colors w-fit shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a biblioteca</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsNotionModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F4F1EA] text-[#2D2A26] border border-[#DCD6CA] font-semibold rounded-xl text-xs shadow-xs transition-colors"
            title="Sincronizar livro no Notion em blocos"
          >
            <Share2 className="w-3.5 h-3.5 text-[#5C7D8A]" />
            <span>Sincronizar com o Notion</span>
          </button>

          <button
            onClick={() => setIsScanModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C86D51] hover:bg-[#B35C42] text-white font-bold rounded-xl text-xs shadow-xs transition-transform active:scale-95"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Escanear grifos</span>
          </button>
        </div>
      </div>

      {/* Notebook Header Card */}
      <div className="bg-white border border-[#E6E1D8] rounded-3xl p-6 shadow-xs relative overflow-hidden">
        {isEditingMeta ? (
          <form onSubmit={handleSaveMeta} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#78716A] mb-1">Título da obra</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xs bg-[#FAF9F6] border border-[#DCD6CA] rounded-xl p-2 text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#78716A] mb-1">Autor</label>
                <input
                  type="text"
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                  className="w-full text-xs bg-[#FAF9F6] border border-[#DCD6CA] rounded-xl p-2 text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#78716A] mb-1">Descrição e sinopse</label>
              <textarea
                rows={2}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full text-xs bg-[#FAF9F6] border border-[#DCD6CA] rounded-xl p-2 text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingMeta(false)}
                className="px-3 py-1.5 text-xs text-[#78716A] hover:text-[#2D2A26]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#C86D51] text-white font-bold text-xs rounded-lg shadow-xs hover:bg-[#B35C42]"
              >
                Salvar detalhes
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4 max-w-2xl">
              {notebook.coverUrl && (
                <div className="w-20 h-28 sm:w-24 sm:h-34 flex-shrink-0 rounded-xl overflow-hidden shadow-md border border-[#E6E1D8] relative bg-[#FAF9F6]">
                  <img
                    src={notebook.coverUrl}
                    alt={notebook.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/20" />
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-[#C86D51]/10 text-[#A85138] border border-[#C86D51]/20">
                    {notebook.type === 'book' ? '📖 Livro' : '🎓 Estudo e pesquisa'}
                  </span>
                  {notebook.author && (
                    <span className="text-xs text-[#78716A] font-sans">
                      por <strong className="text-[#2D2A26] font-medium">{notebook.author}</strong>
                    </span>
                  )}
                  {notebook.rating && (
                    <span className="text-xs text-[#D4A373] flex items-center">
                      {'⭐'.repeat(notebook.rating)}
                    </span>
                  )}
                  <button
                    onClick={() => setIsEditingMeta(true)}
                    className="p-1 rounded text-[#78716A] hover:text-[#2D2A26] transition-colors"
                    title="Editar detalhes do livro"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D2A26] tracking-tight">
                  {notebook.title}
                </h1>

                <p className="text-xs sm:text-sm text-[#78716A] font-sans leading-relaxed">
                  {notebook.description}
                </p>
              </div>
            </div>

            {/* Quick Color Meaning Pill Strip */}
            <div className="bg-[#FAF9F6] p-3.5 rounded-2xl border border-[#E6E1D8] space-y-2 min-w-[220px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#78716A] font-bold">
                  Significado dos grifos
                </span>
                <button
                  onClick={() => setActiveTab('colors')}
                  className="text-[10px] text-[#C86D51] hover:underline font-medium"
                >
                  Personalizar
                </button>
              </div>

              <div className="space-y-1.5">
                {HIGHLIGHT_COLORS.slice(0, 3).map((c) => (
                  <div key={c.key} className="flex items-center gap-2 text-[11px]">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.hex }} />
                    <span className="capitalize font-medium text-[#2D2A26] text-[10px] w-14">{c.key}:</span>
                    <span className="text-[#78716A] truncate text-[10px]">
                      {getColorMeaning(c.key, notebook.customColorMeanings)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[#E6E1D8]">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? 'bg-white border-[#C86D51] text-[#2D2A26] shadow-xs'
                  : 'bg-transparent border-transparent text-[#78716A] hover:text-[#2D2A26] hover:bg-white/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#C86D51]' : 'text-[#A8A29E]'}`} />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isActive ? 'bg-[#C86D51]/15 text-[#A85138]' : 'bg-[#EAE5DC] text-[#78716A]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Views */}
      <div className="pt-2">
        {activeTab === 'overview' && (
          <BookOverviewTab
            notebook={notebook}
            onUpdateNotebook={onUpdateNotebook}
            onNavigateTab={(t) => setActiveTab(t)}
            onOpenScanModal={() => setIsScanModalOpen(true)}
            onOpenNotionSync={() => setIsNotionModalOpen(true)}
          />
        )}

        {activeTab === 'highlights' && (
          <HighlightsViewer
            notebook={notebook}
            onAddHighlight={handleAddHighlight}
            onUpdateHighlight={handleUpdateHighlight}
            onDeleteHighlight={handleDeleteHighlight}
            onOpenScanModal={() => setIsScanModalOpen(true)}
            onUpdateNotebook={onUpdateNotebook}
          />
        )}

        {activeTab === 'context' && (
          <HistoricalContextView
            notebook={notebook}
            onUpdateContext={handleUpdateContext}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardsDeckView
            notebook={notebook}
            onUpdateFlashcards={handleUpdateFlashcards}
            onStartStudy={(cards) => setStudyCards(cards)}
          />
        )}

        {activeTab === 'assistant' && <AskNotebookAssistant notebook={notebook} />}

        {activeTab === 'colors' && (
          <div className="max-w-3xl mx-auto">
            <ColorLegendEditor
              customMeanings={notebook.customColorMeanings}
              onUpdateMeanings={(newMeanings) => {
                onUpdateNotebook({
                  ...notebook,
                  customColorMeanings: newMeanings,
                  updatedAt: new Date().toISOString(),
                });
              }}
            />
          </div>
        )}
      </div>

      {/* Scan Modal */}
      {isScanModalOpen && (
        <ScanPageModal
          notebook={notebook}
          onSaveScan={handleSaveScan}
          onClose={() => setIsScanModalOpen(false)}
        />
      )}

      {/* Notion Integration Modal */}
      {isNotionModalOpen && (
        <NotionSyncModal
          notebook={notebook}
          onUpdateNotebook={onUpdateNotebook}
          onClose={() => setIsNotionModalOpen(false)}
        />
      )}

      {/* Spaced Repetition Study Session Modal */}
      {studyCards && studyCards.length > 0 && (
        <FlashcardStudyModal
          cards={studyCards}
          notebookTitle={notebook.title}
          onFinishStudy={handleFinishStudy}
          onClose={() => setStudyCards(null)}
        />
      )}
    </div>
  );
};

