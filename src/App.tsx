/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { PhotoScanner } from './components/PhotoScanner';
import { InventoryManager } from './components/InventoryManager';
import { PreferenceFilter } from './components/PreferenceFilter';
import { RecipeList } from './components/RecipeList';
import { CommunityForum } from './components/CommunityForum';
import { IngredientItem, FilterPreferences, Recipe } from './types';
import { SAMPLE_SCENARIOS } from './data/samples';
import {
  Sparkles,
  ChefHat,
  Refrigerator,
  ArrowDown,
  Info,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'fridge' | 'community'>('fridge');
  const [ingredients, setIngredients] = useState<IngredientItem[]>(SAMPLE_SCENARIOS[0].items);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState<boolean>(false);

  const [preferences, setPreferences] = useState<FilterPreferences>({
    equipment: ['單口瓦斯爐'],
    dietaryStyle: '均衡家常',
    timeLimit: 30,
    dislikedIngredients: [],
    servings: 2,
  });

  // Handler when photo scanner detects items
  const handleIngredientsDetected = (
    newItems: IngredientItem[],
    _summary: string,
    _imageUrl: string
  ) => {
    setIngredients(newItems);
  };

  // Reset to default sample scenario
  const handleResetToSample = () => {
    setIngredients(SAMPLE_SCENARIOS[0].items);
    setPreferences({
      equipment: ['單口瓦斯爐'],
      dietaryStyle: '均衡家常',
      timeLimit: 30,
      dislikedIngredients: [],
      servings: 2,
    });
  };

  // Generate recipes via Gemini API
  const handleGenerateRecipes = async () => {
    const selectedIngredients = ingredients.filter((i) => i.selected && i.quantity > 0);
    if (selectedIngredients.length === 0) {
      alert('請至少勾選一項可用食材以生成食譜！');
      return;
    }

    setIsLoadingRecipes(true);
    try {
      const res = await fetch('/api/generate-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: selectedIngredients,
          equipment: preferences.equipment,
          dietaryStyle: preferences.dietaryStyle,
          timeLimit: preferences.timeLimit,
          dislikedIngredients: preferences.dislikedIngredients,
          servings: preferences.servings,
        }),
      });

      if (!res.ok) {
        throw new Error('生成食譜失敗');
      }

      const data = await res.json();
      if (data.recipes && data.recipes.length > 0) {
        setRecipes(data.recipes);
        // Smooth scroll to recipe section
        setTimeout(() => {
          document.getElementById('recipes-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err: any) {
      console.error(err);
      alert('生成食譜過程遇到問題，請稍候重試。');
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  // Import recipe snippet from community forum
  const handleImportRecipeSnippet = (snippet: {
    title: string;
    equipment: string;
    timeMinutes: number;
  }) => {
    const importedRecipe: Recipe = {
      id: `imported-${Date.now()}`,
      title: snippet.title,
      subtitle: `廚友討論區高讚靈感 (${snippet.equipment})`,
      description: `從討論區導入的熱門菜色！專為現有廚房設備與剩餘食材打造。`,
      timeMinutes: snippet.timeMinutes || 15,
      difficulty: '廚友推薦',
      equipmentNeeded: [snippet.equipment],
      usedIngredients: ingredients
        .filter((i) => i.selected)
        .slice(0, 2)
        .map((i) => ({
          name: i.name,
          quantityUsed: Math.min(i.quantity, 1),
          unit: i.unit,
        })),
      additionalIngredients: [
        { name: '日常調味 (鹽、油、醬油)', note: '適量' },
      ],
      nutrition: { calories: 290, protein: 22, carbs: 12, fat: 16 },
      tags: ['社群高讚', '剩食救星', snippet.equipment],
      steps: [
        { stepNumber: 1, instruction: '將冰箱現有食材清洗乾淨，依菜色需求切成適口大小備用。' },
        {
          stepNumber: 2,
          instruction: `使用 ${snippet.equipment} 進行加熱或烹調，注意火候與時間控制。`,
          timerSeconds: snippet.timeMinutes * 60,
        },
        { stepNumber: 3, instruction: '盛盤並依照個人口味淋上適量醬油或香油點綴，趁熱享用！' },
      ],
      chefSecret: '從廚友討論區交流中發現，烹調前食材瀝乾水分更能激發香氣！',
    };

    setRecipes((prev) => [importedRecipe, ...prev]);
    setActiveTab('fridge');
    setTimeout(() => {
      document.getElementById('recipes-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const selectedCount = ingredients.filter((i) => i.selected && i.quantity > 0).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        inventoryCount={ingredients.length}
        onResetToSample={handleResetToSample}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'fridge' ? (
          <div className="space-y-6 sm:space-y-8">
            {/* 1. Multimodal Photo Scanner */}
            <PhotoScanner
              onIngredientsDetected={handleIngredientsDetected}
              hoveredItemId={hoveredItemId}
              setHoveredItemId={setHoveredItemId}
            />

            {/* 2. Inventory Manager */}
            <InventoryManager
              ingredients={ingredients}
              setIngredients={setIngredients}
              hoveredItemId={hoveredItemId}
              setHoveredItemId={setHoveredItemId}
            />

            {/* 3. Preference Filter & Recipe Trigger */}
            <PreferenceFilter
              preferences={preferences}
              setPreferences={setPreferences}
              onGenerate={handleGenerateRecipes}
              isLoading={isLoadingRecipes}
              canGenerate={selectedCount > 0}
            />

            {/* 4. Recipe Generation Results & Dynamic Swap & Deduction */}
            <div id="recipes-section">
              <RecipeList
                recipes={recipes}
                setRecipes={setRecipes}
                ingredients={ingredients}
                setIngredients={setIngredients}
                preferences={preferences}
              />
            </div>
          </div>
        ) : (
          /* Community Forum & Food Rescue Search */
          <CommunityForum
            currentIngredients={ingredients}
            onImportRecipeSnippet={handleImportRecipeSnippet}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">智煮鮮盒 SmartFridge Chef</span>
            <span>• 多模態冰箱拍照盤點與智慧廚房主廚</span>
          </div>
          <p>
            支援單口瓦斯爐、氣炸鍋、電鍋等多重設備約束 • 智慧食材減法動態扣除
          </p>
        </div>
      </footer>
    </div>
  );
}
