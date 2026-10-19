import React from 'react';
import { Refrigerator, Sparkles, MessageSquare, ChefHat, RotateCcw } from 'lucide-react';

interface HeaderProps {
  activeTab: 'fridge' | 'community';
  setActiveTab: (tab: 'fridge' | 'community') => void;
  inventoryCount: number;
  onResetToSample: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  inventoryCount,
  onResetToSample,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Refrigerator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 font-sans">
                  智煮鮮盒
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  SmartFridge AI
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                多模態照片一鍵盤點 • 飲食設備客製 • 動態換菜 • 食材自動扣除
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            <nav className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('fridge')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'fridge'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ChefHat className="w-4 h-4 text-emerald-600" />
                <span>冰箱主廚</span>
                {inventoryCount > 0 && (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                    {inventoryCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('community')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'community'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>搜尋討論區</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              </button>
            </nav>

            <button
              type="button"
              onClick={onResetToSample}
              title="載入預設豐富冰箱範例"
              className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors border border-slate-200 hover:border-emerald-200 hidden md:flex items-center gap-1.5 text-xs font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>示範庫存</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
