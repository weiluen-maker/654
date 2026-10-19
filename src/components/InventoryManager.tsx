import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Clock,
  Sparkles,
  AlertTriangle,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { IngredientItem, IngredientCategory } from '../types';
import { CATEGORY_INFO } from '../data/samples';

interface InventoryManagerProps {
  ingredients: IngredientItem[];
  setIngredients: React.Dispatch<React.SetStateAction<IngredientItem[]>>;
  hoveredItemId: string | null;
  setHoveredItemId: (id: string | null) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  ingredients,
  setIngredients,
  hoveredItemId,
  setHoveredItemId,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemQty, setNewItemQty] = useState<number>(1);
  const [newItemUnit, setNewItemUnit] = useState<string>('顆');
  const [newItemCategory, setNewItemCategory] = useState<IngredientCategory>('vegetable');

  // Toggle selection
  const toggleSelect = (id: string) => {
    setIngredients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  // Select all or clear all
  const selectAll = (select: boolean) => {
    setIngredients((prev) => prev.map((item) => ({ ...item, selected: select })));
  };

  // Adjust quantity
  const updateQuantity = (id: string, delta: number) => {
    setIngredients((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newQty = Math.max(0.5, Math.round((item.quantity + delta) * 10) / 10);
        return { ...item, quantity: newQty };
      })
    );
  };

  // Delete item
  const deleteItem = (id: string) => {
    setIngredients((prev) => prev.filter((item) => item.id !== id));
  };

  // Add new item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: IngredientItem = {
      id: `custom-item-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      quantity: Number(newItemQty) || 1,
      unit: newItemUnit.trim() || '個',
      confidence: 1.0,
      freshStatus: 'fresh',
      selected: true,
    };

    setIngredients((prev) => [newItem, ...prev]);
    setNewItemName('');
    setNewItemQty(1);
    setShowAddForm(false);
  };

  const filteredItems = ingredients.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const selectedCount = ingredients.filter((i) => i.selected).length;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-emerald-100/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 text-sm font-bold">
              2
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              冰箱庫存盤點清單
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              共 {ingredients.length} 項食材
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            勾選欲納入主廚烹飪的食材，或自由微調數量與單位。
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => selectAll(selectedCount < ingredients.length)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {selectedCount === ingredients.length ? '取消全選' : '全選食材'}
          </button>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>手動新增</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeCategory === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          全部 ({ingredients.length})
        </button>
        {Object.entries(CATEGORY_INFO).map(([key, info]) => {
          const count = ingredients.filter((i) => i.category === key).length;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveCategory(key)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
                activeCategory === key
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{info.icon}</span>
              <span>{info.label}</span>
              <span className="opacity-75 text-[10px]">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Manual Add Form Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleAddItem}
          className="mb-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 animate-in fade-in-50 duration-200"
        >
          <div className="text-xs font-bold text-emerald-900 mb-2.5 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            快速新增自訂食材
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <input
              type="text"
              placeholder="食材名稱 (如：洋蔥、牛絞肉)"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-emerald-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
              required
            />
            <div className="flex gap-1.5">
              <input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="數量"
                value={newItemQty}
                onChange={(e) => setNewItemQty(Number(e.target.value))}
                className="w-20 px-3 py-2 text-xs rounded-xl border border-emerald-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                required
              />
              <input
                type="text"
                placeholder="單位 (顆/盒/g)"
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-emerald-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                required
              />
            </div>
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value as IngredientCategory)}
              className="px-3 py-2 text-xs rounded-xl border border-emerald-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="vegetable">蔬菜時蔬</option>
              <option value="meat_seafood">肉類海鮮</option>
              <option value="dairy_egg_tofu">蛋豆奶製品</option>
              <option value="staple_condiment">調味與常備</option>
              <option value="other">其他食材</option>
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs"
              >
                加入清單
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
              >
                取消
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Ingredient Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-sm font-medium text-slate-500">此分類暫無食材</p>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="mt-2 text-xs font-bold text-emerald-600 hover:underline"
          >
            立即手動新增食材
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filteredItems.map((item) => {
            const catInfo = CATEGORY_INFO[item.category] || CATEGORY_INFO.other;
            const isHovered = hoveredItemId === item.id;
            const isUrgent = item.freshStatus === 'use_soon';

            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredItemId(item.id)}
                onMouseLeave={() => setHoveredItemId(null)}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                  item.selected
                    ? isHovered
                      ? 'border-amber-400 bg-amber-50/50 shadow-md ring-2 ring-amber-400/20'
                      : 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-300'
                    : 'border-slate-200 bg-slate-50/60 opacity-60 hover:opacity-100'
                }`}
              >
                {/* Checkbox & Basic Info */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => toggleSelect(item.id)}
                    className="text-emerald-600 hover:text-emerald-700 shrink-0"
                  >
                    {item.selected ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {item.name}
                      </span>
                      {isUrgent && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-orange-100 text-orange-800 border border-orange-200">
                          <Clock className="w-2.5 h-2.5" /> 請儘速食用
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                      <span>{catInfo.icon}</span>
                      <span>{catInfo.label}</span>
                      {item.confidence && item.confidence < 1 && (
                        <span className="text-[10px] text-slate-400">
                          (辨識度 {Math.round(item.confidence * 100)}%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity Controls & Delete */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center bg-white rounded-xl border border-slate-200 shadow-xs px-1 py-0.5">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -0.5)}
                      className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-800 text-xs font-bold hover:bg-slate-100 rounded-md"
                    >
                      -
                    </button>
                    <span className="px-1.5 text-xs font-extrabold text-slate-800 min-w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 0.5)}
                      className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-800 text-xs font-bold hover:bg-slate-100 rounded-md"
                    >
                      +
                    </button>
                    <span className="text-[11px] text-slate-500 pr-1">
                      {item.unit}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="移除食材"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected summary bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>已勾選 {selectedCount} 項食材用於菜單生成</span>
        {selectedCount === 0 && (
          <span className="text-rose-500 font-bold">請至少勾選 1 項食材</span>
        )}
      </div>
    </div>
  );
};
