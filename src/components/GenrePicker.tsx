import React, { useState, useMemo } from 'react';
import { Tag, Plus, Check, X, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { DEFAULT_MAIN_GENRES, getAllAvailableGenres, saveCustomGenre, getCustomGenres } from '../data/genres';

interface GenrePickerProps {
  value: string;
  onChange: (genre: string) => void;
  className?: string;
}

export const GenrePicker: React.FC<GenrePickerProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newGenreInput, setNewGenreInput] = useState('');
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [customList, setCustomList] = useState<string[]>(() => getCustomGenres());

  // Top highlight genres for immediate 1-click access
  const topGenres = useMemo(() => [
    'Romance',
    'Suspense',
    'Ficção científica',
    'Fantasia',
    'Não-ficção',
    'Biografia & Memórias',
    'Desenvolvimento pessoal',
    'Psicologia',
    'Filosofia',
    'História',
    'Negócios',
    'Ciência',
  ], []);

  // Full list of available genres (preset + user custom)
  const allGenres = useMemo(() => {
    return getAllAvailableGenres(customList);
  }, [customList]);

  // Secondary genres (shown when "Ver mais gêneros" is expanded)
  const secondaryGenres = useMemo(() => {
    return allGenres.filter((g) => !topGenres.includes(g));
  }, [allGenres, topGenres]);

  const handleSelectGenre = (genre: string) => {
    if (value === genre) {
      onChange(''); // Allow toggle off
    } else {
      onChange(genre);
    }
  };

  const handleAddNewGenre = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newGenreInput.trim();
    if (!trimmed) return;

    // Save to localStorage
    const updated = saveCustomGenre(trimmed);
    setCustomList(updated);

    // Set as active genre
    onChange(trimmed);

    // Reset input and close
    setNewGenreInput('');
    setIsAddingNew(false);
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Input Field + Add Custom Button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Tag className="w-3.5 h-3.5 text-[#78716A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ex: Romance, Suspense, Ficção..."
            className="w-full text-xs pl-8 pr-8 py-2.5 bg-[#FAF9F6] border border-[#DCD6CA] rounded-xl text-[#2D2A26] placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#C86D51]"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#A8A29E] hover:text-[#2D2A26] rounded-md transition-colors"
              title="Limpar gênero"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {!isAddingNew ? (
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold bg-white hover:bg-[#FAF9F6] text-[#C86D51] border border-[#C86D51]/30 hover:border-[#C86D51] rounded-xl transition-all shadow-2xs whitespace-nowrap"
            title="Criar novo gênero personalizado"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo gênero</span>
          </button>
        ) : null}
      </div>

      {/* Inline Add New Genre Form */}
      {isAddingNew && (
        <form
          onSubmit={handleAddNewGenre}
          className="flex items-center gap-2 p-2.5 bg-white border border-[#C86D51]/40 rounded-xl shadow-xs animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <span className="text-xs text-[#C86D51] font-semibold flex items-center gap-1 pl-1">
            <Sparkles className="w-3 h-3" />
            <span>Nome:</span>
          </span>
          <input
            type="text"
            autoFocus
            value={newGenreInput}
            onChange={(e) => setNewGenreInput(e.target.value)}
            placeholder="Ex: Distopia, True Crime, Poesia..."
            className="flex-1 text-xs px-2.5 py-1.5 bg-[#FAF9F6] border border-[#E6E1D8] rounded-lg text-[#2D2A26] focus:outline-none focus:ring-1 focus:ring-[#C86D51]"
          />
          <button
            type="submit"
            disabled={!newGenreInput.trim()}
            className="px-3 py-1.5 text-xs font-bold bg-[#C86D51] hover:bg-[#B35C42] disabled:opacity-50 text-white rounded-lg shadow-2xs transition-colors"
          >
            Adicionar
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAddingNew(false);
              setNewGenreInput('');
            }}
            className="p-1 text-[#78716A] hover:text-[#2D2A26] rounded-md transition-colors"
            title="Cancelar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {/* Quick Select Chips: Main Genres */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-[#78716A]">
          <span className="font-medium">Principais gêneros:</span>
          <button
            type="button"
            onClick={() => setShowAllGenres(!showAllGenres)}
            className="text-[11px] text-[#C86D51] hover:underline flex items-center gap-0.5 font-semibold"
          >
            <span>{showAllGenres ? 'Recolher' : `Ver mais (+${secondaryGenres.length})`}</span>
            {showAllGenres ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Top genres list */}
        <div className="flex flex-wrap gap-1.5">
          {topGenres.map((g) => {
            const isSelected = value.trim().toLowerCase() === g.toLowerCase();
            return (
              <button
                key={g}
                type="button"
                onClick={() => handleSelectGenre(g)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-[#C86D51] text-white border-[#C86D51] font-bold shadow-2xs scale-[1.02]'
                    : 'bg-[#FAF9F6] hover:bg-[#F4F1EA] text-[#4A443F] hover:text-[#2D2A26] border-[#E6E1D8]'
                }`}
              >
                {isSelected && <Check className="w-2.5 h-2.5" />}
                <span>{g}</span>
              </button>
            );
          })}
        </div>

        {/* Expanded secondary genres */}
        {showAllGenres && (
          <div className="pt-1.5 border-t border-[#E6E1D8] flex flex-wrap gap-1.5 animate-in fade-in duration-200">
            {secondaryGenres.map((g) => {
              const isSelected = value.trim().toLowerCase() === g.toLowerCase();
              const isCustom = customList.some((c) => c.toLowerCase() === g.toLowerCase());
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleSelectGenre(g)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#C86D51] text-white border-[#C86D51] font-bold shadow-2xs'
                      : isCustom
                      ? 'bg-amber-50/70 hover:bg-amber-100 text-amber-900 border-amber-200'
                      : 'bg-[#FAF9F6] hover:bg-[#F4F1EA] text-[#4A443F] hover:text-[#2D2A26] border-[#E6E1D8]'
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5" />}
                  <span>{g}</span>
                  {isCustom && <span className="text-[9px] text-amber-700 font-mono">• meu</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
