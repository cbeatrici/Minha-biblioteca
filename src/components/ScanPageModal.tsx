import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, X, Check, RefreshCw, AlertCircle, FileText, Image as ImageIcon, CheckCircle2, Sliders, ChevronDown } from 'lucide-react';
import { Notebook, PageScan, HighlightItem } from '../types';
import { HIGHLIGHT_COLORS, getColorDef, getColorMeaning } from '../data/colorPalette';
import { DEMO_PAGE_SCANS } from '../data/seedData';

interface ScanPageModalProps {
  notebook: Notebook;
  onSaveScan: (scan: PageScan, newHighlights: HighlightItem[]) => void;
  onClose: () => void;
}

export const ScanPageModal: React.FC<ScanPageModalProps> = ({
  notebook,
  onSaveScan,
  onClose,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Scanned / Extracted Result State
  const [scannedResult, setScannedResult] = useState<{
    pageNumber?: number;
    chapter?: string;
    summary?: string;
    fullText: string;
    highlights: {
      text: string;
      colorKey: string;
      style?: 'underline' | 'highlighter' | 'margin' | 'circle';
      topic: string;
      noteSuggestion?: string;
      confidence?: string;
    }[];
  } | null>(null);

  // Editable page metadata
  const [pageNumberInput, setPageNumberInput] = useState<string>('');
  const [chapterInput, setChapterInput] = useState<string>('');
  const [editableHighlights, setEditableHighlights] = useState<
    {
      id: string;
      text: string;
      colorKey: string;
      style?: 'underline' | 'highlighter' | 'margin' | 'circle';
      topic: string;
      userNote: string;
      selected: boolean;
    }[]
  >([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement>(null);

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor, selecione um arquivo de imagem válido (JPEG, PNG, WEBP).');
      return;
    }

    setImageMime(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setScannedResult(null);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  // Start Camera
  const handleStartCamera = async () => {
    try {
      setErrorMessage(null);
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setIsCameraActive(false);
      setErrorMessage('O acesso à câmera não foi concedido ou não está disponível neste dispositivo. Você pode enviar uma foto da galeria ou testar com as páginas de exemplo.');
    }
  };

  // Capture Photo from Camera
  const handleCaptureCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUrl);
      setImageMime('image/jpeg');
      handleStopCamera();
    }
  };

  // Stop Camera
  const handleStopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Load Demo Page Scan
  const handleLoadDemo = (demoIndex: number) => {
    const demo = DEMO_PAGE_SCANS[demoIndex];
    if (!demo) return;
    setSelectedImage(demo.imageSvgDataUri);
    setImageMime('image/svg+xml');
    setScannedResult({
      pageNumber: demo.pageNumber,
      chapter: demo.chapter,
      fullText: demo.sampleFullText,
      summary: 'Página abordando heurísticas experimentais, índices de ancoragem cognitiva e efeitos de memória no Sistema 1.',
      highlights: demo.sampleExtractedHighlights,
    });
    setPageNumberInput(demo.pageNumber ? String(demo.pageNumber) : '');
    setChapterInput(demo.chapter || '');
    setEditableHighlights(
      demo.sampleExtractedHighlights.map((h, i) => ({
        id: `temp-hl-${Date.now()}-${i}`,
        text: h.text,
        colorKey: h.colorKey,
        topic: h.topic,
        userNote: h.noteSuggestion || '',
        selected: true,
      }))
    );
  };

  // Trigger AI Optical OCR and Highlight Extraction
  const handleAnalyzePage = async () => {
    if (!selectedImage) return;

    setIsScanning(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze-page-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: imageMime,
          notebookTitle: notebook.title,
          notebookType: notebook.type,
          author: notebook.author,
          colorLegend: notebook.customColorMeanings,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha ao analisar a página escaneada');
      }

      const result = data.data;
      setScannedResult(result);
      setPageNumberInput(result.pageNumber ? String(result.pageNumber) : '');
      setChapterInput(result.chapter || '');

      setEditableHighlights(
        (result.highlights || []).map((h: any, i: number) => ({
          id: `temp-hl-${Date.now()}-${i}`,
          text: h.text,
          colorKey: h.colorKey?.toLowerCase() || (h.style === 'underline' ? 'neutral' : 'yellow'),
          style: h.style || (h.colorKey === 'neutral' ? 'underline' : 'highlighter'),
          topic: h.topic || 'Geral',
          userNote: h.noteSuggestion || '',
          selected: true,
        }))
      );
    } catch (err: any) {
      console.error('Scan error:', err);
      setErrorMessage(err.message || 'Erro ao processar página');
    } finally {
      setIsScanning(false);
    }
  };

  // Save Scanned Page & Highlights to Notebook
  const handleConfirmSave = () => {
    if (!scannedResult) return;

    const scanId = `scan-${Date.now()}`;
    const pageNum = pageNumberInput ? parseInt(pageNumberInput, 10) : scannedResult.pageNumber;

    const selectedHighlightsToSave: HighlightItem[] = editableHighlights
      .filter((h) => h.selected && h.text.trim())
      .map((h) => ({
        id: `hl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        notebookId: notebook.id,
        scanId: scanId,
        text: h.text.trim(),
        colorKey: h.colorKey,
        style: h.style || 'highlighter',
        topic: h.topic.trim() || 'Geral',
        userNote: h.userNote.trim(),
        pageNumber: pageNum,
        chapter: chapterInput.trim() || scannedResult.chapter,
        createdAt: new Date().toISOString(),
        isFavorite: h.colorKey === 'red' || h.colorKey === 'purple',
      }));

    const pageScanRecord: PageScan = {
      id: scanId,
      notebookId: notebook.id,
      pageNumber: pageNum,
      chapter: chapterInput.trim() || scannedResult.chapter,
      scannedAt: new Date().toISOString(),
      imageUrl: selectedImage || undefined,
      fullText: scannedResult.fullText,
      summary: scannedResult.summary,
      highlights: selectedHighlightsToSave,
    };

    onSaveScan(pageScanRecord, selectedHighlightsToSave);
    handleStopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-[#E6E1D8] rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E6E1D8] flex items-center justify-between bg-[#FAF9F6]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#C86D51]/10 rounded-xl border border-[#C86D51]/20 text-[#C86D51]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#2D2A26]">
                Escanear página e grifos físicos
              </h2>
              <p className="text-xs text-[#78716A]">
                Para a obra: <span className="text-[#A85138] font-medium">{notebook.title}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              handleStopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg text-[#78716A] hover:text-[#2D2A26] hover:bg-[#F4F1EA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-[#4A443F]">
          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Capture / Upload Selection Row */}
          {!selectedImage && !isCameraActive && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Upload Image Option */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group cursor-pointer border-2 border-dashed border-[#DCD6CA] hover:border-[#C86D51] rounded-2xl p-5 text-center space-y-2.5 bg-[#FAF9F6] hover:bg-[#F4F1EA] transition-all flex flex-col items-center justify-center"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-11 h-11 rounded-2xl bg-[#C86D51]/10 border border-[#C86D51]/20 text-[#C86D51] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#2D2A26]">Galeria ou arquivo</h4>
                    <p className="text-xs text-[#78716A] mt-0.5">JPEG, PNG ou WEBP do seu aparelho</p>
                  </div>
                </div>

                {/* Camera Option - with direct native camera trigger for mobile */}
                <div
                  onClick={() => {
                    // If on mobile browser, launch native camera file picker
                    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                      mobileCameraInputRef.current?.click();
                    } else {
                      handleStartCamera();
                    }
                  }}
                  className="group cursor-pointer border-2 border-dashed border-[#DCD6CA] hover:border-[#C86D51] rounded-2xl p-5 text-center space-y-2.5 bg-[#FAF9F6] hover:bg-[#F4F1EA] transition-all flex flex-col items-center justify-center"
                >
                  <input
                    ref={mobileCameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-11 h-11 rounded-2xl bg-[#6A8E6B]/15 border border-[#6A8E6B]/30 text-[#4E7050] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#2D2A26]">Tirar foto com a câmera</h4>
                    <p className="text-xs text-[#78716A] mt-0.5">Fotografe diretamente a página com seu celular ou webcam</p>
                  </div>
                </div>
              </div>

              {/* Sample Demo Pages for Instant One-Click Testing */}
              <div className="pt-3 border-t border-[#E6E1D8]">
                <p className="text-xs text-[#78716A] mb-2 font-medium">
                  Ou teste imediatamente com páginas de exemplo:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DEMO_PAGE_SCANS.map((demo, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleLoadDemo(idx)}
                      className="flex items-center gap-3 p-2.5 bg-[#FAF9F6] hover:bg-[#F4F1EA] border border-[#E6E1D8] hover:border-[#C86D51]/40 rounded-xl text-left transition-colors text-xs"
                    >
                      <ImageIcon className="w-4 h-4 text-[#C86D51] flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="font-semibold text-[#2D2A26] block truncate">{demo.title}</span>
                        <span className="text-[11px] text-[#78716A]">Página {demo.pageNumber} • Grifos multicores</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active Camera Viewfinder */}
          {isCameraActive && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-black border border-[#E6E1D8] aspect-video max-h-96 flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                {/* Guide Reticle */}
                <div className="absolute inset-8 border border-white/30 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="text-[11px] bg-black/60 text-white px-2 py-1 rounded backdrop-blur-sm">
                    Alinhe a página do livro dentro do quadro
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleCaptureCamera}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#C86D51] hover:bg-[#B35C42] text-white font-bold rounded-xl shadow-xs transition-transform active:scale-95 text-xs"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capturar foto</span>
                </button>
                <button
                  onClick={handleStopCamera}
                  className="px-4 py-2.5 bg-[#FAF9F6] hover:bg-[#F4F1EA] text-[#4A443F] border border-[#E6E1D8] rounded-xl text-xs font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Selected Image & OCR Scan Actions */}
          {selectedImage && (
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row gap-5">
                {/* Image Preview */}
                <div className="md:w-1/3 flex flex-col space-y-2">
                  <div className="relative rounded-2xl overflow-hidden border border-[#E6E1D8] bg-[#FAF9F6] max-h-72 flex items-center justify-center p-2">
                    <img
                      src={selectedImage}
                      alt="Página escaneada"
                      className="max-h-64 object-contain rounded-lg"
                    />

                    {/* Scanning Laser Animation */}
                    {isScanning && (
                      <div className="absolute inset-0 bg-[#C86D51]/10 pointer-events-none flex flex-col justify-center items-center">
                        <div className="w-full h-1 bg-[#C86D51] shadow-lg shadow-[#C86D51] animate-pulse" />
                        <span className="mt-3 px-2 py-1 bg-white/90 text-[#A85138] text-xs font-mono rounded border border-[#C86D51]/30">
                          Identificando cores e extraindo grifos...
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setScannedResult(null);
                      }}
                      className="flex-1 px-3 py-1.5 text-xs text-[#78716A] hover:text-[#2D2A26] bg-[#FAF9F6] hover:bg-[#F4F1EA] border border-[#E6E1D8] rounded-lg transition-colors"
                    >
                      Trocar foto
                    </button>
                    {!scannedResult && (
                      <button
                        onClick={handleAnalyzePage}
                        disabled={isScanning}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#C86D51] hover:bg-[#B35C42] text-white rounded-lg shadow-xs transition-colors disabled:opacity-50"
                      >
                        {isScanning ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Processando...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Extrair grifos</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Scanned Breakdown & Editable Highlights */}
                <div className="md:w-2/3 space-y-4">
                  {scannedResult ? (
                    <div className="space-y-4">
                      {/* Page Info Metadata */}
                      <div className="grid grid-cols-2 gap-3 bg-[#FAF9F6] p-3 rounded-xl border border-[#E6E1D8]">
                        <div>
                          <label className="block text-[10px] text-[#78716A] font-mono mb-1">
                            Número da página
                          </label>
                          <input
                            type="number"
                            value={pageNumberInput}
                            onChange={(e) => setPageNumberInput(e.target.value)}
                            placeholder="Ex: 119"
                            className="w-full px-2.5 py-1 text-xs bg-white border border-[#DCD6CA] rounded-lg text-[#2D2A26] focus:ring-1 focus:ring-[#C86D51]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-[#78716A] font-mono mb-1">
                            Capítulo ou seção
                          </label>
                          <input
                            type="text"
                            value={chapterInput}
                            onChange={(e) => setChapterInput(e.target.value)}
                            placeholder="Ex: Capítulo 11: Âncoras"
                            className="w-full px-2.5 py-1 text-xs bg-white border border-[#DCD6CA] rounded-lg text-[#2D2A26] focus:ring-1 focus:ring-[#C86D51]"
                          />
                        </div>
                      </div>

                      {/* Summary */}
                      {scannedResult.summary && (
                        <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#E6E1D8]">
                          <span className="text-[10px] font-mono text-[#A85138] block mb-0.5 font-bold">
                            Resumo da página
                          </span>
                          <p className="text-xs text-[#4A443F] italic">{scannedResult.summary}</p>
                        </div>
                      )}

                      {/* Detected Highlights Section */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-[#2D2A26] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#C86D51]" />
                            Grifos detectados ({editableHighlights.length})
                          </h4>
                          <span className="text-[11px] text-[#78716A]">
                            Selecione e ajuste antes de salvar
                          </span>
                        </div>

                        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                          {editableHighlights.map((hl, idx) => {
                            const colorDef = getColorDef(hl.colorKey);
                            const meaning = getColorMeaning(hl.colorKey, notebook.customColorMeanings);

                            return (
                              <div
                                key={hl.id}
                                className={`p-3 rounded-xl border transition-all ${
                                  hl.selected ? `${colorDef.lightBgClass} ${colorDef.borderClass}` : 'bg-[#FAF9F6] border-[#E6E1D8] opacity-60'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={hl.selected}
                                      onChange={(e) => {
                                        const checked = e.target.checked;
                                        setEditableHighlights((prev) =>
                                          prev.map((item, i) =>
                                            i === idx ? { ...item, selected: checked } : item
                                          )
                                        );
                                      }}
                                      className="rounded text-[#C86D51] focus:ring-[#C86D51] w-3.5 h-3.5"
                                    />
                                    {/* Color / Neutral Badge */}
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 ${colorDef.badgeClass}`}
                                    >
                                      <span className={`w-1.5 h-1.5 rounded-full ${colorDef.dotClass}`} />
                                      <span className="capitalize">{hl.colorKey === 'neutral' ? 'Sem cor' : hl.colorKey}</span>
                                    </span>

                                    {/* Style Badge */}
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 text-[#5C554E] font-mono border border-black/5">
                                      {hl.style === 'underline' && '✏️ Sublinhado'}
                                      {hl.style === 'highlighter' && '🖍️ Marca-texto'}
                                      {hl.style === 'margin' && '📐 Margem'}
                                      {hl.style === 'circle' && '⭕ Círculo'}
                                      {!hl.style && '🖍️ Grifo'}
                                    </span>

                                    <span className="text-[11px] text-[#78716A] truncate max-w-xs font-sans">
                                      ({meaning})
                                    </span>
                                  </div>

                                  {/* Selectors: Style & Color */}
                                  <div className="flex items-center gap-1.5">
                                    {/* Style selector */}
                                    <select
                                      value={hl.style || 'highlighter'}
                                      onChange={(e) => {
                                        const newStyle = e.target.value as any;
                                        setEditableHighlights((prev) =>
                                          prev.map((item, i) =>
                                            i === idx
                                              ? {
                                                  ...item,
                                                  style: newStyle,
                                                  colorKey: newStyle === 'underline' && item.colorKey === 'yellow' ? 'neutral' : item.colorKey,
                                                }
                                              : item
                                          )
                                        );
                                      }}
                                      className="text-[10px] bg-white border border-[#DCD6CA] rounded px-1.5 py-0.5 text-[#2D2A26]"
                                      title="Tipo de grifo físico"
                                    >
                                      <option value="highlighter">Marca-texto</option>
                                      <option value="underline">Sublinhado</option>
                                      <option value="margin">Margem [ ]</option>
                                      <option value="circle">Circulado</option>
                                    </select>

                                    {/* Color selector */}
                                    <select
                                      value={hl.colorKey}
                                      onChange={(e) => {
                                        const newColor = e.target.value;
                                        setEditableHighlights((prev) =>
                                          prev.map((item, i) =>
                                            i === idx ? { ...item, colorKey: newColor } : item
                                          )
                                        );
                                      }}
                                      className="text-[10px] bg-white border border-[#DCD6CA] rounded px-1.5 py-0.5 text-[#2D2A26]"
                                      title="Cor da marcação (opcional)"
                                    >
                                      <option value="neutral">Sem cor (lápis ou caneta)</option>
                                      {HIGHLIGHT_COLORS.map((c) => (
                                        <option key={c.key} value={c.key}>
                                          {c.key.toUpperCase()}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                {/* Highlight Quote Text */}
                                <textarea
                                  value={hl.text}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditableHighlights((prev) =>
                                      prev.map((item, i) =>
                                        i === idx ? { ...item, text: val } : item
                                      )
                                    );
                                  }}
                                  rows={2}
                                  className="w-full text-xs bg-white border border-[#DCD6CA] rounded p-1.5 text-[#2D2A26] font-serif leading-relaxed focus:ring-1 focus:ring-[#C86D51]"
                                />

                                {/* Topic & User Note */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                  <input
                                    type="text"
                                    value={hl.topic}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setEditableHighlights((prev) =>
                                        prev.map((item, i) =>
                                          i === idx ? { ...item, topic: val } : item
                                        )
                                      );
                                    }}
                                    placeholder="Tópico / tema..."
                                    className="text-xs bg-white border border-[#DCD6CA] rounded px-2 py-1 text-[#2D2A26]"
                                  />
                                  <input
                                    type="text"
                                    value={hl.userNote}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setEditableHighlights((prev) =>
                                        prev.map((item, i) =>
                                          i === idx ? { ...item, userNote: val } : item
                                        )
                                      );
                                    }}
                                    placeholder="Comentário pessoal ou reflexão..."
                                    className="text-xs bg-white border border-[#DCD6CA] rounded px-2 py-1 text-[#2D2A26]"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 bg-[#FAF9F6] rounded-2xl border border-[#E6E1D8] text-center space-y-3">
                      <FileText className="w-8 h-8 text-[#A8A29E]" />
                      <div>
                        <h4 className="text-sm font-medium text-[#2D2A26]">Pronto para escanear</h4>
                        <p className="text-xs text-[#78716A] max-w-xs mt-1">
                          Clique em "Extrair grifos" para transcrever o texto da página e identificar as passagens grifadas de acordo com as cores.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#E6E1D8] bg-[#FAF9F6] flex items-center justify-between">
          <button
            onClick={() => {
              handleStopCamera();
              onClose();
            }}
            className="px-4 py-2 text-xs font-medium text-[#78716A] hover:text-[#2D2A26] transition-colors"
          >
            Cancelar
          </button>

          {scannedResult && (
            <button
              onClick={handleConfirmSave}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-[#C86D51] hover:bg-[#B35C42] text-white rounded-xl shadow-xs transition-transform active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>
                Salvar {editableHighlights.filter((h) => h.selected).length} citações no livro
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
