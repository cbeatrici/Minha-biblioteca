import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Volume2, VolumeX, CheckCircle, Sparkles, Award, ArrowRight, BrainCircuit } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Flashcard } from '../types';
import { getColorDef } from '../data/colorPalette';
import { speakText, stopSpeaking } from '../utils/speech';

interface FlashcardStudyModalProps {
  cards: Flashcard[];
  notebookTitle: string;
  onFinishStudy: (updatedCards: Flashcard[]) => void;
  onClose: () => void;
}

export const FlashcardStudyModal: React.FC<FlashcardStudyModalProps> = ({
  cards,
  notebookTitle,
  onFinishStudy,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([...cards]);
  const [isFinished, setIsFinished] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // Statistics
  const [ratingsCount, setRatingsCount] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });

  const currentCard = sessionCards[currentIndex];
  const colorDef = currentCard?.colorKey ? getColorDef(currentCard.colorKey) : getColorDef('yellow');

  // Trigger confetti on finish
  useEffect(() => {
    if (isFinished) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isFinished]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped) {
        if (e.key === '1') handleRate('again');
        if (e.key === '2') handleRate('hard');
        if (e.key === '3') handleRate('good');
        if (e.key === '4') handleRate('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, isFinished, currentIndex]);

  // Handle TTS
  const handleToggleSpeak = () => {
    if (!currentCard) return;
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      const text = isFlipped ? currentCard.answer : currentCard.question;
      speakText(text, () => setSpeaking(false));
    }
  };

  // SM-2 Spaced Repetition Logic Calculation
  const handleRate = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    stopSpeaking();
    setSpeaking(false);

    setRatingsCount((prev) => ({
      ...prev,
      [rating]: prev[rating] + 1,
    }));

    let updatedCard = { ...currentCard };
    let newInterval = updatedCard.intervalDays || 1;
    let newEase = updatedCard.easeFactor || 2.5;
    let newLevel = updatedCard.level || 0;
    let newStatus: Flashcard['status'] = updatedCard.status;

    if (rating === 'again') {
      newInterval = 1;
      newLevel = 0;
      newStatus = 'learning';
    } else if (rating === 'hard') {
      newInterval = Math.max(1, Math.round(newInterval * 1.2));
      newEase = Math.max(1.3, newEase - 0.15);
      newStatus = 'learning';
    } else if (rating === 'good') {
      newInterval = Math.max(2, Math.round(newInterval * newEase));
      newLevel += 1;
      newStatus = newLevel >= 3 ? 'mastered' : 'review';
    } else if (rating === 'easy') {
      newInterval = Math.max(4, Math.round(newInterval * (newEase + 0.3)));
      newEase += 0.15;
      newLevel += 2;
      newStatus = 'mastered';
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + newInterval);

    updatedCard = {
      ...updatedCard,
      level: newLevel,
      intervalDays: newInterval,
      nextReviewDate: nextDate.toISOString(),
      lastReviewed: new Date().toISOString(),
      reviewCount: (updatedCard.reviewCount || 0) + 1,
      easeFactor: newEase,
      status: newStatus,
    };

    const nextSessionCards = sessionCards.map((c, i) =>
      i === currentIndex ? updatedCard : c
    );
    setSessionCards(nextSessionCards);

    if (currentIndex + 1 < sessionCards.length) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleFinishAndSave = () => {
    onFinishStudy(sessionCards);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-[#E6E1D8] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E6E1D8] flex items-center justify-between bg-[#FAF9F6]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#C86D51]/10 rounded-lg border border-[#C86D51]/20 text-[#C86D51]">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-[#2D2A26]">
                Sessão de estudos com repetição espaçada
              </h3>
              <p className="text-[11px] text-[#78716A] truncate max-w-xs">{notebookTitle}</p>
            </div>
          </div>

          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="p-1.5 rounded-lg text-[#78716A] hover:text-[#2D2A26] hover:bg-[#F4F1EA]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Study Card Body */}
        {!isFinished && currentCard ? (
          <div className="p-6 space-y-6">
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[#78716A] font-mono">
                <span>
                  Cartão {currentIndex + 1} de {sessionCards.length}
                </span>
                <span>{Math.round(((currentIndex + 1) / sessionCards.length) * 100)}% concluído</span>
              </div>
              <div className="w-full h-1.5 bg-[#E6E1D8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C86D51] transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / sessionCards.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Flip Card Stage */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className={`min-h-[260px] sm:min-h-[300px] cursor-pointer rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 transform select-none relative shadow-md border ${
                isFlipped
                  ? 'bg-gradient-to-br from-[#F4F1EA] via-white to-[#EAE6DD] border-[#6A8E6B]/40'
                  : 'bg-gradient-to-br from-[#FAF9F6] via-white to-[#F4F1EA] border-[#E6E1D8]'
              }`}
            >
              {/* Card Top Strip */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                    isFlipped
                      ? 'bg-[#6A8E6B]/15 text-[#4D6F4E] border-[#6A8E6B]/30'
                      : 'bg-[#C86D51]/10 text-[#C86D51] border-[#C86D51]/20'
                  }`}
                >
                  {isFlipped ? 'Resposta' : 'Pergunta ou estímulo'}
                </span>

                <div className="flex items-center gap-2">
                  {currentCard.topic && (
                    <span className="text-[11px] text-[#78716A] font-medium bg-[#FAF9F6] px-2 py-0.5 rounded border border-[#E6E1D8]">
                      {currentCard.topic}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSpeak();
                    }}
                    className="p-1.5 rounded-lg bg-[#FAF9F6] hover:bg-[#F4F1EA] text-[#4A443F] border border-[#E6E1D8]"
                    title="Ouvir texto em voz alta"
                  >
                    {speaking ? <VolumeX className="w-4 h-4 text-[#C86D51]" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Card Center Content */}
              <div className="my-auto py-4">
                {!isFlipped ? (
                  <p className="text-lg sm:text-xl font-serif font-bold text-[#2D2A26] text-center leading-relaxed">
                    {currentCard.question}
                  </p>
                ) : (
                  <div className="space-y-3 text-center">
                    <p className="text-base sm:text-lg font-sans text-[#2D2A26] leading-relaxed">
                      {currentCard.answer}
                    </p>
                    {currentCard.quoteContext && (
                      <p className="text-xs text-[#78716A] italic pt-2 border-t border-[#E6E1D8] max-w-md mx-auto">
                        "{currentCard.quoteContext}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Flip Hint */}
              <div className="text-center">
                <span className="text-[11px] text-[#A8A29E] font-mono">
                  {isFlipped ? 'Avalie sua retenção abaixo para agendar a próxima revisão' : 'Clique no cartão ou pressione [Espaço] para virar'}
                </span>
              </div>
            </div>

            {/* Rating Buttons (Shown when card is flipped) */}
            {isFlipped ? (
              <div className="grid grid-cols-4 gap-2 pt-2">
                <button
                  onClick={() => handleRate('again')}
                  className="flex flex-col items-center p-2.5 rounded-xl bg-[#C86D51]/10 hover:bg-[#C86D51]/20 border border-[#C86D51]/30 text-[#A85138] transition-colors"
                >
                  <span className="text-xs font-bold">Repetir</span>
                  <span className="text-[10px] text-[#A85138]/80 font-mono">1 dia [1]</span>
                </button>
                <button
                  onClick={() => handleRate('hard')}
                  className="flex flex-col items-center p-2.5 rounded-xl bg-[#D4A373]/15 hover:bg-[#D4A373]/25 border border-[#D4A373]/30 text-[#8C5D30] transition-colors"
                >
                  <span className="text-xs font-bold">Difícil</span>
                  <span className="text-[10px] text-[#8C5D30]/80 font-mono">2 dias [2]</span>
                </button>
                <button
                  onClick={() => handleRate('good')}
                  className="flex flex-col items-center p-2.5 rounded-xl bg-[#8A9A86]/20 hover:bg-[#8A9A86]/30 border border-[#8A9A86]/30 text-[#4D6F4E] transition-colors"
                >
                  <span className="text-xs font-bold">Bom</span>
                  <span className="text-[10px] text-[#4D6F4E]/80 font-mono">4 dias [3]</span>
                </button>
                <button
                  onClick={() => handleRate('easy')}
                  className="flex flex-col items-center p-2.5 rounded-xl bg-[#6A8E6B]/20 hover:bg-[#6A8E6B]/30 border border-[#6A8E6B]/40 text-[#4D6F4E] transition-colors"
                >
                  <span className="text-xs font-bold">Fácil</span>
                  <span className="text-[10px] text-[#4D6F4E]/80 font-mono">7 dias [4]</span>
                </button>
              </div>
            ) : (
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setIsFlipped(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#FAF9F6] hover:bg-[#F4F1EA] border border-[#E6E1D8] text-[#4A443F] rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ver resposta (Espaço)</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Finished Session Screen */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-[#6A8E6B]/15 border border-[#6A8E6B]/30 flex items-center justify-center text-[#4D6F4E] shadow-xs">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-bold text-[#2D2A26]">Sessão de estudos concluída!</h3>
              <p className="text-xs text-[#78716A] max-w-sm mx-auto">
                Excelente trabalho! Seus cartões foram atualizados com novos intervalos de retenção da repetição espaçada.
              </p>
            </div>

            {/* Session Stats Grid */}
            <div className="grid grid-cols-4 gap-2.5 max-w-md mx-auto bg-[#FAF9F6] p-3.5 rounded-2xl border border-[#E6E1D8] text-center">
              <div>
                <span className="block text-lg font-bold text-[#C86D51] font-mono">{ratingsCount.again}</span>
                <span className="text-[10px] text-[#78716A]">Repetir</span>
              </div>
              <div>
                <span className="block text-lg font-bold text-[#D4A373] font-mono">{ratingsCount.hard}</span>
                <span className="text-[10px] text-[#78716A]">Difícil</span>
              </div>
              <div>
                <span className="block text-lg font-bold text-[#8A9A86] font-mono">{ratingsCount.good}</span>
                <span className="text-[10px] text-[#78716A]">Bom</span>
              </div>
              <div>
                <span className="block text-lg font-bold text-[#6A8E6B] font-mono">{ratingsCount.easy}</span>
                <span className="text-[10px] text-[#78716A]">Fácil</span>
              </div>
            </div>

            <button
              onClick={handleFinishAndSave}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#C86D51] hover:bg-[#B35C42] text-white font-bold rounded-xl shadow-xs transition-transform active:scale-95 text-xs"
            >
              <span>Salvar progresso e voltar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
