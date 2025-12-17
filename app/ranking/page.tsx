import RankingContent from '@/components/RankingContent';
import { getRankingUsers } from '@/app/actions/achievements';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export default async function Ranking() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { users, currentUserStats, totalAchievementCount } = await getRankingUsers();

  // ユーザーのアバターURL
  const userAvatarUrl = user?.user_metadata?.avatar_url || null;

  return (
    <RankingContent 
      users={users}
      currentUserStats={currentUserStats}
      totalAchievementCount={totalAchievementCount}
      isLoggedIn={!!user}
      userAvatarUrl={userAvatarUrl}
    />
  );
}
