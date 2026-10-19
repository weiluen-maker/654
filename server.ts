import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// High limit for base64 camera image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google GenAI
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// 1. Multimodal Fridge Photo Recognition API
app.post('/api/analyze-fridge', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: '請提供冰箱照片資料 (Base64)' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const ai = getAIClient();

    if (!ai) {
      // Fallback sample inventory if API key is missing
      return res.json({
        items: [
          {
            id: 'item-demo-1',
            name: '洗選雞蛋',
            category: 'dairy_egg_tofu',
            quantity: 4,
            unit: '顆',
            confidence: 0.96,
            freshStatus: 'fresh',
            box: { ymin: 480, xmin: 520, ymax: 680, xmax: 820 },
          },
          {
            id: 'item-demo-2',
            name: '高麗菜',
            category: 'vegetable',
            quantity: 0.5,
            unit: '顆',
            confidence: 0.94,
            freshStatus: 'use_soon',
            box: { ymin: 220, xmin: 150, ymax: 470, xmax: 420 },
          },
          {
            id: 'item-demo-3',
            name: '非基改板豆腐',
            category: 'dairy_egg_tofu',
            quantity: 1,
            unit: '塊',
            confidence: 0.91,
            freshStatus: 'use_soon',
            box: { ymin: 300, xmin: 550, ymax: 460, xmax: 750 },
          },
          {
            id: 'item-demo-4',
            name: '牛番茄',
            category: 'vegetable',
            quantity: 2,
            unit: '顆',
            confidence: 0.93,
            freshStatus: 'fresh',
            box: { ymin: 520, xmin: 180, ymax: 670, xmax: 380 },
          },
          {
            id: 'item-demo-5',
            name: '梅花豬肉片',
            category: 'meat_seafood',
            quantity: 1,
            unit: '盒(約250g)',
            confidence: 0.9,
            freshStatus: 'fresh',
            box: { ymin: 680, xmin: 350, ymax: 880, xmax: 620 },
          },
          {
            id: 'item-demo-6',
            name: '鮮奶',
            category: 'dairy_egg_tofu',
            quantity: 1,
            unit: '瓶',
            confidence: 0.97,
            freshStatus: 'fresh',
            box: { ymin: 120, xmin: 780, ymax: 420, xmax: 920 },
          },
        ],
        summary: '辨識完成！共偵測到 6 種新鮮食材，建議優先烹調效期較短的板豆腐與半顆高麗菜。',
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: `你是一位資深廚師與精準的電腦視覺冰箱盤點專家。請仔細分析這張冰箱/食材庫存照片。
請找出圖片中所有可見的生鮮、蔬菜、肉類、海鮮、蛋豆製品、乳品、常備調味食材。
請務必回傳標準 JSON 格式（不可附加 Markdown 標籤），包含：
- items: 偵測到的食材陣列，每個項目包含：
  - id: 唯一識別碼字串（如 item-1, item-2）
  - name: 繁體中文食材名稱（如：洗選雞蛋、高麗菜、板豆腐、牛番茄、豬肉片、青花菜、洋蔥、大蒜、鮮乳）
  - category: 'vegetable' (蔬菜) | 'meat_seafood' (肉類海鮮) | 'dairy_egg_tofu' (蛋豆奶) | 'staple_condiment' (調味主食) | 'other' (其他)
  - quantity: 預估數值（數字，如 4、0.5、1、2）
  - unit: 繁體中文量詞（如 顆、半顆、塊、盒、條、把、包、瓶、片）
  - confidence: 信心度 0.5 ~ 0.99
  - freshStatus: 'fresh' (新鮮) | 'use_soon' (儘速食用/已切開/容易壞) | 'staple' (常備耐放)
  - box: 邊界框在圖片上的百分比位置（0 到 1000 之整數）：{ ymin: number, xmin: number, ymax: number, xmax: number }
- summary: 一句繁體中文總結與新鮮度提醒（例如「已為您辨識出 5 項食材，高麗菜半顆與豆腐建議盡快料理！」）
`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  freshStatus: { type: Type.STRING },
                  box: {
                    type: Type.OBJECT,
                    properties: {
                      ymin: { type: Type.NUMBER },
                      xmin: { type: Type.NUMBER },
                      ymax: { type: Type.NUMBER },
                      xmax: { type: Type.NUMBER },
                    },
                    required: ['ymin', 'xmin', 'ymax', 'xmax'],
                  },
                },
                required: ['id', 'name', 'category', 'quantity', 'unit', 'confidence', 'freshStatus', 'box'],
              },
            },
          },
          required: ['items', 'summary'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing fridge photo:', error);
    return res.status(500).json({
      error: error.message || '辨識食材失敗，請重新拍攝或手動加入。',
    });
  }
});

// 2. Customized Recipe Generator API
app.post('/api/generate-recipes', async (req: Request, res: Response) => {
  try {
    const {
      ingredients = [],
      equipment = ['單口瓦斯爐'],
      dietaryStyle = '均衡家常',
      timeLimit = 30,
      dislikedIngredients = [],
      servings = 2,
    } = req.body;

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ error: '請提供至少一項可用食材' });
    }

    const ai = getAIClient();
    if (!ai) {
      // Fallback recipes
      return res.json({
        recipes: [
          {
            id: 'recipe-fallback-1',
            title: '日式鮮味滑蛋金黃燒豆腐',
            subtitle: '嫩口多汁・極速入味下飯首選',
            description: '利用板豆腐煎出焦香外皮，淋上滑嫩蛋液與甜鹹家常醬汁，15分鐘輕鬆出好菜。',
            timeMinutes: 15,
            difficulty: '簡單',
            equipmentNeeded: equipment.slice(0, 1),
            usedIngredients: [
              { name: '非基改板豆腐', quantityUsed: 1, unit: '塊' },
              { name: '洗選雞蛋', quantityUsed: 2, unit: '顆' },
            ],
            additionalIngredients: [
              { name: '醬油', note: '1.5 大匙' },
              { name: '味醂或少許糖', note: '1 小匙' },
              { name: '水', note: '50ml' },
              { name: '白胡椒與食用油', note: '適量' },
            ],
            nutrition: { calories: 340, protein: 26, carbs: 8, fat: 22 },
            tags: ['15分鐘出菜', '高蛋白', '無油煙', '新手必成功'],
            steps: [
              { stepNumber: 1, instruction: '板豆腐以廚房紙巾吸去多餘水分，切成約 1.5 公分厚片；雞蛋打散備用。', timerSeconds: 120 },
              { stepNumber: 2, instruction: '平底鍋/單口爐熱油，下豆腐雙面煎至金黃微焦香（各約2分鐘）。', tip: '中小火慢煎不急著翻面，豆腐不易碎裂。', timerSeconds: 240 },
              { stepNumber: 3, instruction: '倒入醬油、糖與清水燒煮1分鐘讓豆腐吸飽湯汁，最後淋上蛋液，蓋鍋悶 30 秒熄火。', timerSeconds: 90 },
            ],
            chefSecret: '蛋液不要打得太勻，保留部分蛋白會更有日式滑蛋的層次感！',
          },
          {
            id: 'recipe-fallback-2',
            title: '清甜脆口蒜香清炒高麗菜',
            subtitle: '保留甘甜・爽脆鮮綠',
            description: '大火快炒鎖住高麗菜的清甜水分，搭配簡單蒜香調味，補充每日膳食纖維。',
            timeMinutes: 10,
            difficulty: '新手友善',
            equipmentNeeded: equipment.slice(0, 1),
            usedIngredients: [
              { name: '高麗菜', quantityUsed: 0.5, unit: '顆' },
            ],
            additionalIngredients: [
              { name: '蒜頭或蒜末', note: '2瓣' },
              { name: '鹽巴', note: '半小匙' },
            ],
            nutrition: { calories: 120, protein: 3, carbs: 14, fat: 6 },
            tags: ['極速出菜', '高纖低卡', '生酮友好'],
            steps: [
              { stepNumber: 1, instruction: '高麗菜洗淨後手撕成一口大小，瀝乾水分；蒜瓣拍碎。', timerSeconds: 120 },
              { stepNumber: 2, instruction: '熱鍋加少許油，爆香蒜碎，隨即下高麗菜大火翻炒。', timerSeconds: 180 },
              { stepNumber: 3, instruction: '淋入2大匙熱水嗆鍋蓋燜30秒，起鍋前撒鹽拌勻即可。', tip: '用手撕菜葉比刀切更能吸附湯汁且保留脆度。', timerSeconds: 60 },
            ],
            chefSecret: '水一定要鍋氣夠足時沿著鍋邊淋入，高麗菜才會爽脆不軟爛！',
          },
        ],
      });
    }

    const promptText = `
你是一位頂級米其林家庭主廚兼營養師。請根據使用者現有冰箱食材與多重條件，生成 2 至 3 道精緻、美味、可行性極高且步驟詳盡的料理菜單。

【使用者冰箱庫存食材清單】：
${ingredients.map((item: any) => `- ${item.name}: ${item.quantity} ${item.unit} (${item.category || '食材'})`).join('\n')}

【設備限制】：${equipment.join('、') || '瓦斯爐'}
（請嚴格遵守設備限制！例如：若僅有「電鍋」或「氣炸鍋」或「微波爐」或「免開火」，絕不能要求大火爆炒；若只有單口瓦斯爐，確保烹調器具簡單一鍋到底。）

【飲食風格與目標】：${dietaryStyle}
（例如高蛋白增肌需突出蛋白質含量、低醣生酮需嚴格控制碳水、全素/蛋奶素嚴格無肉無海鮮、清淡少油則避免油炸。）

【時間限制】：必須在 ${timeLimit} 分鐘內完成！
【份量】：${servings} 人份
【排除不吃或過敏食材】：${dislikedIngredients.length > 0 ? dislikedIngredients.join('、') : '無特別排除'}

重要：每道菜必須標明具體扣除的「庫存食材名稱」與「使用數量」（quantityUsed 與 unit），以利料理完後精確扣除剩餘庫存！
常備調味料（如鹽、黑胡椒、醬油、水、食用油、香油、蒜頭等常見配料）請列在 additionalIngredients。

請輸出嚴格的 JSON 格式（無 markdown 反引號），包含 recipes 陣列。
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  description: { type: Type.STRING },
                  timeMinutes: { type: Type.NUMBER },
                  difficulty: { type: Type.STRING },
                  equipmentNeeded: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  usedIngredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        quantityUsed: { type: Type.NUMBER },
                        unit: { type: Type.STRING },
                      },
                      required: ['name', 'quantityUsed', 'unit'],
                    },
                  },
                  additionalIngredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        note: { type: Type.STRING },
                      },
                      required: ['name', 'note'],
                    },
                  },
                  nutrition: {
                    type: Type.OBJECT,
                    properties: {
                      calories: { type: Type.NUMBER },
                      protein: { type: Type.NUMBER },
                      carbs: { type: Type.NUMBER },
                      fat: { type: Type.NUMBER },
                    },
                    required: ['calories', 'protein', 'carbs', 'fat'],
                  },
                  tags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  steps: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        stepNumber: { type: Type.NUMBER },
                        instruction: { type: Type.STRING },
                        tip: { type: Type.STRING },
                        timerSeconds: { type: Type.NUMBER },
                      },
                      required: ['stepNumber', 'instruction'],
                    },
                  },
                  chefSecret: { type: Type.STRING },
                },
                required: [
                  'id',
                  'title',
                  'subtitle',
                  'description',
                  'timeMinutes',
                  'difficulty',
                  'equipmentNeeded',
                  'usedIngredients',
                  'nutrition',
                  'tags',
                  'steps',
                  'chefSecret',
                ],
              },
            },
          },
          required: ['recipes'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating recipes:', error);
    return res.status(500).json({
      error: error.message || '生成食譜失敗，請重試。',
    });
  }
});

// 3. Dynamic Recipe Swap & Dialogue Fine-Tuning API (動態換菜)
app.post('/api/swap-recipe', async (req: Request, res: Response) => {
  try {
    const {
      oldRecipe,
      swapInstruction = '這道我不喜歡，換一道不用開火的',
      remainingIngredients = [],
      equipment = ['單口瓦斯爐'],
      dietaryStyle = '均衡家常',
      timeLimit = 30,
      servings = 2,
    } = req.body;

    const ai = getAIClient();
    if (!ai) {
      // Dynamic fallback replacement
      return res.json({
        recipe: {
          id: `recipe-swap-${Date.now()}`,
          title: '和風胡麻豆腐冷拌番茄沙拉',
          subtitle: '免開火・沁涼爽口高蛋白',
          description: `根據您的換菜要求「${swapInstruction}」，替換為完全不需要開火的清爽和風冷拌菜餚！`,
          timeMinutes: 8,
          difficulty: '極簡速成',
          equipmentNeeded: ['免開火 (涼拌/即食)'],
          usedIngredients: [
            { name: '非基改板豆腐', quantityUsed: 1, unit: '塊' },
            { name: '牛番茄', quantityUsed: 1, unit: '顆' },
          ],
          additionalIngredients: [
            { name: '和風醬油或胡麻醬', note: '2 大匙' },
            { name: '白芝麻/蔥花', note: '隨意點綴' },
          ],
          nutrition: { calories: 210, protein: 18, carbs: 9, fat: 12 },
          tags: ['免開火', '極速10分鐘', '清爽少油', '高蛋白'],
          steps: [
            { stepNumber: 1, instruction: '板豆腐以冷開水或飲用水稍加沖洗，切成適口骰子立方塊。', timerSeconds: 60 },
            { stepNumber: 2, instruction: '牛番茄洗淨切小丁，與豆腐塊一同擺盤。', timerSeconds: 60 },
            { stepNumber: 3, instruction: '淋上和風醬油或胡麻醬，撒上白芝麻即可享用。', tip: '冷藏靜置5分鐘風味更佳！' },
          ],
          chefSecret: '用廚房紙巾輕壓豆腐吸掉表面水氣，醬汁才能緊密包裹每一塊豆腐！',
        },
      });
    }

    const promptText = `
使用者想要替換原本的一道菜色。
原本的菜色：${oldRecipe?.title || '未指定'}
使用者的換菜指示 / 期望：「${swapInstruction}」
（例如：「這道我不喜歡，換一道不用開火的」、「想吃辣一點重口味」、「換成氣炸鍋料理」、「想換成免洗鍋的一鍋到底料理」）

【使用者可用剩餘食材】：
${remainingIngredients.map((item: any) => `- ${item.name}: ${item.quantity} ${item.unit}`).join('\n')}

【設備限制】：${equipment.join('、')}
【飲食風格】：${dietaryStyle}
【時間限制】：${timeLimit} 分鐘內
【份量】：${servings} 人份

請在保留使用者現有可用食材的前提下，完全針對使用者的換菜需求重新構想並生成「單道全新精準食譜」，無縫替換原本不中意的菜色！
輸出標準 JSON 格式，包含單一 recipe 物件。
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipe: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                description: { type: Type.STRING },
                timeMinutes: { type: Type.NUMBER },
                difficulty: { type: Type.STRING },
                equipmentNeeded: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                usedIngredients: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      quantityUsed: { type: Type.NUMBER },
                      unit: { type: Type.STRING },
                    },
                    required: ['name', 'quantityUsed', 'unit'],
                  },
                },
                additionalIngredients: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      note: { type: Type.STRING },
                    },
                    required: ['name', 'note'],
                  },
                },
                nutrition: {
                  type: Type.OBJECT,
                  properties: {
                    calories: { type: Type.NUMBER },
                    protein: { type: Type.NUMBER },
                    carbs: { type: Type.NUMBER },
                    fat: { type: Type.NUMBER },
                  },
                  required: ['calories', 'protein', 'carbs', 'fat'],
                },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                steps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      stepNumber: { type: Type.NUMBER },
                      instruction: { type: Type.STRING },
                      tip: { type: Type.STRING },
                      timerSeconds: { type: Type.NUMBER },
                    },
                    required: ['stepNumber', 'instruction'],
                  },
                },
                chefSecret: { type: Type.STRING },
              },
              required: [
                'id',
                'title',
                'subtitle',
                'description',
                'timeMinutes',
                'difficulty',
                'equipmentNeeded',
                'usedIngredients',
                'nutrition',
                'tags',
                'steps',
                'chefSecret',
              ],
            },
          },
          required: ['recipe'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error swapping recipe:', error);
    return res.status(500).json({
      error: error.message || '動態換菜失敗，請重試。',
    });
  }
});

// 4. Community Forum Search & AI Food Rescue Q&A API
app.post('/api/search-community', async (req: Request, res: Response) => {
  try {
    const { query = '', currentIngredients = [] } = req.body;
    const ai = getAIClient();

    // Default curated hot community discussions
    const curatedDiscussions = [
      {
        id: 'post-1',
        title: '【食材清空】高麗菜買大顆剩半顆怎麼煮不膩？廚友分享5種神吃法！',
        author: '米其林家常控',
        authorAvatar: '👩‍🍳',
        likes: 182,
        repliesCount: 34,
        category: '食材救星',
        tags: ['高麗菜', '常備菜', '生酮', '免開火涼拌'],
        summary: '除了清炒，還可以做「日式鹽昆布手撕生高麗菜」、「麻油薑絲烘蛋」或是「高麗菜豆腐煎餅」！手撕涼拌只要抓鹽3分鐘超脆甜。',
        timeAgo: '2小時前',
        recommendedRecipeSnippet: {
          title: '日式鹽昆布高麗菜（免開火）',
          equipment: '免開火',
          timeMinutes: 5,
        },
      },
      {
        id: 'post-2',
        title: '【租屋救星】只有單口瓦斯爐跟微波爐，高蛋白增肌一週料理全紀錄',
        author: '健身打卡仔',
        authorAvatar: '💪',
        likes: 245,
        repliesCount: 52,
        category: '單人租屋',
        tags: ['高蛋白', '單口瓦斯爐', '微波爐', '豆腐蛋'],
        summary: '單口爐最忌諱手忙腳亂換鍋！分享利用「微波蒸嫩蛋+單鍋香煎板豆腐與豬肉片」，12分鐘洗一個碗搞定 38g 蛋白質！',
        timeAgo: '4小時前',
        recommendedRecipeSnippet: {
          title: '微波茶碗蒸配醬燒豆腐',
          equipment: '微波爐',
          timeMinutes: 12,
        },
      },
      {
        id: 'post-3',
        title: '【氣炸鍋神技】板豆腐這樣烤，外酥裡嫩根本像居酒屋揚出豆腐！',
        author: '小套房大廚',
        authorAvatar: '🧑‍🍳',
        likes: 310,
        repliesCount: 61,
        category: '氣炸鍋料理',
        tags: ['氣炸鍋', '板豆腐', '減脂點心', '下酒菜'],
        summary: '切塊抹少許油，180度氣炸12分鐘，中間翻面一次，淋上柴魚醬油與蔥花，不用油炸卻酥脆爆汁。',
        timeAgo: '昨日',
        recommendedRecipeSnippet: {
          title: '居酒屋風金黃酥炸板豆腐',
          equipment: '氣炸鍋',
          timeMinutes: 14,
        },
      },
      {
        id: 'post-4',
        title: '【電鍋封神】極速15分鐘！電鍋一層蒸番茄肉片、一層蒸蛋',
        author: '懶人廚房阿嬤',
        authorAvatar: '👵',
        likes: 198,
        repliesCount: 29,
        category: '電鍋出好菜',
        tags: ['電鍋', '免看火', '低油煙', '雙層出菜'],
        summary: '下層蒸番茄洋蔥豬肉片，架上蒸架放茶碗蒸，外鍋半杯水，跳起來直接開飯，肉嫩蛋滑而且零油煙。',
        timeAgo: '2天前',
        recommendedRecipeSnippet: {
          title: '雙層番茄燉肉滑蛋',
          equipment: '電鍋',
          timeMinutes: 15,
        },
      },
      {
        id: 'post-5',
        title: '【食材過剩解方】快過期的雞蛋跟番茄，除了番茄炒蛋還能做什麼？',
        author: '冰箱救難隊',
        authorAvatar: '🍅',
        likes: 142,
        repliesCount: 38,
        category: '食材救星',
        tags: ['雞蛋', '番茄', '中東北非蛋', '西式清爽'],
        summary: '試試看「北非蛋 Shakshuka」！番茄洋蔥炒出濃郁醬汁，挖兩個洞打入雞蛋燜到半熟，沾麵包或配飯超級神仙。',
        timeAgo: '3天前',
        recommendedRecipeSnippet: {
          title: '經典番茄嫩蛋北非溫暖烘鍋',
          equipment: '單口瓦斯爐',
          timeMinutes: 15,
        },
      },
    ];

    if (!query && (!currentIngredients || currentIngredients.length === 0)) {
      return res.json({
        discussions: curatedDiscussions,
        aiInsight: '歡迎來到廚友討論區！您可以直接搜尋食材關鍵字，或查看符合您冰箱庫存的靈感話題。',
      });
    }

    // Filter curated discussions
    const lowerQuery = query.toLowerCase();
    const filteredCurated = curatedDiscussions.filter(
      (d) =>
        d.title.toLowerCase().includes(lowerQuery) ||
        d.summary.toLowerCase().includes(lowerQuery) ||
        d.tags.some((t) => t.toLowerCase().includes(lowerQuery)) ||
        d.category.toLowerCase().includes(lowerQuery)
    );

    // If query has specific prompt or Gemini available, get AI chef community advice
    let aiInsight = '';
    if (ai && query) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `你是一位深耕烹飪討論社群（如 Cookpad、愛料理、Dcard 廚藝版、PTT Cookclub）的資深版主主廚。
使用者正在討論區搜尋：「${query}」，冰箱現有食材為：${currentIngredients.map((i: any) => i.name).join('、') || '一般食材'}。
請用熱情、專業、口語化且實用的口氣，給出 2 則最切中痛點的廚友心得精華、料理絕活或常見避坑指南（繁體中文，約 150 字以內）。`,
      });
      aiInsight = response.text || '';
    }

    return res.json({
      discussions: filteredCurated.length > 0 ? filteredCurated : curatedDiscussions,
      aiInsight:
        aiInsight ||
        `討論區熱門搜尋結果：為您整理關於「${query || '剩食料理'}」的高讚廚友經驗與避坑心得！`,
    });
  } catch (error: any) {
    console.error('Error searching community:', error);
    return res.status(500).json({ error: error.message || '搜尋討論區失敗' });
  }
});

// Setup Vite middlewares for development or serve dist in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

startServer();
