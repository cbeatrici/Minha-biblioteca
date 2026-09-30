import React, { useState, useRef } from 'react';
import {
  Smartphone,
  Laptop,
  Download,
  Upload,
  CheckCircle2,
  Copy,
  CheckCheck,
  RotateCcw,
  FileText,
  Trash2,
  X,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { Notebook } from '../types';
import { exportAllDataAsJson, importDataFromJson, exportNotebookToMarkdown, clearAllNotebooks, loadSeedNotebooks } from '../utils/storage';

interface SyncExportModalProps {
  notebooks: Notebook[];
  onImportSuccess: (importedNotebooks: Notebook[]) => void;
  onClearAll: () => void;
  onLoadSeed: () => void;
  onClose: () => void;
}

export const SyncExportModal: React.FC<SyncExportModalProps> = ({
  notebooks,
  onImportSuccess,
  onClearAll,
  onLoadSeed,
  onClose,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sync' | 'backup' | 'manage'>('sync');
  const [selectedNotebookForMd, setSelectedNotebookForMd] = useState<string>(notebooks[0]?.id || '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopyAppUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleExportJson = () => {
    exportAllDataAsJson(notebooks);
  };

  const handleExportMarkdown = () => {
    const target = notebooks.find((n) => n.id === selectedNotebookForMd);
    if (target) {
      exportNotebookToMarkdown(target);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = importDataFromJson(content);
        if (imported && imported.length > 0) {
          onImportSuccess(imported);
          setFeedbackStatus(`Importados com sucesso ${imported.length} livros!`);
          setTimeout(() => setFeedbackStatus(null), 4000);
        } else {
          setFeedbackStatus('Arquivo de backup inválido. Por favor envie um arquivo JSON válido.');
        }
      } catch (err) {
        setFeedbackStatus('Erro ao processar o arquivo de backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetHistory = () => {
    if (window.confirm('Tem certeza que deseja zerar todo o histórico e começar do zero? Todos os livros cadastrados serão removidos.')) {
      clearAllNotebooks();
      onClearAll();
      setFeedbackStatus('Histórico zerado com sucesso! A biblioteca está pronta para novos testes.');
      setTimeout(() => setFeedbackStatus(null), 4000);
    }
  };

  const handleRestoreDemo = () => {
    loadSeedNotebooks();
    onLoadSeed();
    setFeedbackStatus('Livros de exemplo carregados com sucesso!');
    setTimeout(() => setFeedbackStatus(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-[#E6E1D8] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col text-[#4A443F]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E6E1D8] flex items-center justify-between bg-[#FAF9F6]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#5C7D8A]/15 rounded-xl border border-[#5C7D8A]/30 text-[#5C7D8A]">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#2D2A26]">
                Sincronização, Backup & Dados
              </h2>
              <p className="text-xs text-[#78716A]">
                Acesse em outros dispositivos, exporte seus dados ou gerencie o armazenamento
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#78716A] hover:text-[#2D2A26] rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 flex items-center gap-2 border-b border-[#E6E1D8] bg-[#FAF9F6]">
          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'sync'
                ? 'border-[#C86D51] text-[#C86D51]'
                : 'border-transparent text-[#78716A] hover:text-[#2D2A26]'
            }`}
          >
            📱 Acesso Mobile
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'backup'
                ? 'border-[#C86D51] text-[#C86D51]'
                : 'border-transparent text-[#78716A] hover:text-[#2D2A26]'
            }`}
          >
            💾 Backup & Exportação
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'manage'
                ? 'border-[#C86D51] text-[#C86D51]'
                : 'border-transparent text-[#78716A] hover:text-[#2D2A26]'
            }`}
          >
            ⚙️ Gerenciar Dados
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {feedbackStatus && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{feedbackStatus}</span>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#E6E1D8] space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#C86D51]/10 rounded-xl text-[#C86D51]">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <h4 className="text-xs font-semibold text-[#2D2A26]">
                      Abra a câmera do celular para escanear páginas físicas
                    </h4>
                    <p className="text-[11px] text-[#78716A]">
                      Copie o link abaixo para abrir diretamente no navegador do seu smartphone:
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    readOnly
                    value={window.location.href}
                    className="flex-1 text-xs bg-white border border-[#DCD6CA] rounded-xl px-3 py-2 text-[#2D2A26] font-mono select-all"
                  />
                  <button
                    onClick={handleCopyAppUrl}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#C86D51] hover:bg-[#B35C42] text-white font-bold rounded-xl text-xs transition-colors whitespace-nowrap shadow-xs"
                  >
                    {copiedUrl ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Download Backup */}
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E6E1D8] space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <Download className="w-5 h-5 text-[#C86D51]" />
                    <h4 className="text-xs font-semibold text-[#2D2A26]">Backup em JSON</h4>
                    <p className="text-[11px] text-[#78716A]">
                      Baixe todos os seus {notebooks.length} livros e citações em um único arquivo.
                    </p>
                  </div>
                  <button
                    onClick={handleExportJson}
                    className="w-full py-2 bg-[#C86D51] hover:bg-[#B35C42] text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                  >
                    Baixar Backup (.json)
                  </button>
                </div>

                {/* Import / Restore */}
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E6E1D8] space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <Upload className="w-5 h-5 text-[#6A8E6B]" />
                    <h4 className="text-xs font-semibold text-[#2D2A26]">Restaurar Backup</h4>
                    <p className="text-[11px] text-[#78716A]">
                      Carregue um arquivo JSON salvo anteriormente.
                    </p>
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 bg-white hover:bg-[#F4F1EA] text-[#4A443F] font-semibold rounded-xl text-xs border border-[#DCD6CA] transition-colors"
                    >
                      Selecionar Arquivo JSON
                    </button>
                  </div>
                </div>
              </div>

              {notebooks.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E6E1D8] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#2D2A26]">Exportar Livro em Markdown (.md)</span>
                    <button
                      onClick={handleExportMarkdown}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 bg-[#C86D51] hover:bg-[#B35C42] text-white font-bold rounded-xl shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Exportar</span>
                    </button>
                  </div>
                  <select
                    value={selectedNotebookForMd}
                    onChange={(e) => setSelectedNotebookForMd(e.target.value)}
                    className="w-full text-xs bg-white border border-[#DCD6CA] rounded-xl p-2 text-[#2D2A26]"
                  >
                    {notebooks.map((nb) => (
                      <option key={nb.id} value={nb.id}>
                        {nb.title} ({nb.highlights.length} citações)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-900 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Zerar Histórico para Publicação / Novos Testes</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Esta ação apaga todos os livros, resenhas e grifos salvos no armazenamento local, deixando a biblioteca 100% limpa para você começar seus testes do zero.
                </p>
                <button
                  type="button"
                  onClick={handleResetHistory}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Zerar Todo o Histórico (Limpar Dados)</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E6E1D8] space-y-2">
                <div className="flex items-center gap-2 text-[#2D2A26] font-semibold">
                  <Sparkles className="w-4 h-4 text-[#C86D51]" />
                  <span>Carregar Livros de Demonstração</span>
                </div>
                <p className="text-[11px] text-[#78716A]">
                  Preenche a biblioteca com exemplos pré-configurados (Marco Aurélio, Daniel Kahneman, Yuval Harari) para testar a interface.
                </p>
                <button
                  type="button"
                  onClick={handleRestoreDemo}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F4F1EA] text-[#2D2A26] border border-[#DCD6CA] font-semibold rounded-xl text-xs transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#5C7D8A]" />
                  <span>Carregar Exemplos de Teste</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#E6E1D8] bg-[#FAF9F6] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-white hover:bg-[#F4F1EA] text-[#4A443F] border border-[#DCD6CA] rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
