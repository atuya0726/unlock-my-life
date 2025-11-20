'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import AchievementCard from '@/components/AchievementCard';
import AchievementListItem from '@/components/AchievementListItem';
import AchievementDetailModal from '@/components/AchievementDetailModal';
import AuthButton from '@/components/AuthButton';
import { Achievement } from '@/types/achievement';
import { Tag } from '@/types/tag';
import achievementsData from '@/data/achievements.json';
import tagsData from '@/data/tags.json';

type ViewMode = 'card' | 'list';
type SortOption = 'default' | 'difficulty-asc' | 'difficulty-desc' | 'time-asc' | 'time-desc';

export default function Home() {
  const [achievements, setAchievements] = useState<Achievement[]>(achievementsData as Achievement[]);
  const tags = tagsData as Tag[];
  
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [showUnlocked, setShowUnlocked] = useState<boolean>(false);
  const [selectedAchievementId, setSelectedAchievementId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortOption, setSortOption] = useState<SortOption>('default');

  // ステータス変更関数
  const handleStatusChange = (achievementId: string, newStatus: Achievement['status']) => {
    setAchievements(prev => 
      prev.map(achievement => 
        achievement.id === achievementId 
          ? { ...achievement, status: newStatus }
          : achievement
      )
    );
  };

  // 難易度を数値に変換
  const getDifficultyValue = (difficulty: Achievement['difficulty']): number => {
    switch (difficulty) {
      case 'easy': return 1;
      case 'normal': return 2;
      case 'hard': return 3;
      case 'unmeasurable': return 4;
      default: return 2;
    }
  };

  // 時間を数値に変換（日数）
  const getTimeValue = (time: string): number => {
    if (time.includes('1日') || time.includes('一日')) return 1;
    if (time.includes('一週間') || time.includes('1週間')) return 7;
    if (time.includes('一ヶ月') || time.includes('1ヶ月')) return 30;
    if (time.includes('一年') || time.includes('1年')) return 365;
    if (time.includes('四年')) return 1460;
    if (time.includes('それ以上')) return 9999;
    return 0;
  };

  // 「この世に生を受ける」実績のチェック
  const bornAchievement = useMemo(() => 
    achievements.find(a => a.id === 'born'),
    [achievements]
  );

  const isBornLocked = useMemo(() => 
    bornAchievement?.status === 'locked',
    [bornAchievement]
  );

  // フィルタリング・ソートされた実績
  const filteredAchievements = useMemo(() => {
    // 「この世に生を受ける」実績が未達成の場合、その実績だけを表示
    if (isBornLocked && bornAchievement) {
      return [bornAchievement];
    }

    let result = achievements;
    
    // 解除済みを含めるかどうか
    if (!showUnlocked) {
      result = result.filter(a => a.status !== 'unlocked');
    }
    
    // タグでフィルタリング（AND条件：選択された全てのタグを含む実績のみ）
    if (selectedTagIds.length > 0) {
      result = result.filter(achievement => 
        selectedTagIds.every(tagId => achievement.tags.includes(tagId))
      );
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
  }, [selectedTagIds, achievements, showUnlocked, sortOption, isBornLocked, bornAchievement]);

  // 各タグの実績数をカウント（現在選択されているタグも考慮）
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tags.forEach(tag => {
      // このタグを含む、かつ他の選択されたタグも全て含む実績をカウント
      counts[tag.id] = achievements.filter(a => {
        // 解除済みフィルター
        if (!showUnlocked && a.status === 'unlocked') return false;
        
        // このタグを含むか
        if (!a.tags.includes(tag.id)) return false;
        
        // 他の選択されたタグも全て含むか
        const otherSelectedTags = selectedTagIds.filter(id => id !== tag.id);
        return otherSelectedTags.every(tagId => a.tags.includes(tagId));
      }).length;
    });
    return counts;
  }, [tags, achievements, showUnlocked, selectedTagIds]);


  const handleTagClick = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)  // 既に選択されていたら除外
        : [...prev, tagId]                  // 選択されていなかったら追加
    );
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* ヘッダーセクション */}
        <header className="mb-12">
          {/* 認証ボタン */}
          <div className="flex justify-end mb-6">
            <AuthButton />
          </div>
          
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-4 text-gray-700">
              🎮 Unlock my life
            </h1>
            <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
              人生はゲームだ。この人生とかいう神ゲーの実績を全て解除しよう。その先にきっと見える景色と幸せがある。
            </p>
          
            {!isBornLocked && (
              <div className="flex gap-4 justify-center flex-wrap">
                <Link 
                  href="/ranking"
                  className="inline-block px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md"
                >
                  🏅 ランキング
                </Link>
                <Link 
                  href="/admin"
                  className="inline-block px-6 py-3 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-600 transition-all duration-200 shadow-md"
                >
                  🔧 管理者ページ
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* 表示モード切り替えと解除済み表示トグル（「この世に生を受ける」が未達成の場合は非表示） */}
        {!isBornLocked && (
          <>
            <section className="mb-6 flex justify-center items-center gap-4 flex-wrap">
              {/* 表示モード切り替え */}
              <div className="flex gap-2 bg-white border-2 border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`
                    px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200
                    ${viewMode === 'list' 
                      ? 'bg-gray-700 text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                    }
                  `}
                >
                  リスト
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`
                    px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200
                    ${viewMode === 'card' 
                      ? 'bg-gray-700 text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                    }
                  `}
                >
                  カード
                </button>
              </div>

              {/* ソート選択 */}
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="px-4 py-2 rounded-lg border-2 border-gray-300 bg-white text-gray-700 font-semibold text-sm focus:outline-none focus:border-gray-400"
              >
                <option value="default">並び替え: デフォルト</option>
                <option value="difficulty-asc">難易度: 易しい順</option>
                <option value="difficulty-desc">難易度: 難しい順</option>
                <option value="time-asc">時間: 短い順</option>
                <option value="time-desc">時間: 長い順</option>
              </select>

              {/* 解除済み表示トグル */}
              <button
                onClick={() => setShowUnlocked(!showUnlocked)}
                className={`
                  px-6 py-3 rounded-lg font-semibold text-sm
                  transition-all duration-200
                  ${showUnlocked 
                    ? 'bg-gray-700 text-white shadow-md' 
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                {showUnlocked ? '✓ 解除済みを表示中' : '解除済みを表示'}
              </button>
            </section>

            {/* タグフィルター */}
            <section className="mb-8">
              <div className="flex flex-wrap justify-center gap-3">
                {/* 全て表示ボタン */}
                <button
                  onClick={() => setSelectedTagIds([])}
                  className={`
                    px-4 py-2 rounded-lg font-semibold text-sm
                    transition-all duration-200
                    ${selectedTagIds.length === 0
                      ? 'bg-gray-700 text-white shadow-md' 
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  全て ({showUnlocked ? achievements.length : achievements.filter(a => a.status !== 'unlocked').length})
                </button>
                
                {/* タグボタン */}
                {tags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => handleTagClick(tag.id)}
                      className={`
                        px-4 py-2 rounded-lg font-semibold text-sm
                        transition-all duration-200
                        ${isSelected
                          ? 'bg-gray-600 text-white shadow-md'
                          : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400'
                        }
                      `}
                    >
                      {isSelected && '✓ '}{tag.name} ({tagCounts[tag.id] || 0})
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* 実績一覧 */}
        <section>
          <h2 className="text-3xl font-bold text-gray-700 mb-8 text-center">
            {isBornLocked ? (
              <>🌟 さあ、冒険の始まりだ！</>
            ) : (
              <>
                🏆 人生の実績一覧
                {selectedTagIds.length > 0 && (
                  <span className="text-lg text-gray-600 ml-2">
                    - {selectedTagIds.map(id => tags.find(t => t.id === id)?.name).join(' & ')}
                  </span>
                )}
              </>
            )}
          </h2>
          
          {filteredAchievements.length > 0 ? (
            viewMode === 'card' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredAchievements.map((achievement) => (
                  <AchievementCard 
                    key={achievement.id} 
                    achievement={achievement}
                    onClick={() => setSelectedAchievementId(achievement.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
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
            <div className="text-center text-gray-500 py-12">
              このタグに該当する実績はありません
            </div>
          )}
        </section>

        {/* フッター */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>あなたの人生の冒険はまだまだ続く...</p>
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
