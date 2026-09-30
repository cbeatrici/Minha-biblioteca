import React, { useState } from 'react';
import { Palette, Edit3, Check, RotateCcw, HelpCircle } from 'lucide-react';
import { HIGHLIGHT_COLORS, getColorDef } from '../data/colorPalette';

interface ColorLegendEditorProps {
  customMeanings: Record<string, string>;
  onUpdateMeanings: (meanings: Record<string, string>) => void;
  compact?: boolean;
}

export const ColorLegendEditor: React.FC<ColorLegendEditorProps> = ({
  customMeanings,
  onUpdateMeanings,
  compact = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempMeanings, setTempMeanings] = useState<Record<string, string>>({ ...customMeanings });

  const handleSave = () => {
    onUpdateMeanings(tempMeanings);
    setIsEditing(false);
  };

  const handleResetDefaults = () => {
    const defaults: Record<string, string> = {};
    HIGHLIGHT_COLORS.forEach((c) => {
      defaults[c.key] = c.defaultMeaning;
    });
    setTempMeanings(defaults);
    onUpdateMeanings(defaults);
    setIsEditing(false);
  };

  return (
    <div className="bg-white border border-[#E6E1D8] rounded-2xl p-4 sm:p-5 shadow-xs text-[#4A443F]">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#C86D51]/10 rounded-lg border border-[#C86D51]/20 text-[#C86D51]">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#2D2A26] flex items-center gap-1.5">
              Highlight Color Taxonomy
              <span className="text-[10px] font-normal text-[#78716A] bg-[#FAF9F6] border border-[#E6E1D8] px-1.5 py-0.5 rounded">
                Customizable
              </span>
            </h3>
            <p className="text-xs text-[#78716A]">
              When scanning photos, Lumina automatically detects these colors and classifies text.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => {
                setTempMeanings({ ...customMeanings });
                setIsEditing(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#A85138] hover:text-[#C86D51] bg-[#C86D51]/10 hover:bg-[#C86D51]/20 border border-[#C86D51]/30 rounded-lg transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Meanings</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleResetDefaults}
                className="flex items-center gap-1 px-2 py-1 text-xs text-[#78716A] hover:text-[#2D2A26] bg-[#FAF9F6] hover:bg-[#F4F1EA] border border-[#E6E1D8] rounded-lg transition-colors"
                title="Reset to default meanings"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Defaults</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-[#C86D51] hover:bg-[#B35C42] text-white rounded-lg transition-colors shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`grid gap-2.5 ${compact ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {HIGHLIGHT_COLORS.map((color) => {
          const currentMeaning = isEditing
            ? tempMeanings[color.key] ?? color.defaultMeaning
            : customMeanings[color.key] || color.defaultMeaning;

          return (
            <div
              key={color.key}
              className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all ${
                color.lightBgClass
              } ${color.borderClass}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                <span
                  className="w-4 h-4 rounded-full inline-block shadow-xs ring-2 ring-white"
                  style={{ backgroundColor: color.hex }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-[#2D2A26] capitalize tracking-wide">
                    {color.key}
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-wider opacity-60">
                    {color.name.split('/')[0]}
                  </span>
                </div>

                {isEditing ? (
                  <input
                    type="text"
                    value={currentMeaning}
                    onChange={(e) =>
                      setTempMeanings((prev) => ({
                        ...prev,
                        [color.key]: e.target.value,
                      }))
                    }
                    className="w-full mt-1.5 px-2 py-1 text-xs bg-white border border-[#DCD6CA] rounded text-[#2D2A26] focus:outline-none focus:ring-1 focus:ring-[#C86D51]"
                    placeholder={`Meaning for ${color.key}...`}
                  />
                ) : (
                  <p className="text-xs text-[#4A443F] font-sans mt-0.5 line-clamp-2 leading-relaxed">
                    {currentMeaning}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
