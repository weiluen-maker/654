import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  ChefHat,
  Volume2,
  Sparkles,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { Recipe, RecipeStep } from '../types';
import { playKitchenChime } from '../data/samples';

interface CookingModeModalProps {
  recipe: Recipe;
  onClose: () => void;
  onFinishCooking: (recipe: Recipe) => void;
}

export const CookingModeModal: React.FC<CookingModeModalProps> = ({
  recipe,
  onClose,
  onFinishCooking,
}) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeTimerSeconds, setActiveTimerSeconds] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerLabel, setTimerLabel] = useState<string>('');

  // Handle timer countdown
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && activeTimerSeconds !== null && activeTimerSeconds > 0) {
      interval = setInterval(() => {
        setActiveTimerSeconds((prev) => {
          if (prev === null || prev <= 1) {
            setTimerRunning(false);
            playKitchenChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, activeTimerSeconds]);

  const startStepTimer = (seconds: number, label: string) => {
    setActiveTimerSeconds(seconds);
    setTimerLabel(label);
    setTimerRunning(true);
    playKitchenChime();
  };

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber) ? prev.filter((s) => s !== stepNumber) : [...prev, stepNumber]
    );
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isAllStepsCompleted = completedSteps.length === recipe.steps.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                  廚房大字烹飪模式
                </span>
                <span className="text-xs text-slate-400">
                  預估 {recipe.timeMinutes} 分鐘
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                {recipe.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Timer Bar if active */}
        {activeTimerSeconds !== null && (
          <div
            className={`p-4 border-b flex items-center justify-between shrink-0 transition-colors ${
              activeTimerSeconds === 0
                ? 'bg-rose-50 border-rose-200 text-rose-900 animate-pulse'
                : 'bg-emerald-950 text-emerald-100 border-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock
                className={`w-5 h-5 ${
                  activeTimerSeconds === 0 ? 'text-rose-600' : 'text-emerald-400'
                }`}
              />
              <div>
                <span className="text-xs font-semibold opacity-80">
                  {timerLabel || '烹飪計時'}
                </span>
                <div className="text-2xl font-black font-mono tracking-wider">
                  {formatTimer(activeTimerSeconds)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeTimerSeconds > 0 ? (
                <button
                  type="button"
                  onClick={() => setTimerRunning(!timerRunning)}
                  className={`p-2.5 rounded-xl font-bold flex items-center gap-1.5 text-xs ${
                    timerRunning
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600'
                  }`}
                >
                  {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{timerRunning ? '暫停' : '繼續'}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-700">時間到！請注意火候</span>
                  <button
                    type="button"
                    onClick={() => setActiveTimerSeconds(null)}
                    className="p-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-bold"
                  >
                    關閉
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setActiveTimerSeconds(null);
                  setTimerRunning(false);
                }}
                className="p-2 text-slate-400 hover:text-white rounded-xl"
                title="重設/關閉"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Chef Secret Header */}
          <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">主廚關鍵秘訣：</span>
              <span>{recipe.chefSecret}</span>
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>料理步驟清單 (點選完成勾選)</span>
              <span className="text-xs text-emerald-700 font-bold">
                進度：{completedSteps.length} / {recipe.steps.length}
              </span>
            </h3>

            {recipe.steps.map((step) => {
              const isDone = completedSteps.includes(step.stepNumber);
              return (
                <div
                  key={step.stepNumber}
                  onClick={() => toggleStep(step.stepNumber)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    isDone
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-emerald-300 shadow-xs'
                  }`}
                >
                  <div className="pt-0.5 shrink-0">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {isDone ? '✓' : step.stepNumber}
                    </div>
                  </div>

                  <div className="flex-1">
                    <p
                      className={`text-base font-semibold text-slate-900 leading-relaxed ${
                        isDone ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {step.instruction}
                    </p>

                    {step.tip && (
                      <p className="text-xs text-amber-800 bg-amber-50/70 p-2 rounded-xl mt-2 border border-amber-200/50">
                        💡 貼心提醒：{step.tip}
                      </p>
                    )}

                    {step.timerSeconds && step.timerSeconds > 0 && (
                      <div className="mt-2.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            startStepTimer(
                              step.timerSeconds!,
                              `步驟 ${step.stepNumber} 計時 (${Math.round(
                                step.timerSeconds! / 60
                              )} 分鐘)`
                            );
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            啟動此步驟計時器 ({Math.round(step.timerSeconds / 60)} 分鐘)
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            完成所有步驟後，點選下方按鈕自動將耗損食材從冰箱中扣除！
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
            >
              稍後繼續
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onFinishCooking(recipe);
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-extrabold hover:bg-emerald-500 shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>🎉 我煮好了！扣除食材庫存</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
