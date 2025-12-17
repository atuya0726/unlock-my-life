'use client';

import { useMemo } from 'react';
import Header from '@/components/Header';
import { User } from '@/types/user';

interface RankingContentProps {
  users: User[];
  currentUserStats: User | null;
  totalAchievementCount: number;
  isLoggedIn: boolean;
  userAvatarUrl?: string | null;
}

export default function RankingContent({ 
  users, 
  currentUserStats,
  isLoggedIn,
  userAvatarUrl,
}: RankingContentProps) {
  // 全ユーザーをポイント順にソート（既にソート済みだが念のため）
  const rankedUsers = useMemo(() => {
    return [...users].sort((a, b) => b.totalPoints - a.totalPoints);
  }, [users]);

  // 現在のユーザーの順位
  const currentUserRank = currentUserStats 
    ? rankedUsers.findIndex(u => u.id === currentUserStats.id) + 1
    : 0;

  // ランクに応じたメダル
  const getMedal = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  // ランクに応じた背景色
  const getRankBg = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return 'bg-gray-100 border-4 border-gray-600 shadow-lg';
    }
    switch (rank) {
      case 1: return 'bg-white border-2 border-gray-400 shadow-md';
      case 2: return 'bg-white border-2 border-gray-300';
      case 3: return 'bg-white border-2 border-gray-300';
      default: return 'bg-white border-2 border-gray-200';
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <Header isLoggedIn={isLoggedIn} showRanking={false} userAvatarUrl={userAvatarUrl} />

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* ページタイトル */}
        <header className="mb-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 text-gray-700">
              ランキング
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              他のユーザーと競い合おう
            </p>
          </div>
        </header>

        {/* あなたの順位 */}
        {currentUserStats && (
          <section className="mb-8">
            <div className="bg-gray-700 text-white rounded-lg p-8 shadow-lg border-2 border-gray-600">
              <div className="text-center">
                <div className="text-5xl mb-2">{getMedal(currentUserRank) || '🎯'}</div>
                <div className="text-4xl font-bold mb-2">
                  あなたの順位: {currentUserRank > 0 ? `${currentUserRank}位` : '未参加'}
                </div>
                <div className="text-xl">
                  {currentUserStats.totalPoints}pt / {currentUserStats.unlockedCount}個解除 / 達成率{currentUserStats.achievementRate}%
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ランキング一覧 */}
        <section>
          <h2 className="text-3xl font-bold text-gray-700 mb-6 text-center">
            総合ランキング
          </h2>
          
          {rankedUsers.length > 0 ? (
            <div className="space-y-4">
              {rankedUsers.map((user, index) => {
                const rank = index + 1;
                const medal = getMedal(rank);
                
                return (
                  <div
                    key={user.id}
                    className={`
                      rounded-xl p-6 transition-all duration-200 hover:scale-102
                      ${getRankBg(rank, user.isCurrentUser || false)}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      {/* 左側: 順位・アバター・名前 */}
                      <div className="flex items-center gap-4">
                        {/* 順位 */}
                        <div className="text-3xl font-bold text-gray-700 w-12 text-center">
                          {medal || `${rank}`}
                        </div>
                        
                        {/* アバター */}
                        <div className="text-5xl">
                          {user.avatar}
                        </div>
                        
                        {/* 名前 */}
                        <div>
                          <div className={`text-xl font-bold ${user.isCurrentUser ? 'text-gray-800' : 'text-gray-700'}`}>
                            {user.name}
                            {user.isCurrentUser && (
                              <span className="ml-2 text-sm bg-gray-600 text-white px-2 py-1 rounded-full">
                                あなた
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            解除数: {user.unlockedCount}個 / 達成率: {user.achievementRate}%
                          </div>
                        </div>
                      </div>
                      
                      {/* 右側: ポイント */}
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-700">
                          {user.totalPoints}
                        </div>
                        <div className="text-sm text-gray-600">
                          ポイント
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-gray-200">
              <p className="text-gray-500 text-lg">まだランキング参加者がいません</p>
              <p className="text-gray-400 text-sm mt-2">プロフィールを公開設定にするとランキングに参加できます</p>
            </div>
          )}
        </section>

        {/* フッター */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>もっと実績を解除して上位を目指そう！</p>
        </footer>
      </div>
    </main>
  );
}
