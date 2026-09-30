import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Key,
  Database,
  RefreshCw,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Notebook } from '../types';

interface NotionSyncModalProps {
  notebook: Notebook;
  onUpdateNotebook: (updated: Notebook) => void;
  onClose: () => void;
}

export const NotionSyncModal: React.FC<NotionSyncModalProps> = ({
  notebook,
  onUpdateNotebook,
  onClose,
}) => {
  // Notion credentials saved in localStorage for user convenience
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('lumina_notion_api_key') || '');
  const [databaseId, setDatabaseId] = useState(() => localStorage.getItem('lumina_notion_db_id') || '');
  const [showInstructions, setShowInstructions] = useState(false);

  // UI state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
    notionUrl?: string;
  } | null>(null);

  // Save keys to localStorage when changed
  useEffect(() => {
    if (apiKey) localStorage.setItem('lumina_notion_api_key', apiKey);
    if (databaseId) localStorage.setItem('lumina_notion_db_id', databaseId);
  }, [apiKey, databaseId]);

  // Test Notion connection
  const handleTestConnection = async () => {
    if (!apiKey) {
      setTestResult({ success: false, message: 'Por favor, informe seu token de integração do Notion.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/notion/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, databaseId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.databaseTitle
            ? `Conexão bem-sucedida com a base: "${data.databaseTitle}"!`
            : data.message || 'Token do Notion validado com sucesso!',
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Falha ao conectar com o Notion. Verifique o token e as permissões.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Erro de rede ao conectar com a API do Notion.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Execute Notion Sync (creates structured blocks)
  const handleSyncToNotion = async () => {
    if (!apiKey || !databaseId) {
      setSyncResult({
        success: false,
        message: 'Para sincronizar em blocos no Notion, informe o token de integração e o identificador da base de dados.',
      });
      return;
    }

    setIsSyncing(true);
    setSyncResult(null);

    try {
      const res = await fetch('/api/notion/sync-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, databaseId, notebook }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const syncedAt = data.syncedAt || new Date().toISOString();
        onUpdateNotebook({
          ...notebook,
          notionPageId: data.notionPageId,
          notionLastSyncedAt: syncedAt,
        });

        setSyncResult({
          success: true,
          message: 'Livro, resenha e todas as citações foram criadas em blocos estruturados no Notion com sucesso!',
          notionUrl: data.notionUrl,
        });
      } else {
        setSyncResult({
          success: false,
          message: data.error || 'Erro ao sincronizar página no Notion.',
        });
      }
    } catch (err: any) {
      setSyncResult({
        success: false,
        message: err?.message || 'Erro inesperado ao enviar blocos para o Notion.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-[#E6E1D8] rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[#4A443F]">
        {/* Header */}
        <div className="p-5 border-b border-[#E6E1D8] flex items-center justify-between bg-[#FAF9F6]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5C7D8A]/15 text-[#5C7D8A] flex items-center justify-center border border-[#5C7D8A]/20">
              <Share2 className="w-4 h-4 font-bold" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#2D2A26]">
                Sincronizar com o Notion
              </h2>
              <p className="text-xs text-[#78716A]">
                Cria a página com blocos estruturados em sua base
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#78716A] hover:text-[#2D2A26] rounded-lg hover:bg-[#EAE5DC] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div className="p-3.5 bg-[#FAF9F6] border border-[#E6E1D8] rounded-2xl flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-serif font-bold text-[#2D2A26] block">
                {notebook.title}
              </span>
              <span className="text-[#78716A]">
                {notebook.highlights.length} grifos • {notebook.author || 'Sem autor'}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C86D51]/10 text-[#A85138]">
              {notebook.readingStatus === 'completed' ? 'Lido' : 'Lendo'}
            </span>
          </div>

          {/* Form Inputs */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#2D2A26] flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#C86D51]" />
                  Token de integração (Internal Secret)
                </label>
                <a
                  href="https://www.notion.so/my-integrations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#5C7D8A] hover:underline flex items-center gap-1"
                >
                  Criar token <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full text-xs bg-[#FAF9F6] border border-[#DCD6CA] rounded-xl p-2.5 text-[#2D2A26] font-mono focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D2A26] mb-1 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#6A8E6B]" />
                Identificador da base de dados (Database ID)
              </label>
              <input
                type="text"
                value={databaseId}
                onChange={(e) => setDatabaseId(e.target.value)}
                placeholder="Ex: 2b8a798f82cb4659a8427f7a22e8623b"
                className="w-full text-xs bg-[#FAF9F6] border border-[#DCD6CA] rounded-xl p-2.5 text-[#2D2A26] font-mono focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
              />
            </div>
          </div>

          {/* Collapsible Quick Guide */}
          <div className="border border-[#E6E1D8] rounded-xl overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full flex items-center justify-between p-2.5 bg-[#FAF9F6] text-[#78716A] hover:text-[#2D2A26] transition-colors"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <HelpCircle className="w-3.5 h-3.5 text-[#5C7D8A]" />
                Onde encontro o token e o identificador da base?
              </span>
              {showInstructions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showInstructions && (
              <div className="p-3 bg-white space-y-2 text-[#4A443F] border-t border-[#E6E1D8]">
                <ol className="list-decimal pl-4 space-y-1.5 text-[11px] leading-relaxed">
                  <li>Crie uma integração em <a href="https://www.notion.so/my-integrations" target="_blank" rel="noreferrer" className="text-[#C86D51] font-semibold underline">notion.so/my-integrations</a> e copie o token.</li>
                  <li>Na sua base do Notion, clique nos <strong>"..."</strong> no canto superior &gt; <strong>"Conectar a"</strong> &gt; selecione sua integração.</li>
                  <li>Copie o identificador da base (código alfanumérico na URL da sua base de dados antes do <code>?v=...</code>).</li>
                </ol>
              </div>
            )}
          </div>

          {/* Test & Sync Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !apiKey}
              className="px-3 py-2 bg-[#FAF9F6] hover:bg-[#F4F1EA] text-[#2D2A26] border border-[#DCD6CA] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testando...' : 'Testar'}</span>
            </button>

            <button
              type="button"
              onClick={handleSyncToNotion}
              disabled={isSyncing || !apiKey || !databaseId}
              className="flex-1 px-4 py-2 bg-[#C86D51] hover:bg-[#B35C42] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-50"
            >
              <Share2 className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Criando blocos...' : 'Sincronizar no Notion'}</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {syncResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                syncResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {syncResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
                <span className="font-semibold">{syncResult.message}</span>
              </div>
              {syncResult.notionUrl && (
                <a
                  href={syncResult.notionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-emerald-900 underline"
                >
                  Abrir no Notion <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
