import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Flame,
  ThumbsUp,
  MessageCircle,
  Share2,
  Sparkles,
  BookmarkPlus,
  Send,
  ChefHat,
  Filter,
  PlusCircle,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { CommunityDiscussion, IngredientItem, Recipe } from '../types';

interface CommunityForumProps {
  currentIngredients: IngredientItem[];
  onImportRecipeSnippet?: (snippet: { title: string; equipment: string; timeMinutes: number }) => void;
}

export const CommunityForum: React.FC<CommunityForumProps> = ({
  currentIngredients,
  onImportRecipeSnippet,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [discussions, setDiscussions] = useState<CommunityDiscussion[]>([]);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [showNewPostModal, setShowNewPostModal] = useState<boolean>(false);
  const [newPostTitle, setNewPostTitle] = useState<string>('');
  const [newPostContent, setNewPostContent] = useState<string>('');
  const [importedSuccess, setImportedSuccess] = useState<string | null>(null);

  // Fetch discussions on mount or query change
  const fetchCommunityData = async (queryText = searchQuery) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/search-community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          currentIngredients: currentIngredients.filter((i) => i.selected),
        }),
      });
      const data = await res.json();
      if (data.discussions) {
        setDiscussions(data.discussions);
      }
      if (data.aiInsight) {
        setAiInsight(data.aiInsight);
      }
    } catch (err) {
      console.error('Error fetching community discussions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCommunityData(searchQuery);
  };

  const handleQuickTagClick = (tag: string) => {
    setSearchQuery(tag);
    fetchCommunityData(tag);
  };

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim()) return;

    const newPost: CommunityDiscussion = {
      id: `post-user-${Date.now()}`,
      title: newPostTitle.trim(),
      author: '我（主廚學員）',
      authorAvatar: '🧑‍🍳',
      likes: 1,
      repliesCount: 0,
      category: '食材求助',
      tags: currentIngredients.slice(0, 3).map((i) => i.name),
      summary:
        newPostContent.trim() ||
        `目前冰箱有：${currentIngredients.map((i) => i.name).join('、')}，想請教大家推薦怎麼料理！`,
      timeAgo: '剛剛',
    };

    setDiscussions([newPost, ...discussions]);
    setNewPostTitle('');
    setNewPostContent('');
    setShowNewPostModal(false);
  };

  const filteredDiscussions = discussions.filter((d) => {
    if (activeCategory === 'all') return true;
    return d.category === activeCategory;
  });

  return (
    <div className="space-y-6">
      {/* Forum Banner & Search */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold mb-3 border border-white/10">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>廚友討論區 • 剩食拯救與料理交流</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            搜尋討論區靈感，看看廚友怎麼煮！
          </h2>
          <p className="text-emerald-100/80 text-xs sm:text-sm mt-1.5 leading-relaxed">
            輸入食材或烹飪設備關鍵字，搜尋數萬名廚友的避坑指南、私房料理神技與熱門食譜。
          </p>

          {/* Search Bar Form */}
          <form onSubmit={handleSearchSubmit} className="mt-5 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋食材、菜名或設備 (例如：高麗菜半顆、氣炸板豆腐、單口瓦斯爐)..."
                className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 rounded-2xl text-xs sm:text-sm font-medium placeholder:text-slate-400 focus:outline-hidden focus:ring-3 focus:ring-emerald-400 shadow-lg"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 sm:px-7 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all shrink-0 flex items-center gap-1.5"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>搜尋討論</span>
            </button>
          </form>

          {/* Fast Search Pills */}
          <div className="mt-4 flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-emerald-200/70 font-semibold">推薦熱門關鍵字：</span>
            {['高麗菜剩半顆', '單口瓦斯爐', '氣炸鍋豆腐', '電鍋高蛋白', '免開火涼拌'].map(
              (tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleQuickTagClick(tag)}
                  className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                >
                  #{tag}
                </button>
              )
            )}

            {currentIngredients.length > 0 && (
              <button
                type="button"
                onClick={() => handleQuickTagClick(currentIngredients[0].name)}
                className="px-2.5 py-1 rounded-xl bg-amber-400/20 text-amber-200 hover:bg-amber-400/30 font-bold border border-amber-400/30"
              >
                🔍 搜我的食材：{currentIngredients[0].name}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Community Chef Advice Banner */}
      {aiInsight && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl flex items-start gap-3.5 shadow-xs">
          <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black text-emerald-900">
                討論區主廚精華摘要
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-800">
                Gemini 社群總結
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {aiInsight}
            </p>
          </div>
        </div>
      )}

      {/* Category Tabs & New Post Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: '全部討論' },
            { id: '食材救星', label: '🥦 食材救星' },
            { id: '單人租屋', label: '🏠 單人租屋' },
            { id: '氣炸鍋料理', label: '🍟 氣炸鍋神技' },
            { id: '電鍋出好菜', label: '🍚 電鍋出好菜' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowNewPostModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          <span>發布剩食求助提問</span>
        </button>
      </div>

      {/* Discussions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDiscussions.map((post) => {
          const isLiked = likedPosts.includes(post.id);
          const likeCount = post.likes + (isLiked ? 1 : 0);

          return (
            <div
              key={post.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Author row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-base border border-slate-200">
                      {post.authorAvatar}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{post.author}</div>
                      <div className="text-[10px] text-slate-400">{post.timeAgo}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {post.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-extrabold text-slate-900 leading-snug tracking-tight mb-2 hover:text-emerald-700 transition-colors cursor-pointer">
                  {post.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {post.summary}
                </p>

                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap mb-4">
                  {post.tags.map((t) => (
                    <span
                      key={t}
                      onClick={() => handleQuickTagClick(t)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200 cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Recommended snippet card if available */}
                {post.recommendedRecipeSnippet && (
                  <div className="mb-4 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ChefHat className="w-4 h-4 text-emerald-700" />
                      <div>
                        <div className="text-xs font-bold text-emerald-950">
                          {post.recommendedRecipeSnippet.title}
                        </div>
                        <div className="text-[10px] text-emerald-700">
                          {post.recommendedRecipeSnippet.equipment} • 約{' '}
                          {post.recommendedRecipeSnippet.timeMinutes} 分鐘
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onImportRecipeSnippet?.(post.recommendedRecipeSnippet!);
                        setImportedSuccess(post.recommendedRecipeSnippet!.title);
                        setTimeout(() => setImportedSuccess(null), 3000);
                      }}
                      className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-xs transition-colors shrink-0 flex items-center gap-1"
                    >
                      <BookmarkPlus className="w-3 h-3" />
                      <span>導入靈感</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Card Footer: Likes, replies, share */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 transition-colors font-semibold ${
                      isLiked ? 'text-rose-600' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <ThumbsUp
                      className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 stroke-rose-500' : ''}`}
                    />
                    <span>{likeCount}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>{post.repliesCount} 則廚友回覆</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert(`已複製討論連結：《${post.title}》`)}
                  className="hover:text-slate-800 p-1"
                  title="分享話題"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {importedSuccess && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-900 text-white rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-700 animate-in fade-in-50">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">
            已成功將《{importedSuccess}》導入您的主廚菜單靈感！
          </span>
        </div>
      )}

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold">在討論區發布剩食求助</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewPostModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase block mb-1">
                  貼文標題
                </label>
                <input
                  type="text"
                  placeholder="例如：冰箱剩半顆高麗菜跟2顆蛋，只有氣炸鍋求推薦！"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 uppercase block mb-1">
                  詳細說明（選填）
                </label>
                <textarea
                  rows={3}
                  placeholder="描述您的烹飪限制、口味偏好或想請教的廚友問題..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                💡 系統將自動為您附帶當前冰箱勾選的食材標籤，方便廚友針對您的庫存提供精準作法！
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                >
                  立即發布討論
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
