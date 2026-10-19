export type IngredientCategory =
  | 'vegetable'
  | 'meat_seafood'
  | 'dairy_egg_tofu'
  | 'staple_condiment'
  | 'other';

export interface BoundingBox {
  ymin: number; // 0 - 1000
  xmin: number; // 0 - 1000
  ymax: number; // 0 - 1000
  xmax: number; // 0 - 1000
}

export interface IngredientItem {
  id: string;
  name: string;
  category: IngredientCategory;
  quantity: number;
  unit: string;
  confidence?: number;
  freshStatus?: 'fresh' | 'use_soon' | 'staple';
  box?: BoundingBox;
  selected?: boolean;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  tip?: string;
  timerSeconds?: number;
}

export interface UsedIngredient {
  name: string;
  quantityUsed: number;
  unit: string;
  matchedInventoryId?: string;
}

export interface AdditionalIngredient {
  name: string;
  note: string;
}

export interface RecipeNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Recipe {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  timeMinutes: number;
  difficulty: string;
  equipmentNeeded: string[];
  usedIngredients: UsedIngredient[];
  additionalIngredients?: AdditionalIngredient[];
  nutrition: RecipeNutrition;
  tags: string[];
  steps: RecipeStep[];
  chefSecret: string;
}

export interface FilterPreferences {
  equipment: string[];
  dietaryStyle: string;
  timeLimit: number; // minutes: 15, 30, 45, etc.
  dislikedIngredients: string[];
  servings: number;
}

export interface CommunityDiscussion {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  likes: number;
  repliesCount: number;
  category: string;
  tags: string[];
  summary: string;
  timeAgo: string;
  recommendedRecipeSnippet?: {
    title: string;
    equipment: string;
    timeMinutes: number;
  };
}
