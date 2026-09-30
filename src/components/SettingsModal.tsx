import React from 'react';
import { X, Globe, ShieldCheck, Smartphone, Monitor, Database, Sparkles, Check, Download, BookOpen } from 'lucide-react';
import { useLanguage, Language } from '../utils/i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  totalNotebooks: number;
  onOpenInstall?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  totalNotebooks,
  onOpenInstall,
}) => {
  const { language, setLanguage, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-[#FAF9F6] border border-[#E6E1D8] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E6E1D8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C86D51]/10 border border-[#C86D51]/20 flex items-center justify-center text-[#C86D51]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#2D2A26]">
                {t.settingsTitle}
              </h2>
              <p className="text-xs text-[#78716A]">
                {t.settingsDesc}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#78716A] hover:text-[#2D2A26] rounded-xl hover:bg-[#F4F1EA] transition-colors"
            title={t.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Language Selection Section */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-[#2D2A26] uppercase tracking-wider font-mono">
            {t.chooseLanguage}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setLanguage('pt-BR')}
              className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                language === 'pt-BR'
                  ? 'bg-white border-[#C86D51] ring-2 ring-[#C86D51]/20 shadow-xs'
                  : 'bg-white/60 border-[#E6E1D8] hover:bg-white text-[#78716A]'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[#2D2A26]">
                  <span>🇧🇷</span>
                  <span>Português</span>
                </div>
                <span className="text-[11px] text-[#78716A]">Brasil (Padrão)</span>
              </div>
              {language === 'pt-BR' && (
                <div className="w-5 h-5 rounded-full bg-[#C86D51] text-white flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setLanguage('en-US')}
              className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                language === 'en-US'
                  ? 'bg-white border-[#C86D51] ring-2 ring-[#C86D51]/20 shadow-xs'
                  : 'bg-white/60 border-[#E6E1D8] hover:bg-white text-[#78716A]'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[#2D2A26]">
                  <span>🇺🇸</span>
                  <span>English</span>
                </div>
                <span className="text-[11px] text-[#78716A]">United States</span>
              </div>
              {language === 'en-US' && (
                <div className="w-5 h-5 rounded-full bg-[#C86D51] text-white flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Salvar como aplicativo (PWA & Logo) */}
        <div className="bg-white rounded-2xl border border-[#E6E1D8] p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#2D2A26]">
              <Smartphone className="w-4 h-4 text-[#C86D51]" />
              <span>Salvar como aplicativo no dispositivo</span>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#FAF9F6] text-[#C86D51] border border-[#E6E1D8]">
              Logo oficial
            </span>
          </div>

          <div className="flex items-center gap-3.5 bg-[#FAF9F6] p-3 rounded-xl border border-[#E6E1D8]">
            <img
              src="/apple-touch-icon.png"
              alt="Logo do Aplicativo"
              className="w-12 h-12 rounded-xl shadow-xs border border-white shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-[#2D2A26] truncate">
                ExLibris - Caderno de Leitura
              </h4>
              <p className="text-[11px] text-[#78716A] line-clamp-1">
                Acesse como app direto da tela inicial com o ícone do livro
              </p>
            </div>
            {onOpenInstall && (
              <button
                type="button"
                onClick={onOpenInstall}
                className="px-3 py-1.5 bg-[#C86D51] hover:bg-[#B35C42] text-white text-xs font-bold rounded-lg shadow-2xs shrink-0 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar</span>
              </button>
            )}
          </div>
        </div>

        {/* Sync & Security Information */}
        <div className="bg-white rounded-2xl border border-[#E6E1D8] p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2D2A26]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t.syncAccountInfo}</span>
          </div>

          <p className="text-xs text-[#78716A] leading-relaxed">
            {t.dataIsolationInfo}
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-[#5C554E]">
            <div className="flex items-center gap-1.5 bg-[#FAF9F6] p-2 rounded-xl border border-[#E6E1D8]">
              <Monitor className="w-3.5 h-3.5 text-[#C86D51]" />
              <span>Computador ativo</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#FAF9F6] p-2 rounded-xl border border-[#E6E1D8]">
              <Smartphone className="w-3.5 h-3.5 text-[#6A8E6B]" />
              <span>Celular sincronizado</span>
            </div>
          </div>

          {userEmail && (
            <div className="pt-2 border-t border-[#E6E1D8] flex items-center justify-between text-[11px] text-[#78716A]">
              <span>Conta conectada:</span>
              <span className="font-mono text-[#2D2A26] font-medium truncate max-w-[200px]">
                {userEmail}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#2D2A26] hover:bg-[#1A1816] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
