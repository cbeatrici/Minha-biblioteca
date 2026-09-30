import React from 'react';
import { X, Smartphone, Download, Share, PlusSquare, CheckCircle2, Laptop, ArrowRight } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF9F6] border border-[#DCD6CA] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E6E1D8] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C86D51]/10 text-[#C86D51] flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#2D2A26]">
                Salvar como aplicativo
              </h2>
              <p className="text-[11px] text-[#78716A]">
                Acesse direto da tela inicial do seu celular ou computador
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#78716A] hover:text-[#2D2A26] rounded-xl hover:bg-[#F4F1EA] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* App Logo & Preview */}
        <div className="bg-white rounded-2xl border border-[#E6E1D8] p-5 flex items-center gap-4 shadow-2xs">
          <div className="relative shrink-0">
            <img
              src="/apple-touch-icon.png"
              alt="Logo do Aplicativo"
              className="w-16 h-16 rounded-2xl shadow-md border border-white"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#6A8E6B] text-white flex items-center justify-center border-2 border-white">
              <CheckCircle2 className="w-3 h-3" />
            </div>
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm text-[#2D2A26]">
              ExLibris
            </h3>
            <p className="text-xs text-[#78716A]">
              Estúdio de leitura & citações
            </p>
            <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FAF9F6] text-[#C86D51] border border-[#E6E1D8] font-semibold">
              Ícone oficial pronto
            </span>
          </div>
        </div>

        {/* Dynamic Installation Method */}
        {isInstalled ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Aplicativo já instalado!</p>
              <p className="text-[11px] text-emerald-700">
                Você já está utilizando a versão de aplicativo no seu dispositivo.
              </p>
            </div>
          </div>
        ) : isInstallable ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={async () => {
                const success = await install();
                if (success) onClose();
              }}
              className="w-full py-3 px-4 bg-[#C86D51] hover:bg-[#B35C42] text-white font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 text-sm transition-transform active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Instalar aplicativo agora</span>
            </button>
            <p className="text-[11px] text-center text-[#78716A]">
              Instalação instantânea sem ocupar espaço na memória.
            </p>
          </div>
        ) : isIOS ? (
          /* iOS Instructions */
          <div className="bg-[#FAF9F6] rounded-2xl border border-[#E6E1D8] p-4 space-y-3">
            <p className="text-xs font-bold text-[#2D2A26] flex items-center gap-1.5">
              <span>Como salvar no iPhone / iPad (Safari):</span>
            </p>
            <div className="space-y-2 text-xs text-[#5C554E]">
              <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-[#E6E1D8]">
                <div className="w-6 h-6 rounded-lg bg-[#FAF9F6] flex items-center justify-center text-[#C86D51] shrink-0 font-bold text-xs">
                  1
                </div>
                <div>
                  Toque no botão <strong className="text-[#2D2A26]">Compartilhar</strong> (ícone com quadrado e seta para cima <Share className="w-3.5 h-3.5 inline mx-0.5 text-blue-600" />) na barra inferior do Safari.
                </div>
              </div>
              <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-[#E6E1D8]">
                <div className="w-6 h-6 rounded-lg bg-[#FAF9F6] flex items-center justify-center text-[#C86D51] shrink-0 font-bold text-xs">
                  2
                </div>
                <div>
                  Role para baixo e selecione <strong className="text-[#2D2A26]">"Adicionar à Tela de Início"</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-[#C86D51]" />).
                </div>
              </div>
              <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-[#E6E1D8]">
                <div className="w-6 h-6 rounded-lg bg-[#FAF9F6] flex items-center justify-center text-[#C86D51] shrink-0 font-bold text-xs">
                  3
                </div>
                <div>
                  Toque em <strong className="text-[#2D2A26]">"Adicionar"</strong> no canto superior direito. A logo do livro aparecerá na sua tela principal!
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* General Desktop or Android Instructions */
          <div className="bg-[#FAF9F6] rounded-2xl border border-[#E6E1D8] p-4 space-y-2.5 text-xs text-[#5C554E]">
            <p className="font-bold text-[#2D2A26] flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-[#C86D51]" />
              <span>Como salvar no seu navegador ou celular:</span>
            </p>
            <div className="space-y-1.5 text-[11px] leading-relaxed">
              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-[#E6E1D8]">
                <ArrowRight className="w-3 h-3 text-[#C86D51] shrink-0" />
                <span>No <strong>Google Chrome</strong> (PC): clique no ícone de instalar na barra de endereço (lado direito).</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-[#E6E1D8]">
                <ArrowRight className="w-3 h-3 text-[#C86D51] shrink-0" />
                <span>No <strong>Android (Chrome)</strong>: abra o menu (⋮) e toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</span>
              </div>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-[#F4F1EA] text-[#2D2A26] font-semibold text-xs rounded-xl border border-[#DCD6CA] transition-colors"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};
