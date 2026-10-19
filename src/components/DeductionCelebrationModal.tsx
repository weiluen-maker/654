import React from 'react';
import { CheckCircle2, Sparkles, ArrowRight, Refrigerator, X, Flame } from 'lucide-react';
import { Recipe, IngredientItem } from '../types';

export interface DeductionRecord {
  name: string;
  beforeQty: number;
  afterQty: number;
  deductedQty: number;
  unit: string;
  isDepleted: boolean;
}

interface DeductionCelebrationModalProps {
  recipe: Recipe;
  records: DeductionRecord[];
  onClose: () => void;
}

export const DeductionCelebrationModal: React.FC<DeductionCelebrationModalProps> = ({
  recipe,
  records,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Banner */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white mb-3 shadow-inner">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl font-black tracking-tight">大廚手藝，料理成功！</h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            已為您順利完成《{recipe.title}》，冰箱食材庫存已自動精算扣除。
          </p>
        </div>

        {/* Deductions Breakdown */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Refrigerator className="w-4 h-4 text-emerald-600" />
              本次料理扣除明細
            </span>
            <span className="text-slate-400">一鍵食材減法</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {records.map((rec, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-sm font-bold text-slate-900">{rec.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <span>原存 {rec.beforeQty}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className={rec.isDepleted ? 'text-rose-600 font-bold' : 'text-slate-800 font-semibold'}>
                      剩餘 {rec.afterQty} {rec.unit}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-0.5 text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
                    -{rec.deductedQty} {rec.unit}
                  </span>
                  {rec.isDepleted && (
                    <div className="text-[10px] text-rose-600 font-bold mt-0.5">
                      庫存已用罄
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              盤點清單已即時同步更新！若要規劃下一餐，隨時可以點選上方「一鍵生成客製菜單」繼續開煮。
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-900 text-white font-extrabold text-sm hover:bg-slate-800 transition-all shadow-md"
          >
            太棒了！返回冰箱首頁
          </button>
        </div>
      </div>
    </div>
  );
};
