'use client';

import { useMemo, useState } from 'react';
import AchievementCard from '@/components/AchievementCard';
import AchievementListItem from '@/components/AchievementListItem';
import AchievementDetailModal from '@/components/AchievementDetailModal';
import { Achievement } from '@/types/achievement';
import { Tag } from '@/types/tag';
import achievementsData from '@/data/achievements.json';
import tagsData from '@/data/tags.json';
import Link from 'next/link';
import AuthButton from '@/components/AuthButton';

type ViewMode = 'card' | 'list';
type SortOption = 'default' | 'difficulty-asc' | 'difficulty-desc' | 'time-asc' | 'time-desc';

export default function Dashboard() {
  const achievements = achievementsData as Achievement[];
  const tags = tagsData as Tag[];
  const [selectedAchievementId, setSelectedAchievementId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortOption, setSortOption] = useState<SortOption>('default');

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

  // ソート処理
  const sortAchievements = (items: Achievement[]) => {
    if (sortOption === 'default') return items;
    
    return [...items].sort((a, b) => {
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
  };

  // 達成済み実績
  const unlockedAchievements = useMemo(() => 
    sortAchievements(achievements.filter(a => a.status === 'unlocked')),
    [achievements, sortOption]
  );

  // 挑戦中の実績
  const inProgressAchievements = useMemo(() => 
    sortAchievements(achievements.filter(a => a.status === 'in-progress')),
    [achievements, sortOption]
  );

  // 未解除の実績
  const lockedAchievements = useMemo(() => 
    sortAchievements(achievements.filter(a => a.status === 'locked')),
    [achievements, sortOption]
  );

  // 統計情報
  const stats = useMemo(() => {
    const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);
    const maxPoints = achievements.reduce((sum, a) => sum + a.points, 0);
    const achievementRate = Math.round((unlockedAchievements.length / achievements.length) * 100);
    
    return {
      totalPoints,
      maxPoints,
      achievementRate,
      unlockedCount: unlockedAchievements.length,
      inProgressCount: inProgressAchievements.length,
      lockedCount: lockedAchievements.length,
      totalCount: achievements.length,
    };
  }, [achievements, unlockedAchievements, inProgressAchievements, lockedAchievements]);

  // ダミーのステータス変更関数（ダッシュボードでは変更不可）
  const handleStatusChange = () => {
    // ダッシュボードでは何もしない
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* ヘッダー */}
        <header className="mb-12">
          {/* 認証ボタン */}
          <div className="flex justify-end mb-6">
            <AuthButton />
          </div>
          
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-4 text-gray-700">
              {isBornLocked ? '🌟 ようこそ！' : '📊 ダッシュボード'}
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              {isBornLocked 
                ? 'この素晴らしき人生というゲームへ' 
                : 'あなたの人生の実績を振り返ろう'
              }
            </p>
          
            {!isBornLocked && (
              <div className="flex gap-4 justify-center flex-wrap">
                <Link 
                  href="/"
                  className="inline-block px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md"
                >
                  ← トップページ
                </Link>
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

        {/* 表示モード切り替えとソート（「この世に生を受ける」が未達成の場合は非表示） */}
        {!isBornLocked && (
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
          </section>
        )}

        {/* 統計情報（「この世に生を受ける」が未達成の場合は非表示） */}
        {!isBornLocked && (
          <section className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-6 shadow-md border-2 border-gray-200">
              <div className="text-3xl font-bold text-gray-700">{stats.unlockedCount}</div>
              <div className="text-sm text-gray-600">解除済み</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md border-2 border-gray-200">
              <div className="text-3xl font-bold text-gray-700">{stats.inProgressCount}</div>
              <div className="text-sm text-gray-600">挑戦中</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md border-2 border-gray-200">
              <div className="text-3xl font-bold text-gray-700">{stats.lockedCount}</div>
              <div className="text-sm text-gray-600">未解除</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md border-2 border-gray-200">
              <div className="text-3xl font-bold text-gray-700">{stats.achievementRate}%</div>
              <div className="text-sm text-gray-600">達成率</div>
            </div>
          </div>
          
          {/* 総合点数 */}
          <div className="mt-6 bg-white rounded-lg p-8 shadow-md border-2 border-gray-300">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-700 mb-2">
                {stats.totalPoints} <span className="text-3xl">/ {stats.maxPoints} pt</span>
              </div>
              <div className="text-lg text-gray-600">総合獲得ポイント</div>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gray-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.totalPoints / stats.maxPoints) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </section>
        )}

        {/* 「この世に生を受ける」実績が未達成の場合は特別な表示 */}
        {isBornLocked ? (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-700 mb-6 text-center">
              🌟 あなたの最初の実績
            </h2>
            <div className="max-w-2xl mx-auto">
              {bornAchievement && (
                <AchievementListItem 
                  achievement={bornAchievement}
                  onClick={() => setSelectedAchievementId(bornAchievement.id)}
                />
              )}
            </div>
            <div className="text-center mt-8">
              <p className="text-gray-600 text-lg">
                この実績を達成して、人生の冒険を始めよう！
              </p>
              <Link 
                href="/"
                className="inline-block mt-4 px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
              >
                実績を解除する →
              </Link>
            </div>
          </section>
        ) : (
          <>
            {/* 挑戦中の実績 */}
            <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-700 mb-6">
            🔥 挑戦中の実績
          </h2>
          {inProgressAchievements.length > 0 ? (
            viewMode === 'card' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {inProgressAchievements.map((achievement) => (
                  <AchievementCard 
                    key={achievement.id} 
                    achievement={achievement}
                    onClick={() => setSelectedAchievementId(achievement.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {inProgressAchievements.map((achievement) => (
                  <AchievementListItem 
                    key={achievement.id} 
                    achievement={achievement}
                    onClick={() => setSelectedAchievementId(achievement.id)}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-gray-200">
              <p className="text-gray-500 text-lg">現在挑戦中の実績はありません</p>
              <Link 
                href="/"
                className="inline-block mt-4 px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
              >
                実績に挑戦する
              </Link>
            </div>
          )}
        </section>

        {/* 達成済みの実績 */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-700 mb-6">
            🏆 達成済みの実績
          </h2>
          {unlockedAchievements.length > 0 ? (
            viewMode === 'card' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {unlockedAchievements.map((achievement) => (
                  <AchievementCard 
                    key={achievement.id} 
                    achievement={achievement}
                    onClick={() => setSelectedAchievementId(achievement.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {unlockedAchievements.map((achievement) => (
                  <AchievementListItem 
                    key={achievement.id} 
                    achievement={achievement}
                    onClick={() => setSelectedAchievementId(achievement.id)}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-gray-200">
              <p className="text-gray-500 text-lg">まだ達成した実績がありません</p>
              <Link 
                href="/"
                className="inline-block mt-4 px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
              >
                実績を解除する
              </Link>
            </div>
          )}
        </section>
          </>
        )}

        {/* フッター */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>あなたの人生の冒険はまだまだ続く...</p>
          <div className="mt-4">
            <button
              onClick={async () => {
                const { useAuthStore } = await import('@/stores/authStore');
                const { signOut } = useAuthStore.getState();
                await signOut();
                window.location.href = '/login';
              }}
              className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
            >
              ログアウト
            </button>
          </div>
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

