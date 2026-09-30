import React, { useState } from 'react';
import {
  BookOpen,
  Camera,
  Layers,
  Sparkles,
  Smartphone,
  Laptop,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Share2,
  Highlighter,
  PenLine,
  Image as ImageIcon
} from 'lucide-react';

interface OnboardingTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Bem-vindo ao App de Leitura!',
      subtitle: 'O seu caderno inteligente de leitura e estudo na nuvem',
      icon: BookOpen,
      iconColor: 'bg-[#C86D51] text-white',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-[#4A443F]">
          <p className="leading-relaxed">
            Seja muito bem-vindo! O <strong>App de Leitura</strong> foi criado para que você nunca mais perca as melhores ideias, citações e passagens dos livros físicos que você lê.
          </p>
          <div className="p-3.5 bg-[#F4F1EA] rounded-2xl border border-[#E6E1D8] space-y-2">
            <div className="flex items-center gap-2 font-semibold text-[#2D2A26]">
              <CheckCircle2 className="w-4 h-4 text-[#6A8E6B]" />
              <span>Sua biblioteca sincronizada e isolada na nuvem</span>
            </div>
            <p className="text-xs text-[#78716A]">
              Seu histórico fica salvo no seu banco de dados individual, garantindo que suas leituras e anotações fiquem sempre sincronizadas entre celular e computador sem misturar com outras contas.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: '1. Capas reais e busca na internet',
      subtitle: 'Busca automática na internet ou envio da sua própria capa',
      icon: ImageIcon,
      iconColor: 'bg-[#5C7D8A] text-white',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-[#4A443F]">
          <p className="leading-relaxed">
            Ao cadastrar uma obra, você não precisa ficar apenas com cores genéricas:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 bg-[#FAF9F6] border border-[#E6E1D8] rounded-xl">
              <span className="font-bold text-[#C86D51] block mb-1">🌐 Buscar na internet</span>
              <p className="text-[11px] text-[#78716A]">
                Clique no botão de buscar capa e o sistema localiza a capa em alta resolução do livro no Google Books e OpenLibrary.
              </p>
            </div>
            <div className="p-3 bg-[#FAF9F6] border border-[#E6E1D8] rounded-xl">
              <span className="font-bold text-[#6A8E6B] block mb-1">📸 Envio de foto</span>
              <p className="text-[11px] text-[#78716A]">
                Tire uma foto da capa do seu livro físico e envie diretamente pelo celular ou computador.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '2. Escaneamento com câmera ou celular',
      subtitle: 'Digitalização óptica com inteligência artificial',
      icon: Camera,
      iconColor: 'bg-[#C86D51] text-white',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-[#4A443F]">
          <p className="leading-relaxed">
            Dentro de cada livro, clique em <strong>"Escanear grifos"</strong>:
          </p>
          <ul className="space-y-2 text-xs text-[#78716A]">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C86D51] mt-1.5 shrink-0" />
              <span>Tire a foto da página física com boa iluminação ou selecione o arquivo da galeria.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C86D51] mt-1.5 shrink-0" />
              <span>O leitor óptico transcreve o texto com precisão, identifica o número da página e detecta o capítulo.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C86D51] mt-1.5 shrink-0" />
              <span>Você pode revisar, editar e adicionar suas próprias anotações analíticas antes de salvar.</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: '3. Grifos e sublinhados: cores são opcionais',
      subtitle: 'Reconhece caneta, lápis, marca-texto e margens',
      icon: PenLine,
      iconColor: 'bg-[#C28238] text-white',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-[#4A443F]">
          <p className="leading-relaxed">
            Você é livre para marcar do seu jeito:
          </p>
          <div className="space-y-2">
            <div className="p-2.5 bg-[#FAF9F6] border border-[#E6E1D8] rounded-xl flex items-start gap-2.5">
              <PenLine className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
              <div className="text-xs">
                <strong className="text-[#2D2A26]">Apenas sublinhou a frase?</strong>
                <p className="text-[#78716A] text-[11px]">
                  Sem problema! O aplicativo identifica sublinhados a lápis e caneta e os classifica como "Sublinhado sem cor", sem forçar categorias artificiais.
                </p>
              </div>
            </div>
            <div className="p-2.5 bg-[#FAF9F6] border border-[#E6E1D8] rounded-xl flex items-start gap-2.5">
              <Highlighter className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="text-xs">
                <strong className="text-[#2D2A26]">Usa marca-textos de cores diferentes?</strong>
                <p className="text-[#78716A] text-[11px]">
                  A inteligência artificial detecta as cores das marcações (amarelo, verde, rosa, azul, laranja, roxo) e você pode definir o significado de cada cor.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '4. Celular, computador e Notion',
      subtitle: 'Seus dados sincronizados em tempo real na nuvem',
      icon: Smartphone,
      iconColor: 'bg-[#6A8E6B] text-white',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-[#4A443F]">
          <p className="leading-relaxed">
            Tudo o que você adicionar é sincronizado na nuvem:
          </p>
          <div className="p-3 bg-[#F4F1EA] rounded-xl border border-[#E6E1D8] space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[#2D2A26] font-semibold">
              <Laptop className="w-4 h-4 text-[#C86D51]" />
              <span>Mesmo acesso no celular e no computador</span>
            </div>
            <p className="text-[#78716A] text-[11px]">
              Basta entrar com a sua conta no celular para fotografar livros e abrir no computador para estudar.
            </p>
            <div className="pt-2 border-t border-[#E6E1D8] flex items-center gap-2 text-[#2D2A26] font-semibold">
              <Share2 className="w-4 h-4 text-[#5C7D8A]" />
              <span>Sincronização com o Notion em blocos</span>
            </div>
            <p className="text-[#78716A] text-[11px]">
              Exporte seus livros com separação por capítulos, temas e grifos diretamente para sua página do Notion em um clique.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const activeStepData = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const StepIcon = activeStepData.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E6E1D8] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-6 bg-[#FAF9F6] border-b border-[#E6E1D8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs ${activeStepData.iconColor}`}>
              <StepIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium tracking-wide text-[#C86D51]">
                Passo {currentStep + 1} de {steps.length}
              </span>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#2D2A26]">
                {activeStepData.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#EAE5DC] text-[#78716A] hover:text-[#2D2A26] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <p className="text-xs font-medium text-[#78716A]">
            {activeStepData.subtitle}
          </p>
          {activeStepData.content}
        </div>

        {/* Footer with Step Dots & Controls */}
        <div className="p-4 sm:p-6 bg-[#FAF9F6] border-t border-[#E6E1D8] flex items-center justify-between gap-2">
          {/* Step indicator dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep ? 'w-6 bg-[#C86D51]' : 'w-2 bg-[#DCD6CA] hover:bg-[#B5ADA4]'
                }`}
                title={`Ir para etapa ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-3 py-2 text-xs font-semibold text-[#78716A] hover:text-[#2D2A26] bg-white border border-[#DCD6CA] rounded-xl shadow-xs transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
            )}

            {isLast ? (
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-white bg-[#C86D51] hover:bg-[#B35C42] rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Começar a usar</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-4 py-2 text-xs font-bold text-white bg-[#C86D51] hover:bg-[#B35C42] rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>Próximo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
