import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Maximize2,
  SlidersHorizontal,
  X,
  Layers,
} from 'lucide-react';
import { IngredientItem } from '../types';
import { SAMPLE_SCENARIOS, SampleFridgeScenario } from '../data/samples';

interface PhotoScannerProps {
  onIngredientsDetected: (items: IngredientItem[], summary: string, imageUrl: string) => void;
  hoveredItemId: string | null;
  setHoveredItemId: (id: string | null) => void;
}

export const PhotoScanner: React.FC<PhotoScannerProps> = ({
  onIngredientsDetected,
  hoveredItemId,
  setHoveredItemId,
}) => {
  const [currentImage, setCurrentImage] = useState<string>(SAMPLE_SCENARIOS[0].imageUrl);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [detectedBoxes, setDetectedBoxes] = useState<IngredientItem[]>(SAMPLE_SCENARIOS[0].items);
  const [aiSummary, setAiSummary] = useState<string>(
    '已為您辨識 6 項食材，並自動標註框選位置。高麗菜半顆與板豆腐建議優先烹調！'
  );
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);

  // Initialize with the first sample
  useEffect(() => {
    // Notify parent initially
    onIngredientsDetected(SAMPLE_SCENARIOS[0].items, aiSummary, SAMPLE_SCENARIOS[0].imageUrl);
  }, []);

  // Handle Preset Sample selection
  const handleSelectSample = async (scenario: SampleFridgeScenario) => {
    stopCamera();
    setCurrentImage(scenario.imageUrl);
    setDetectedBoxes(scenario.items);
    setErrorMsg(null);
    const summary = `載入【${scenario.name}】：共辨識 ${scenario.items.length} 項食材，已自動填入清單。`;
    setAiSummary(summary);
    onIngredientsDetected(scenario.items, summary, scenario.imageUrl);
  };

  // Convert File to Base64 and trigger AI analysis
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopCamera();
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setCurrentImage(base64);
      await analyzePhoto(base64, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Start Camera
  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setErrorMsg('無法開啟相機，請確認已授予相機權限，或直接選擇拍照上傳。');
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Take Snapshot from camera
  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', 0.9);
    stopCamera();
    setCurrentImage(base64);
    await analyzePhoto(base64, 'image/jpeg');
  };

  // Send to server for multimodal detection
  const analyzePhoto = async (base64Data: string, mimeType: string) => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/analyze-fridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data, mimeType }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'AI 辨識食材失敗');
      }

      const data = await res.json();
      const detectedItems: IngredientItem[] = (data.items || []).map((item: any, idx: number) => ({
        id: item.id || `item-ai-${Date.now()}-${idx}`,
        name: item.name,
        category: item.category || 'other',
        quantity: item.quantity || 1,
        unit: item.unit || '個',
        confidence: item.confidence || 0.9,
        freshStatus: item.freshStatus || 'fresh',
        box: item.box || { ymin: 100, xmin: 100, ymax: 400, xmax: 400 },
        selected: true,
      }));

      setDetectedBoxes(detectedItems);
      const summaryText =
        data.summary ||
        `AI 辨識完成！共偵測到 ${detectedItems.length} 項食材，已自動標註並填入食材清單。`;
      setAiSummary(summaryText);
      onIngredientsDetected(detectedItems, summaryText, base64Data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '辨識過程發生問題，請嘗試重新拍攝或選擇清晰的冰箱照片。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-emerald-100/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 text-sm font-bold">
              1
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              照片辨識一鍵盤點
            </h2>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-600" /> 多模態視覺 AI
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            拍照或上傳冰箱內部照片，AI 自動框選並辨識食材種類與數量，自動填入清單。
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          {!cameraActive ? (
            <button
              type="button"
              onClick={startCamera}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>啟動相機拍照</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={capturePhoto}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>立即拍攝並分析</span>
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="p-2 text-slate-500 hover:text-slate-700 bg-slate-100 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-all border border-emerald-200/60"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>上傳照片</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBoxes(!showBoxes)}
            title={showBoxes ? '隱藏框選標籤' : '顯示框選標籤'}
            className={`p-2 rounded-xl border transition-all ${
              showBoxes
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Fast Sample Selector */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
          <span className="flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            或點選範例冰箱體驗一鍵盤點：
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold">隨選即測免拍照</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {SAMPLE_SCENARIOS.map((scenario) => {
            const isSelected = currentImage === scenario.imageUrl;
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => handleSelectSample(scenario)}
                className={`text-left p-2.5 rounded-2xl border transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <img
                  src={scenario.imageUrl}
                  alt={scenario.name}
                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {scenario.name}
                    </span>
                    <span className="text-[10px] bg-white text-emerald-700 font-medium px-1.5 py-0.5 rounded-md border border-emerald-200 shrink-0">
                      {scenario.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {scenario.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Visual Display & Interactive Bounding Boxes */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-inner group">
        {cameraActive ? (
          <div className="relative aspect-video w-full bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 border-2 border-dashed border-emerald-400/60 pointer-events-none flex items-center justify-center">
              <span className="bg-black/70 text-emerald-300 text-xs px-3 py-1.5 rounded-full font-medium backdrop-blur-xs">
                對準冰箱內部，保持光線充足
              </span>
            </div>
          </div>
        ) : (
          <div
            ref={imageContainerRef}
            className="relative aspect-video sm:aspect-21/9 w-full bg-slate-900 select-none overflow-hidden"
          >
            {/* Image */}
            <img
              src={currentImage}
              alt="冰箱食材拍攝照片"
              className="w-full h-full object-cover transition-opacity duration-300"
            />

            {/* Scanning radar line animation during AI analysis */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-xs flex flex-col items-center justify-center z-30">
                <div className="relative w-20 h-20 mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-400/20 animate-ping"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-emerald-400 border-r-transparent border-b-teal-400 border-l-transparent animate-spin"></div>
                  <div className="absolute inset-3 rounded-full bg-emerald-600/30 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-emerald-300 animate-pulse" />
                  </div>
                </div>
                <p className="text-white font-bold text-base tracking-wide flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  Gemini 視覺模型辨識中...
                </p>
                <p className="text-emerald-200/80 text-xs mt-1">
                  正在框選食材、判讀份量與新鮮度狀態
                </p>
              </div>
            )}

            {/* Interactive Bounding Boxes Overlay */}
            {showBoxes &&
              !isAnalyzing &&
              detectedBoxes.map((item) => {
                if (!item.box) return null;
                const { ymin, xmin, ymax, xmax } = item.box;
                const top = `${ymin / 10}%`;
                const left = `${xmin / 10}%`;
                const width = `${(xmax - xmin) / 10}%`;
                const height = `${(ymax - ymin) / 10}%`;

                const isHovered = hoveredItemId === item.id;
                const isUrgent = item.freshStatus === 'use_soon';

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredItemId(item.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                    style={{ top, left, width, height }}
                    className={`absolute border-2 transition-all duration-200 cursor-pointer rounded-lg z-20 ${
                      isHovered
                        ? 'border-amber-400 bg-amber-400/25 ring-4 ring-amber-400/30 scale-[1.02]'
                        : isUrgent
                        ? 'border-orange-400 bg-orange-400/15 shadow-sm'
                        : 'border-emerald-400 bg-emerald-400/15 shadow-sm'
                    }`}
                  >
                    {/* Bounding box label badge */}
                    <div
                      className={`absolute -top-6 left-0 px-2 py-0.5 rounded-md text-[11px] font-bold text-white shadow-md flex items-center gap-1 whitespace-nowrap transition-transform ${
                        isHovered
                          ? 'bg-amber-600 scale-105 z-30'
                          : isUrgent
                          ? 'bg-orange-600'
                          : 'bg-emerald-600'
                      }`}
                    >
                      <span>{item.name}</span>
                      <span className="opacity-90 font-normal">
                        {item.quantity} {item.unit}
                      </span>
                      {item.confidence && (
                        <span className="text-[9px] bg-black/30 px-1 rounded-sm">
                          {Math.round(item.confidence * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* AI Insight summary bar */}
        <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2.5 flex items-center justify-between text-xs text-white border-t border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-emerald-300">AI 盤點洞察：</span>
            <span className="text-slate-200 line-clamp-1">{aiSummary}</span>
          </div>
          <span className="text-slate-400 text-[11px] hidden sm:block">
            {detectedBoxes.length} 個標記食材
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
