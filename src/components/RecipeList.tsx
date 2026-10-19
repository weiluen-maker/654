import React, { useState } from 'react';
import {
  ChefHat,
  Clock,
  Flame,
  Sparkles,
  Shuffle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CookingPot,
  Scale,
  RefreshCw,
  X,
  MessageCircle,
} from 'lucide-react';
import { Recipe, IngredientItem, FilterPreferences } from '../types';
import { CookingModeModal } from './CookingModeModal';
import { DeductionCelebrationModal, DeductionRecord } from './DeductionCelebrationModal';

interface RecipeListProps {
  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  ingredients: IngredientItem[];
  setIngredients: React.Dispatch<React.SetStateAction<IngredientItem[]>>;
  preferences: FilterPreferences;
}

const SWAP_PRESETS = [
  '這道我不喜歡，換一道不用開火的',
  '想吃重口味、辣一點下飯',
  '換成氣炸鍋料理，免顧火少油煙',
  '不想洗太多鍋子，換成一鍋到底料理',
  '換一道高蛋白、更低熱量的減脂菜',
  '換成清淡暖胃的湯品或蒸料理',
];

export const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  setRecipes,
  ingredients,
  setIngredients,
  preferences,
}) => {
  const [expandedRecipeIds, setExpandedRecipeIds] = useState<string[]>([]);
  const [swappingRecipeId, setSwappingRecipeId] = useState<string | null>(null);
  const [swapModalRecipe, setSwapModalRecipe] = useState<Recipe | null>(null);
  const [customSwapText, setCustomSwapText] = useState<string>('');
  const [isSwapping, setIsSwapping] = useState<boolean>(false);

  // Modals
  const [cookingModalRecipe, setCookingModalRecipe] = useState<Recipe | null>(null);
  const [celebrationData, setCelebrationData] = useState<{
    recipe: Recipe;
    records: DeductionRecord[];
  } | null>(null);

  // Toggle step expansion
  const toggleExpand = (id: string) => {
    setExpandedRecipeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Open Swap Modal
  const handleOpenSwapModal = (recipe: Recipe) => {
    setSwapModalRecipe(recipe);
    setCustomSwapText('');
  };

  // Perform dynamic recipe swap
  const executeSwap = async (instruction: string) => {
    if (!swapModalRecipe) return;
    setIsSwapping(true);
    setSwappingRecipeId(swapModalRecipe.id);

    try {
      const res = await fetch('/api/swap-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldRecipe: swapModalRecipe,
          swapInstruction: instruction,
          remainingIngredients: ingredients.filter((i) => i.selected && i.quantity > 0),
          equipment: preferences.equipment,
          dietaryStyle: preferences.dietaryStyle,
          timeLimit: preferences.timeLimit,
          servings: preferences.servings,
        }),
      });

      if (!res.ok) {
        throw new Error('動態換菜失敗');
      }

      const data = await res.json();
      if (data.recipe) {
        setRecipes((prev) =>
          prev.map((r) => (r.id === swapModalRecipe.id ? data.recipe : r))
        );
        // Expand new recipe
        setExpandedRecipeIds((prev) => [...prev, data.recipe.id]);
      }
      setSwapModalRecipe(null);
    } catch (err: any) {
      console.error(err);
      alert('動態換菜遇到問題，請稍候重試。');
    } finally {
      setIsSwapping(false);
      setSwappingRecipeId(null);
    }
  };

  // Stock Deduction (一鍵食材減法)
  const handleFinishCooking = (recipe: Recipe) => {
    const records: DeductionRecord[] = [];

    setIngredients((prev) => {
      return prev.map((item) => {
        // Look for matching used ingredient by name or substring
        const used = recipe.usedIngredients.find(
          (u) =>
            u.name.toLowerCase().includes(item.name.toLowerCase()) ||
            item.name.toLowerCase().includes(u.name.toLowerCase())
        );

        if (!used) return item;

        const deductAmount = Number(used.quantityUsed) || 1;
        const newQty = Math.max(0, Math.round((item.quantity - deductAmount) * 10) / 10);

        records.push({
          name: item.name,
          beforeQty: item.quantity,
          afterQty: newQty,
          deductedQty: deductAmount,
          unit: item.unit,
          isDepleted: newQty <= 0,
        });

        return {
          ...item,
          quantity: newQty,
          // if depleted, unselect
          selected: newQty > 0 ? item.selected : false,
        };
      });
    });

    setCelebrationData({
      recipe,
      records:
        records.length > 0
          ? records
          : recipe.usedIngredients.map((u) => ({
              name: u.name,
              beforeQty: u.quantityUsed,
              afterQty: 0,
              deductedQty: u.quantityUsed,
              unit: u.unit,
              isDepleted: true,
            })),
    });
  };

  if (recipes.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-emerald-100/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 text-sm font-bold">
              4
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              智慧客製料理菜單
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              共 {recipes.length} 道精選
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            專為您現有食材與條件設計。不喜歡隨時點選「動態換菜」，料理完畢一鍵扣除庫存。
          </p>
        </div>
      </div>

      {/* Recipe Cards List */}
      <div className="space-y-6">
        {recipes.map((recipe, index) => {
          const isExpanded = expandedRecipeIds.includes(recipe.id);
          const isThisSwapping = swappingRecipeId === recipe.id;

          return (
            <div
              key={recipe.id}
              className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                isThisSwapping
                  ? 'border-amber-400 bg-amber-50/40 animate-pulse'
                  : 'border-slate-200 bg-white hover:border-emerald-300 shadow-sm'
              }`}
            >
              {/* Recipe Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-b from-slate-50/80 to-white border-b border-slate-100">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <span className="w-9 h-9 rounded-2xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      0{index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                          {recipe.difficulty}
                        </span>
                        {recipe.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                        {recipe.title}
                      </h3>
                      <p className="text-xs sm:text-sm font-medium text-emerald-800 mt-0.5">
                        {recipe.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Quick Meta Pills */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>約 {recipe.timeMinutes} 分鐘</span>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                      <CookingPot className="w-3.5 h-3.5 text-amber-600" />
                      <span>{recipe.equipmentNeeded.join('、')}</span>
                    </div>

                    {/* Dynamic Swap Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenSwapModal(recipe)}
                      disabled={isThisSwapping}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all shadow-xs"
                    >
                      <Shuffle className="w-3.5 h-3.5 text-amber-600" />
                      <span>這道我不喜歡，換一道</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                  {recipe.description}
                </p>

                {/* Nutrition Row */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="font-extrabold text-slate-900 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-rose-500" />
                      熱量：{recipe.nutrition.calories} kcal
                    </span>
                    <span>蛋白質：{recipe.nutrition.protein}g</span>
                    <span>碳水：{recipe.nutrition.carbs}g</span>
                    <span>脂肪：{recipe.nutrition.fat}g</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleExpand(recipe.id)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <span>{isExpanded ? '收合料理步驟' : '展開完整步驟與備料'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Ingredients & Steps Body */}
              <div className="p-5 sm:p-6 space-y-5">
                {/* Ingredients Deduction Match Box */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>消耗冰箱食材 (確認烹調後自動扣除)：</span>
                    <span className="text-[11px] text-emerald-600 font-semibold">
                      一鍵精算食材減法
                    </span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {recipe.usedIngredients.map((u, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{u.name}</span>
                        <span className="text-emerald-700 font-extrabold">
                          -{u.quantityUsed} {u.unit}
                        </span>
                      </span>
                    ))}
                  </div>

                  {recipe.additionalIngredients && recipe.additionalIngredients.length > 0 && (
                    <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-slate-700">常備調料：</span>
                      {recipe.additionalIngredients.map((a, idx) => (
                        <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">
                          {a.name} ({a.note})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Expanded Steps View */}
                {isExpanded && (
                  <div className="space-y-3 pt-3 border-t border-slate-100 animate-in fade-in-50 duration-200">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      料理步驟說明：
                    </h4>
                    <div className="space-y-2.5">
                      {recipe.steps.map((step) => (
                        <div
                          key={step.stepNumber}
                          className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3"
                        >
                          <span className="w-5 h-5 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {step.stepNumber}
                          </span>
                          <div className="flex-1">
                            <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                              {step.instruction}
                            </p>
                            {step.tip && (
                              <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-xl mt-1.5 border border-amber-200/60">
                                💡 主廚小提醒：{step.tip}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chef Secret */}
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">主廚美味私房話：</span>
                        <span>{recipe.chefSecret}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Card Actions Bottom */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCookingModalRecipe(recipe)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ChefHat className="w-4 h-4 text-emerald-600" />
                    <span>進入大字烹飪模式 (含計時器)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFinishCooking(recipe)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>確認煮完！自動扣除食材庫存</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Swap Dialog Modal */}
      {swapModalRecipe && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shuffle className="w-5 h-5" />
                <h3 className="text-base font-extrabold">動態換菜對話微調</h3>
              </div>
              <button
                type="button"
                onClick={() => setSwapModalRecipe(null)}
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="text-xs text-slate-600">
                原本菜色：
                <span className="font-bold text-slate-900">《{swapModalRecipe.title}》</span>
                <br />
                請選擇您希望調整的方向，AI 將在保留原本剩餘食材的前提下重新生成！
              </div>

              {/* Fast Preset Swap Buttons */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">常用快捷需求：</span>
                {SWAP_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => executeSwap(preset)}
                    disabled={isSwapping}
                    className="w-full text-left p-2.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 transition-colors flex items-center justify-between"
                  >
                    <span>{preset}</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-700 block mb-1.5">
                  或輸入自訂微調想法：
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="例如：我家有咖哩塊，想換成咖哩風味..."
                    value={customSwapText}
                    onChange={(e) => setCustomSwapText(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => executeSwap(customSwapText)}
                    disabled={!customSwapText.trim() || isSwapping}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    {isSwapping ? '替換中...' : '送出換菜'}
                  </button>
                </div>
              </div>

              {isSwapping && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                  <span>Gemini 正根據您的偏好構思全新替代菜色...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cooking Mode Modal */}
      {cookingModalRecipe && (
        <CookingModeModal
          recipe={cookingModalRecipe}
          onClose={() => setCookingModalRecipe(null)}
          onFinishCooking={(rec) => {
            setCookingModalRecipe(null);
            handleFinishCooking(rec);
          }}
        />
      )}

      {/* Deduction Celebration Modal */}
      {celebrationData && (
        <DeductionCelebrationModal
          recipe={celebrationData.recipe}
          records={celebrationData.records}
          onClose={() => setCelebrationData(null)}
        />
      )}
    </div>
  );
};
