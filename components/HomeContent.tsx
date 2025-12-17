'use client';

import { useState, useMemo, useTransition } from 'react';
import Link from 'next/link';
import AchievementCard from '@/components/AchievementCard';
import AchievementListItem from '@/components/AchievementListItem';
import AchievementDetailModal from '@/components/AchievementDetailModal';
import Header from '@/components/Header';
import { Achievement } from '@/types/achievement';
import { Tag } from '@/types/tag';
import { Category, CategoryId } from '@/types/category';
import { updateAchievementStatus } from '@/app/actions/achievements';
import { formatTime, formatDifficulty, getTimeValue, getDifficultyValue } from '@/lib/formatters';

type ViewMode = 'card' | 'list';
type SortOption = 'default' | 'difficulty-asc' | 'difficulty-desc' | 'time-asc' | 'time-desc';
type TimeFilter = 'all' | 'day' | 'week' | 'month' | 'year' | 'over';
type DifficultyFilter = 'all' | 'easy' | 'normal' | 'hard' | 'unmeasurable';

interface HomeContentProps {
  initialAchievements: Achievement[];
  initialTags: Tag[];
  categories: Category[];
  isLoggedIn: boolean;
}

export default function HomeContent({ 
  initialAchievements, 
  initialTags,
  categories,
  isLoggedIn,
}: HomeContentProps) {
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const tags = initialTags;
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryId | null>(null);
  const [showUnlocked, setShowUnlocked] = useState<boolean>(false);
  const [selectedAchievementId, setSelectedAchievementId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<TimeFilter>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>('all');

  // ステータス変更関数
  const handleStatusChange = (achievementId: string, newStatus: Achievement['status']) => {
    // エラーメッセージをクリア
    setErrorMessage(null);
    
    // 変更前のステータスを保存
    const previousStatus = achievements.find(a => a.id === achievementId)?.status || 'locked';
    
    // 楽観的更新
    setAchievements(prev => 
      prev.map(achievement => 
        achievement.id === achievementId 
          ? { ...achievement, status: newStatus }
          : achievement
      )
    );

    // サーバーアクションを呼び出し
    startTransition(async () => {
      const result = await updateAchievementStatus(achievementId, newStatus);
      if (!result.success) {
        // エラー時はロールバック
        setAchievements(prev => 
          prev.map(achievement => 
            achievement.id === achievementId 
              ? { ...achievement, status: previousStatus }
              : achievement
          )
        );
        setErrorMessage(result.error || 'ステータスの更新に失敗しました');
        // 3秒後にエラーメッセージをクリア
        setTimeout(() => setErrorMessage(null), 5000);
      }
    });
  };

  // 「この世に生を受ける」実績のチェック（EXP_BORN）
  const bornAchievement = useMemo(() => 
    achievements.find(a => a.id === 'EXP_BORN'),
    [achievements]
  );

  // ログイン中 かつ EXP_BORNが未達成（unlocked以外）の場合は特殊表示
  const isBornNotUnlocked = useMemo(() => 
    isLoggedIn && bornAchievement?.status !== 'unlocked',
    [isLoggedIn, bornAchievement]
  );

  // フィルタリング・ソートされた実績
  const filteredAchievements = useMemo(() => {
    // 「この世に生を受ける」実績が未達成の場合、その実績だけを表示
    if (isBornNotUnlocked && bornAchievement) {
      return [bornAchievement];
    }

    let result = achievements;
    
    // 解除済みを含めるかどうか
    if (!showUnlocked) {
      result = result.filter(a => a.status !== 'unlocked');
    }
    
    // カテゴリでフィルタリング
    if (selectedCategoryId) {
      result = result.filter(a => a.category === selectedCategoryId);
    }
    
    // タグでフィルタリング（AND条件：選択された全てのタグを含む実績のみ）
    if (selectedTagIds.length > 0) {
      result = result.filter(achievement => 
        selectedTagIds.every(tagId => achievement.tags.includes(tagId))
      );
    }
    
    // 時間フィルタリング
    if (selectedTime !== 'all') {
      result = result.filter(a => a.time === selectedTime);
    }
    
    // 難易度フィルタリング
    if (selectedDifficulty !== 'all') {
      result = result.filter(a => a.difficulty === selectedDifficulty);
    }
    
    // ソート
    if (sortOption !== 'default') {
      result = [...result].sort((a, b) => {
        switch (sortOption) {
          case 'difficulty-asc':
            return getDifficultyValue(a.difficulty) - getDifficultyValue(b.difficulty);
          case 'difficulty-desc':
            return getDifficultyValue(b.difficulty) - getDifficultyValue(a.difficulty);
          case 'time-asc':
            return getTimeValue(a.time) - getTimeValue(b.time);
          case 'time-desc':
            return getTimeValue(b.time) - getTimeValue(a.time);
          default:
            return 0;
        }
      });
    }
    
    return result;
  }, [selectedTagIds, selectedCategoryId, achievements, showUnlocked, sortOption, selectedTime, selectedDifficulty, isBornNotUnlocked, bornAchievement]);

  // アクティブなフィルター数を計算
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedTagIds.length > 0) count += selectedTagIds.length;
    if (selectedTime !== 'all') count += 1;
    if (selectedDifficulty !== 'all') count += 1;
    return count;
  }, [selectedTagIds, selectedTime, selectedDifficulty]);

  // フィルターをクリア
  const clearFilters = () => {
    setSelectedTagIds([]);
    setSelectedTime('all');
    setSelectedDifficulty('all');
  };

  const handleTagClick = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)  // 既に選択されていたら除外
        : [...prev, tagId]                  // 選択されていなかったら追加
    );
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <Header isLoggedIn={isLoggedIn} showRanking={!isBornNotUnlocked} />

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10 max-w-7xl">
        {/* ヒーローセクション */}
        <header className="mb-6 sm:mb-10">
          <div className="text-center">
            <h1 className="text-3xl sm:text-5xl font-bold mb-2 sm:mb-4 text-gray-700">
              Unlock My Life
            </h1>
            <p className="text-sm sm:text-lg text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto px-2">
              人生はゲームだ。この人生とかいう神ゲーを遊び尽くせ！
            </p>
          </div>
        </header>

        {/* エラーメッセージ */}
        {errorMessage && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center text-sm sm:text-base">
            {errorMessage}
          </div>
        )}

        {/* セクション見出し */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-700 mb-4 sm:mb-6 text-center">
          {isBornNotUnlocked ? (
            <>さあ、神ゲーを始めよう</>
          ) : (
            <>実績一覧</>
          )}
        </h2>

        {/* フィルター（「この世に生を受ける」が未達成の場合は非表示） */}
        {!isBornNotUnlocked && (
          <>
            {/* カテゴリタブ */}
            <section className="mb-3 sm:mb-4">
              <div className="border-b-2 border-gray-200">
                <div className="flex overflow-x-auto scrollbar-hide -mb-px">
                  {/* 全カテゴリタブ */}
                  <button
                    onClick={() => setSelectedCategoryId(null)}
                    className={`
                      flex-shrink-0 px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-bold border-b-3 transition-all duration-200
                      ${selectedCategoryId === null
                        ? 'border-gray-700 text-gray-800' 
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                      }
                    `}
                    style={{
                      borderBottomWidth: selectedCategoryId === null ? '3px' : '3px',
                    }}
                  >
                    すべて
                  </button>
                  
                  {/* カテゴリタブ */}
                  {categories.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategoryId(isSelected ? null : cat.id)}
                        className={`
                          flex-shrink-0 px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-bold transition-all duration-200
                          ${isSelected
                            ? 'text-gray-800'
                            : 'text-gray-400 hover:text-gray-600'
                          }
                        `}
                        style={{
                          borderBottomWidth: '3px',
                          borderBottomStyle: 'solid',
                          borderBottomColor: isSelected ? cat.color : 'transparent',
                        }}
                      >
                        {cat.nameJa}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

          </>
        )}

        {/* 実績一覧 */}
        <section>
          {/* 表示コントロール */}
          {!isBornNotUnlocked && (
            <div className="flex justify-between items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              {/* 左側: フィルターボタン */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`
                    relative p-2 rounded-lg transition-all duration-200
                    ${activeFilterCount > 0
                      ? 'bg-gray-700 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                    }
                  `}
                  title="フィルター"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                  </svg>
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* フィルターパネル */}
                {isFilterOpen && (
                  <>
                    {/* オーバーレイ */}
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setIsFilterOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 w-72 sm:w-80">
                      {/* タグ */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-bold text-gray-700">タグ</h3>
                          {selectedTagIds.length > 0 && (
                            <button
                              onClick={() => setSelectedTagIds([])}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              クリア
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {tags.map((tag) => {
                            const isSelected = selectedTagIds.includes(tag.id);
                            return (
                              <button
                                key={tag.id}
                                onClick={() => handleTagClick(tag.id)}
                                className={`
                                  px-2 py-1 rounded-md text-xs font-medium transition-all duration-200
                                  ${isSelected
                                    ? 'bg-gray-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }
                                `}
                              >
                                {isSelected && '✓ '}{tag.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 時間 */}
                      <div className="mb-4">
                        <h3 className="text-sm font-bold text-gray-700 mb-2">目安時間</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {(['all', 'day', 'week', 'month', 'year', 'over'] as const).map((value) => (
                            <button
                              key={value}
                              onClick={() => setSelectedTime(value)}
                              className={`
                                px-2 py-1 rounded-md text-xs font-medium transition-all duration-200
                                ${selectedTime === value
                                  ? 'bg-gray-600 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }
                              `}
                            >
                              {value === 'all' ? 'すべて' : formatTime(value)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 難易度 */}
                      <div className="mb-4">
                        <h3 className="text-sm font-bold text-gray-700 mb-2">難易度</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {(['all', 'easy', 'normal', 'hard', 'unmeasurable'] as const).map((value) => (
                            <button
                              key={value}
                              onClick={() => setSelectedDifficulty(value)}
                              className={`
                                px-2 py-1 rounded-md text-xs font-medium transition-all duration-200
                                ${selectedDifficulty === value
                                  ? 'bg-gray-600 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }
                              `}
                            >
                              {value === 'all' ? 'すべて' : formatDifficulty(value)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* アクションボタン */}
                      <div className="flex gap-2 pt-2 border-t border-gray-200">
                        <button
                          onClick={clearFilters}
                          className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-800"
                        >
                          すべてクリア
                        </button>
                        <button
                          onClick={() => setIsFilterOpen(false)}
                          className="flex-1 px-3 py-2 text-xs font-medium bg-gray-700 text-white rounded-lg hover:bg-gray-800"
                        >
                          閉じる
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 右側: ソート・表示モード・解除済みトグル */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* ソート選択 */}
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="h-9 px-2 sm:px-3 rounded-lg border border-gray-300 bg-white text-gray-700 text-xs sm:text-sm focus:outline-none focus:border-gray-400"
                >
                  <option value="default">並び替え</option>
                  <option value="difficulty-asc">難易度: 昇順</option>
                  <option value="difficulty-desc">難易度: 降順</option>
                  <option value="time-asc">時間: 昇順</option>
                  <option value="time-desc">時間: 降順</option>
                </select>

                {/* 表示モード切り替え */}
                <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`
                      p-2 transition-all duration-200
                      ${viewMode === 'list' 
                        ? 'bg-gray-700 text-white' 
                        : 'text-gray-500 hover:bg-gray-100'
                      }
                    `}
                    title="リスト表示"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('card')}
                    className={`
                      p-2 transition-all duration-200
                      ${viewMode === 'card' 
                        ? 'bg-gray-700 text-white' 
                        : 'text-gray-500 hover:bg-gray-100'
                      }
                    `}
                    title="カード表示"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                </div>

                {/* 解除済み表示トグル */}
                <button
                  onClick={() => setShowUnlocked(!showUnlocked)}
                  className={`
                    p-2 rounded-lg transition-all duration-200
                    ${showUnlocked 
                      ? 'bg-gray-700 text-white' 
                      : 'bg-white text-gray-500 border border-gray-300 hover:border-gray-400'
                    }
                  `}
                  title={showUnlocked ? '解除済みを非表示' : '解除済みを表示'}
                >
                  {showUnlocked ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}
          
          {filteredAchievements.length > 0 ? (
            viewMode === 'card' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
                {filteredAchievements.map((achievement) => (
                  <AchievementCard 
                    key={achievement.id} 
                    achievement={achievement}
                    onClick={() => setSelectedAchievementId(achievement.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-1.5 sm:space-y-2">
                {filteredAchievements.map((achievement) => (
                  <AchievementListItem 
                    key={achievement.id} 
                    achievement={achievement}
                    onClick={() => setSelectedAchievementId(achievement.id)}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="text-center text-gray-500 py-8 sm:py-12 text-sm sm:text-base">
              このタグに該当する実績はありません
            </div>
          )}
        </section>

        {/* フッター */}
        <footer className="mt-10 sm:mt-16 text-center text-gray-500 text-xs sm:text-sm">
          <p>あなたの人生はまだまだ続く...</p>
        </footer>
      </div>

      {/* 詳細モーダル */}
      {selectedAchievementId && (
        <AchievementDetailModal
          achievement={achievements.find(a => a.id === selectedAchievementId)!}
          allTags={tags}
          isOpen={!!selectedAchievementId}
          onClose={() => setSelectedAchievementId(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </main>
  );
}
