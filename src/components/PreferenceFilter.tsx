import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Flame,
  Zap,
  Clock,
  Heart,
  Ban,
  Users,
  ChefHat,
  Sparkles,
  Check,
  Plus,
  X,
} from 'lucide-react';
import { FilterPreferences } from '../types';

interface PreferenceFilterProps {
  preferences: FilterPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<FilterPreferences>>;
  onGenerate: () => void;
  isLoading: boolean;
  canGenerate: boolean;
}

const EQUIPMENT_OPTIONS = [
  { id: '單口瓦斯爐', label: '單口瓦斯爐', icon: '🍳', tip: '一鍋到底・節省台面' },
  { id: '氣炸鍋', label: '氣炸鍋', icon: '🍟', tip: '免顧火・少油香酥' },
  { id: '電鍋', label: '電鍋', icon: '🍚', tip: '無油煙・雙層同蒸' },
  { id: '微波爐', label: '微波爐', icon: '⚡', tip: '極速解熱・快蒸熟化' },
  { id: '雙口瓦斯爐', label: '雙口瓦斯爐', icon: '🔥', tip: '可雙菜齊發' },
  { id: '免開火 (涼拌/即食)', label: '免開火 (涼拌/即食)', icon: '🥗', tip: '零廚具限制' },
  { id: '烤箱', label: '烤箱', icon: '🍞', tip: '香烤焗烤' },
];

const DIETARY_STYLES = [
  { id: '高蛋白增肌', label: '高蛋白增肌', icon: '💪', desc: '鎖定蛋白質・輔助健身修復' },
  { id: '低醣生酮', label: '低醣生酮', icon: '🥑', desc: '控醣低碳・高健康油脂' },
  { id: '均衡家常', label: '均衡家常', icon: '🍱', desc: '色香味全・營養均衡日常' },
  { id: '清淡少油', label: '清淡少油', icon: '🌱', desc: '低卡低鈉・少油煙無負擔' },
  { id: '全素蔬食', label: '全素 / 蛋奶素', icon: '🥬', desc: '無肉無海鮮・純植物鮮甜' },
  { id: '熱炒下酒', label: '台式惹味熱炒', icon: '🌶️', desc: '鹹香開胃・下飯首選' },
];

const TIME_LIMITS = [
  { value: 15, label: '極速 15 分鐘出菜', badge: '快手下班必備', icon: '⚡' },
  { value: 30, label: '30 分鐘以內', badge: '家常最剛好', icon: '⏱️' },
  { value: 45, label: '45+ 分鐘慢煮', badge: '精緻入味深度料理', icon: '🍲' },
];

const QUICK_DISLIKES = [
  '不吃香菜',
  '不吃苦瓜',
  '不吃青椒',
  '海鮮過敏',
  '不吃辣',
  '少油少鹽',
  '不吃內臟',
];

export const PreferenceFilter: React.FC<PreferenceFilterProps> = ({
  preferences,
  setPreferences,
  onGenerate,
  isLoading,
  canGenerate,
}) => {
  const [customDislike, setCustomDislike] = useState<string>('');

  // Toggle Equipment
  const toggleEquipment = (eqId: string) => {
    setPreferences((prev) => {
      const exists = prev.equipment.includes(eqId);
      if (exists) {
        if (prev.equipment.length === 1) return prev; // Keep at least one
        return { ...prev, equipment: prev.equipment.filter((e) => e !== eqId) };
      }
      return { ...prev, equipment: [...prev.equipment, eqId] };
    });
  };

  // Quick Preset Equipment
  const setEquipmentPreset = (presetName: string) => {
    if (presetName === 'single_stove') {
      setPreferences((prev) => ({ ...prev, equipment: ['單口瓦斯爐'] }));
    } else if (presetName === 'dorm_nofire') {
      setPreferences((prev) => ({ ...prev, equipment: ['電鍋', '微波爐', '免開火 (涼拌/即食)'] }));
    } else if (presetName === 'airfryer_lazy') {
      setPreferences((prev) => ({ ...prev, equipment: ['氣炸鍋'] }));
    } else if (presetName === 'all') {
      setPreferences((prev) => ({
        ...prev,
        equipment: ['單口瓦斯爐', '氣炸鍋', '電鍋', '微波爐'],
      }));
    }
  };

  // Toggle Disliked Ingredient Chip
  const toggleDislike = (item: string) => {
    setPreferences((prev) => {
      const exists = prev.dislikedIngredients.includes(item);
      if (exists) {
        return {
          ...prev,
          dislikedIngredients: prev.dislikedIngredients.filter((d) => d !== item),
        };
      }
      return { ...prev, dislikedIngredients: [...prev.dislikedIngredients, item] };
    });
  };

  // Add custom dislike
  const addCustomDislike = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customDislike.trim();
    if (!trimmed) return;
    if (!preferences.dislikedIngredients.includes(trimmed)) {
      setPreferences((prev) => ({
        ...prev,
        dislikedIngredients: [...prev.dislikedIngredients, trimmed],
      }));
    }
    setCustomDislike('');
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-emerald-100/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 text-sm font-bold">
              3
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              客製飲食偏好與設備限制
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              即時條件約束
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            設定手邊現有廚房設備、喜好的飲食流派與時間限制，AI 將嚴格按照規則構思菜單。
          </p>
        </div>

        {/* Quick equipment scenarios */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">快捷情境：</span>
          <button
            type="button"
            onClick={() => setEquipmentPreset('single_stove')}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
          >
            租屋單口爐
          </button>
          <button
            type="button"
            onClick={() => setEquipmentPreset('dorm_nofire')}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
          >
            宿舍無火 (電鍋+微波)
          </button>
          <button
            type="button"
            onClick={() => setEquipmentPreset('airfryer_lazy')}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
          >
            懶人氣炸
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. Equipment Constraints */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              1. 現有設備限制 (可複選)
            </label>
            <span className="text-[11px] text-slate-400">已選：{preferences.equipment.join('、')}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {EQUIPMENT_OPTIONS.map((eq) => {
              const isSelected = preferences.equipment.includes(eq.id);
              return (
                <button
                  key={eq.id}
                  type="button"
                  onClick={() => toggleEquipment(eq.id)}
                  className={`p-2.5 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xl mb-1">{eq.icon}</div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {eq.label}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                    {eq.tip}
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Dietary Style & Time Limit (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Dietary Style */}
          <div className="lg:col-span-7">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              2. 飲食目標與風格
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DIETARY_STYLES.map((style) => {
                const isSelected = preferences.dietaryStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() =>
                      setPreferences((prev) => ({ ...prev, dietaryStyle: style.id }))
                    }
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-base">{style.icon}</span>
                      <span className="text-xs font-bold text-slate-900">
                        {style.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1">
                      {style.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Limit & Servings */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                3. 時間限制
              </label>
              <div className="space-y-1.5">
                {TIME_LIMITS.map((t) => {
                  const isSelected = preferences.timeLimit === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() =>
                        setPreferences((prev) => ({ ...prev, timeLimit: t.value }))
                      }
                      className={`w-full p-2 rounded-xl border flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20 font-bold'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{t.icon}</span>
                        <span className="text-xs text-slate-900 font-bold">
                          {t.label}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200/70 text-slate-600'
                        }`}
                      >
                        {t.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Servings */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-500" /> 料理份量人數：
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
                {[1, 2, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() =>
                      setPreferences((prev) => ({ ...prev, servings: num }))
                    }
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      preferences.servings === num
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {num === 1 ? '1人份' : num === 2 ? '2人份' : '家庭3-4人'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Disliked & Allergy Exclusions */}
        <div>
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Ban className="w-3.5 h-3.5 text-rose-500" />
            4. 排除不吃 / 過敏原 (AI 自動剔除相關做法)
          </label>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {QUICK_DISLIKES.map((item) => {
              const isSelected = preferences.dislikedIngredients.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleDislike(item)}
                  className={`text-xs px-3 py-1 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {isSelected && '✓ '}
                  {item}
                </button>
              );
            })}

            {/* Custom dislikes */}
            {preferences.dislikedIngredients
              .filter((d) => !QUICK_DISLIKES.includes(d))
              .map((custom) => (
                <span
                  key={custom}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl bg-rose-100 text-rose-800 font-bold border border-rose-200"
                >
                  <span>{custom}</span>
                  <button
                    type="button"
                    onClick={() => toggleDislike(custom)}
                    className="hover:text-rose-950"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
          </div>

          {/* Custom Dislike Input */}
          <form onSubmit={addCustomDislike} className="flex gap-2 max-w-sm">
            <input
              type="text"
              placeholder="其他不吃的食材 (如：茄子、韭菜)"
              value={customDislike}
              onChange={(e) => setCustomDislike(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 flex-1"
            />
            <button
              type="submit"
              disabled={!customDislike.trim()}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50"
            >
              加入排除
            </button>
          </form>
        </div>

        {/* Generate Recipe CTA */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onGenerate}
            disabled={isLoading || !canGenerate}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-extrabold text-base tracking-wide shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 hover:scale-[1.005] active:scale-[0.995] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Gemini 正在為您構思精準美味菜單...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>一鍵生成客製主廚菜單 (2~3道精選料理)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
