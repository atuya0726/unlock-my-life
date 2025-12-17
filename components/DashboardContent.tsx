'use client';

import { useMemo, useState, useTransition } from 'react';
import AchievementListItem from '@/components/AchievementListItem';
import AchievementDetailModal from '@/components/AchievementDetailModal';
import StatusBarChart from '@/components/StatusBarChart';
import Header from '@/components/Header';
import { Achievement } from '@/types/achievement';
import { Tag } from '@/types/tag';
import { updateAchievementStatus } from '@/app/actions/achievements';
import Link from 'next/link';

interface DashboardContentProps {
  initialAchievements: Achievement[];
  tags: Tag[];
  isLoggedIn: boolean;
}

export default function DashboardContent({ initialAchievements, tags, isLoggedIn }: DashboardContentProps) {
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [selectedAchievementId, setSelectedAchievementId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 「この世に生を受ける」実績のチェック（EXP_BORN）
  const bornAchievement = useMemo(() => 
    achievements.find(a => a.id === 'EXP_BORN'),
    [achievements]
  );

  // EXP_BORNが未達成（unlocked以外）の場合は特殊表示
  const isBornNotUnlocked = useMemo(() => 
    bornAchievement?.status !== 'unlocked',
    [bornAchievement]
  );

  // 達成済み実績
  const unlockedAchievements = useMemo(() => 
    achievements.filter(a => a.status === 'unlocked'),
    [achievements]
  );

  // 挑戦中の実績
  const inProgressAchievements = useMemo(() => 
    achievements.filter(a => a.status === 'in-progress'),
    [achievements]
  );

  // 未解除の実績
  const lockedAchievements = useMemo(() => 
    achievements.filter(a => a.status === 'locked'),
    [achievements]
  );

  // 統計情報
  const stats = useMemo(() => {
    const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);
    const maxPoints = achievements.reduce((sum, a) => sum + a.points, 0);
    const achievementRate = achievements.length > 0 
      ? Math.round((unlockedAchievements.length / achievements.length) * 100)
      : 0;
    
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
        // 5秒後にエラーメッセージをクリア
        setTimeout(() => setErrorMessage(null), 5000);
      }
    });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <Header isLoggedIn={isLoggedIn} showRanking={!isBornNotUnlocked} />

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* ページタイトル */}
        <header className="mb-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 text-gray-700">
              {isBornNotUnlocked ? 'ようこそ！' : 'ダッシュボード'}
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              {isBornNotUnlocked 
                ? 'この素晴らしき人生というゲームへ' 
                : 'あなたの人生の実績を振り返ろう'
              }
            </p>
          </div>
        </header>

        {/* エラーメッセージ */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
            {errorMessage}
          </div>
        )}

        {/* 統計情報（「この世に生を受ける」が未達成の場合は非表示） */}
        {!isBornNotUnlocked && (
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
          
          {/* 総合点数とレーダーチャート */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-8 shadow-md border-2 border-gray-300">
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-700 mb-2">
                  {stats.totalPoints} <span className="text-3xl">/ {stats.maxPoints} pt</span>
                </div>
                <div className="text-lg text-gray-600">総合獲得ポイント</div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-gray-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${stats.maxPoints > 0 ? (stats.totalPoints / stats.maxPoints) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* 棒グラフ */}
            <StatusBarChart achievements={achievements} />
          </div>
        </section>
        )}

        {/* 「この世に生を受ける」実績が未達成の場合は特別な表示 */}
        {isBornNotUnlocked ? (
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
                <div className="space-y-2">
                  {inProgressAchievements.map((achievement) => (
                    <AchievementListItem 
                      key={achievement.id} 
                      achievement={achievement}
                      onClick={() => setSelectedAchievementId(achievement.id)}
                    />
                  ))}
                </div>
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
                <div className="space-y-2">
                  {unlockedAchievements.map((achievement) => (
                    <AchievementListItem 
                      key={achievement.id} 
                      achievement={achievement}
                      onClick={() => setSelectedAchievementId(achievement.id)}
                    />
                  ))}
                </div>
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
