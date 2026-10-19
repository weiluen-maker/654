import { IngredientItem } from '../types';

export interface SampleFridgeScenario {
  id: string;
  name: string;
  badge: string;
  description: string;
  imageUrl: string;
  items: IngredientItem[];
}

export const SAMPLE_SCENARIOS: SampleFridgeScenario[] = [
  {
    id: 'sample-family',
    name: '日常家庭常備冰箱',
    badge: '豐富食材',
    description: '含高麗菜半顆、洗選蛋、板豆腐、牛番茄、五花肉片與鮮奶',
    imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=1000&auto=format&fit=crop',
    items: [
      {
        id: 'item-demo-1',
        name: '洗選雞蛋',
        category: 'dairy_egg_tofu',
        quantity: 4,
        unit: '顆',
        confidence: 0.98,
        freshStatus: 'fresh',
        box: { ymin: 480, xmin: 520, ymax: 680, xmax: 820 },
        selected: true,
      },
      {
        id: 'item-demo-2',
        name: '高麗菜',
        category: 'vegetable',
        quantity: 0.5,
        unit: '顆',
        confidence: 0.95,
        freshStatus: 'use_soon',
        box: { ymin: 220, xmin: 150, ymax: 470, xmax: 420 },
        selected: true,
      },
      {
        id: 'item-demo-3',
        name: '非基改板豆腐',
        category: 'dairy_egg_tofu',
        quantity: 1,
        unit: '塊',
        confidence: 0.92,
        freshStatus: 'use_soon',
        box: { ymin: 300, xmin: 550, ymax: 460, xmax: 750 },
        selected: true,
      },
      {
        id: 'item-demo-4',
        name: '牛番茄',
        category: 'vegetable',
        quantity: 2,
        unit: '顆',
        confidence: 0.94,
        freshStatus: 'fresh',
        box: { ymin: 520, xmin: 180, ymax: 670, xmax: 380 },
        selected: true,
      },
      {
        id: 'item-demo-5',
        name: '梅花豬肉片',
        category: 'meat_seafood',
        quantity: 1,
        unit: '盒(約250g)',
        confidence: 0.91,
        freshStatus: 'fresh',
        box: { ymin: 680, xmin: 350, ymax: 880, xmax: 620 },
        selected: true,
      },
      {
        id: 'item-demo-6',
        name: '全脂鮮奶',
        category: 'dairy_egg_tofu',
        quantity: 1,
        unit: '瓶',
        confidence: 0.97,
        freshStatus: 'fresh',
        box: { ymin: 120, xmin: 780, ymax: 420, xmax: 920 },
        selected: false,
      },
    ],
  },
  {
    id: 'sample-student',
    name: '租屋族快速極簡冰箱',
    badge: '15分出菜必備',
    description: '青花菜、嫩豆腐、雞蛋2顆、微波白飯與蒜末',
    imageUrl: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=1000&auto=format&fit=crop',
    items: [
      {
        id: 'item-stu-1',
        name: '洗選雞蛋',
        category: 'dairy_egg_tofu',
        quantity: 2,
        unit: '顆',
        confidence: 0.96,
        freshStatus: 'fresh',
        box: { ymin: 450, xmin: 500, ymax: 650, xmax: 780 },
        selected: true,
      },
      {
        id: 'item-stu-2',
        name: '青花菜',
        category: 'vegetable',
        quantity: 1,
        unit: '朵',
        confidence: 0.94,
        freshStatus: 'use_soon',
        box: { ymin: 250, xmin: 200, ymax: 450, xmax: 450 },
        selected: true,
      },
      {
        id: 'item-stu-3',
        name: '中華嫩豆腐',
        category: 'dairy_egg_tofu',
        quantity: 1,
        unit: '盒',
        confidence: 0.93,
        freshStatus: 'use_soon',
        box: { ymin: 300, xmin: 520, ymax: 440, xmax: 720 },
        selected: true,
      },
      {
        id: 'item-stu-4',
        name: '大蒜瓣',
        category: 'staple_condiment',
        quantity: 4,
        unit: '瓣',
        confidence: 0.9,
        freshStatus: 'staple',
        box: { ymin: 700, xmin: 200, ymax: 820, xmax: 350 },
        selected: true,
      },
    ],
  },
  {
    id: 'sample-fitness',
    name: '增肌減脂高蛋白生鮮庫存',
    badge: '減脂推薦',
    description: '去皮雞胸肉、雞蛋6顆、彩椒、小黃瓜與板豆腐',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1000&auto=format&fit=crop',
    items: [
      {
        id: 'item-fit-1',
        name: '生鮮去皮雞胸肉',
        category: 'meat_seafood',
        quantity: 2,
        unit: '片(約300g)',
        confidence: 0.95,
        freshStatus: 'fresh',
        box: { ymin: 300, xmin: 250, ymax: 550, xmax: 520 },
        selected: true,
      },
      {
        id: 'item-fit-2',
        name: '洗選雞蛋',
        category: 'dairy_egg_tofu',
        quantity: 6,
        unit: '顆',
        confidence: 0.98,
        freshStatus: 'fresh',
        box: { ymin: 500, xmin: 550, ymax: 700, xmax: 850 },
        selected: true,
      },
      {
        id: 'item-fit-3',
        name: '甜彩椒',
        category: 'vegetable',
        quantity: 2,
        unit: '顆',
        confidence: 0.93,
        freshStatus: 'fresh',
        box: { ymin: 200, xmin: 600, ymax: 450, xmax: 800 },
        selected: true,
      },
      {
        id: 'item-fit-4',
        name: '非基改板豆腐',
        category: 'dairy_egg_tofu',
        quantity: 1,
        unit: '塊',
        confidence: 0.92,
        freshStatus: 'use_soon',
        box: { ymin: 600, xmin: 200, ymax: 800, xmax: 450 },
        selected: true,
      },
    ],
  },
];

export const CATEGORY_INFO: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  vegetable: { label: '蔬菜時蔬', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: '🥬' },
  meat_seafood: { label: '肉類海鮮', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', icon: '🥩' },
  dairy_egg_tofu: { label: '蛋豆奶製品', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: '🥚' },
  staple_condiment: { label: '調味與常備', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', icon: '🧂' },
  other: { label: '其他食材', color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200', icon: '📦' },
};

// Play simple kitchen audio chime using Web Audio API
export const playKitchenChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    // Ignore audio errors if blocked by browser autoplay policy
  }
};
