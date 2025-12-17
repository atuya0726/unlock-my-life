'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Achievement, AchievementStatus, AchievementDifficulty, AchievementTime } from '@/types/achievement';
import { Tag } from '@/types/tag';

// DBからのレスポンス型
interface DbAchievement {
  id: number;
  category: string;
  code: string | null;
  title: string;
  description: string | null;
  base_points: number;
  difficulty: string;
  estimated_time: string | null;
  icon_path: string | null;
  is_official: boolean;
  created_at: string;
}

interface DbTag {
  id: number;
  name: string;
  usage_count: number;
  is_official: boolean;
}

interface DbUnlock {
  achievement_id: number;
  status: 'CHALLENGING' | 'DROPPED' | 'COMPLETED';
}

interface DbAchievementTag {
  achievement_id: number;
  tag_id: number;
  tags: DbTag;
}

// ステータスをフロントエンド用に変換
function mapUnlockStatus(dbStatus: string | null): AchievementStatus {
  switch (dbStatus) {
    case 'COMPLETED':
      return 'unlocked';
    case 'CHALLENGING':
      return 'in-progress';
    case 'DROPPED':
    default:
      return 'locked';
  }
}

// 難易度をフロントエンド用に変換
function mapDifficulty(dbDifficulty: string): AchievementDifficulty {
  switch (dbDifficulty) {
    case 'easy':
      return 'easy';
    case 'normal':
      return 'normal';
    case 'hard':
      return 'hard';
    default:
      return 'unmeasurable';
  }
}

// 時間をフロントエンド用に変換
function mapTime(dbTime: string | null): AchievementTime {
  switch (dbTime) {
    case 'day':
      return 'day';
    case 'week':
      return 'week';
    case 'month':
      return 'month';
    case 'year':
      return 'year';
    default:
      return 'over';
  }
}

// 実績一覧を取得（タグ情報付き）
export async function getAchievements(): Promise<Achievement[]> {
  const supabase = await createServerSupabaseClient();
  
  // 現在のユーザーを取得
  const { data: { user } } = await supabase.auth.getUser();
  
  // 実績一覧を取得
  const { data: achievements, error: achievementsError } = await supabase
    .from('achievements')
    .select('*')
    .order('id', { ascending: true });

  if (achievementsError) {
    console.error('Error fetching achievements:', achievementsError);
    return [];
  }

  // 実績とタグの紐付けを取得
  const { data: achievementTags, error: tagsError } = await supabase
    .from('achievement_tags')
    .select(`
      achievement_id,
      tag_id,
      tags (
        id,
        name,
        usage_count,
        is_official
      )
    `);

  if (tagsError) {
    console.error('Error fetching achievement tags:', tagsError);
  }

  // ユーザーの解除状態を取得
  let userUnlocks: DbUnlock[] = [];
  if (user) {
    const { data: unlocks, error: unlocksError } = await supabase
      .from('unlocks')
      .select('achievement_id, status')
      .eq('user_id', user.id);

    if (unlocksError) {
      console.error('Error fetching unlocks:', unlocksError);
    } else {
      userUnlocks = unlocks || [];
    }
  }

  // 実績ごとのタグをマッピング
  const tagsByAchievement = new Map<number, string[]>();
  if (achievementTags) {
    for (const at of achievementTags as unknown as DbAchievementTag[]) {
      const tags = tagsByAchievement.get(at.achievement_id) || [];
      tags.push(at.tags.name);
      tagsByAchievement.set(at.achievement_id, tags);
    }
  }

  // 解除状態をマッピング
  const unlocksByAchievement = new Map<number, string>();
  for (const unlock of userUnlocks) {
    unlocksByAchievement.set(unlock.achievement_id, unlock.status);
  }

  // フロントエンド用の形式に変換
  return (achievements as DbAchievement[]).map((a): Achievement => ({
    id: a.code || String(a.id),
    title: a.title,
    description: a.description || '',
    category: a.category as Achievement['category'],
    tags: tagsByAchievement.get(a.id) || [],
    icon: a.icon_path || '🎯',
    points: a.base_points,
    difficulty: mapDifficulty(a.difficulty),
    time: mapTime(a.estimated_time),
    status: mapUnlockStatus(unlocksByAchievement.get(a.id) || null),
  }));
}

// タグ一覧を取得
export async function getTags(): Promise<Tag[]> {
  const supabase = await createServerSupabaseClient();
  
  const { data: tags, error } = await supabase
    .from('tags')
    .select('*')
    .order('usage_count', { ascending: false });

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  // フロントエンド用の形式に変換
  return (tags as DbTag[]).map((t): Tag => ({
    id: t.name, // タグはnameをidとして使用
    name: t.name,
  }));
}

// ランキング用のユーザー統計を取得
export async function getRankingUsers(): Promise<{
  users: Array<{
    id: string;
    name: string;
    avatar: string;
    totalPoints: number;
    unlockedCount: number;
    achievementRate: number;
    isCurrentUser?: boolean;
  }>;
  currentUserStats: {
    id: string;
    name: string;
    avatar: string;
    totalPoints: number;
    unlockedCount: number;
    achievementRate: number;
    isCurrentUser: boolean;
  } | null;
  totalAchievementCount: number;
}> {
  const supabase = await createServerSupabaseClient();
  
  // 現在のユーザーを取得
  const { data: { user } } = await supabase.auth.getUser();
  
  // 全実績数を取得
  const { count: totalAchievementCount } = await supabase
    .from('achievements')
    .select('*', { count: 'exact', head: true });

  // 実績のポイント情報を取得
  const { data: achievements } = await supabase
    .from('achievements')
    .select('id, base_points');

  const achievementPoints = new Map<number, number>();
  achievements?.forEach(a => achievementPoints.set(a.id, a.base_points));

  // 公開プロフィールを取得
  const { data: publicProfiles } = await supabase
    .from('profiles_view')
    .select('id, display_name, avatar_url');

  // 全ユーザーの解除状況を取得（COMPLETEDのみ）
  const { data: allUnlocks } = await supabase
    .from('unlocks')
    .select('user_id, achievement_id')
    .eq('status', 'COMPLETED');

  // ユーザーごとの統計を計算
  const userStatsMap = new Map<string, { totalPoints: number; unlockedCount: number }>();
  
  allUnlocks?.forEach(unlock => {
    const stats = userStatsMap.get(unlock.user_id) || { totalPoints: 0, unlockedCount: 0 };
    stats.totalPoints += achievementPoints.get(unlock.achievement_id) || 0;
    stats.unlockedCount += 1;
    userStatsMap.set(unlock.user_id, stats);
  });

  // ランキングユーザーを構築
  const users: Array<{
    id: string;
    name: string;
    avatar: string;
    totalPoints: number;
    unlockedCount: number;
    achievementRate: number;
    isCurrentUser?: boolean;
  }> = [];

  publicProfiles?.forEach(profile => {
    const stats = userStatsMap.get(profile.id) || { totalPoints: 0, unlockedCount: 0 };
    users.push({
      id: profile.id,
      name: profile.display_name || '名無しのプレイヤー',
      avatar: profile.avatar_url || '😊',
      totalPoints: stats.totalPoints,
      unlockedCount: stats.unlockedCount,
      achievementRate: totalAchievementCount ? Math.round((stats.unlockedCount / totalAchievementCount) * 100) : 0,
      isCurrentUser: profile.id === user?.id,
    });
  });

  // 現在のユーザーの統計（ログイン中の場合）
  let currentUserStats = null;
  if (user) {
    const stats = userStatsMap.get(user.id) || { totalPoints: 0, unlockedCount: 0 };
    
    // 現在のユーザーのプロフィールを取得
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', user.id)
      .single();

    currentUserStats = {
      id: user.id,
      name: myProfile?.display_name || 'あなた',
      avatar: myProfile?.avatar_url || '😊',
      totalPoints: stats.totalPoints,
      unlockedCount: stats.unlockedCount,
      achievementRate: totalAchievementCount ? Math.round((stats.unlockedCount / totalAchievementCount) * 100) : 0,
      isCurrentUser: true,
    };

    // 現在のユーザーがランキングに含まれていない場合は追加
    if (!users.some(u => u.id === user.id)) {
      users.push(currentUserStats);
    }
  }

  // ポイント順にソート
  users.sort((a, b) => b.totalPoints - a.totalPoints);

  return {
    users,
    currentUserStats,
    totalAchievementCount: totalAchievementCount || 0,
  };
}

// 実績のステータスを更新
export async function updateAchievementStatus(
  achievementCode: string, 
  newStatus: AchievementStatus
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();
  
  // 現在のユーザーを取得
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'ログインが必要です' };
  }

  // プロフィールが存在するか確認し、なければ作成
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!existingProfile) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        display_name: user.email?.split('@')[0] || 'プレイヤー',
        is_public: false,
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // プロフィール作成エラーでも続行を試みる
    }
  }

  // 実績IDを取得（codeで検索、見つからなければidで検索）
  let achievement: { id: number } | null = null;
  
  // まずcodeで検索
  const { data: byCode } = await supabase
    .from('achievements')
    .select('id')
    .eq('code', achievementCode)
    .maybeSingle();
  
  if (byCode) {
    achievement = byCode;
  } else {
    // codeで見つからなければ、数値IDとして検索
    const numericId = parseInt(achievementCode, 10);
    if (!isNaN(numericId)) {
      const { data: byId } = await supabase
        .from('achievements')
        .select('id')
        .eq('id', numericId)
        .maybeSingle();
      achievement = byId;
    }
  }

  if (!achievement) {
    return { success: false, error: '実績が見つかりません' };
  }

  const achievementId = achievement.id;

  // DBのステータスに変換
  let dbStatus: 'CHALLENGING' | 'DROPPED' | 'COMPLETED';
  switch (newStatus) {
    case 'unlocked':
      dbStatus = 'COMPLETED';
      break;
    case 'in-progress':
      dbStatus = 'CHALLENGING';
      break;
    case 'locked':
    default:
      dbStatus = 'DROPPED';
      break;
  }

  // lockedの場合はレコードを削除
  if (newStatus === 'locked') {
    console.log('Deleting unlock:', { user_id: user.id, achievement_id: achievementId });
    
    const { error } = await supabase
      .from('unlocks')
      .delete()
      .eq('user_id', user.id)
      .eq('achievement_id', achievementId);

    if (error) {
      console.error('Error deleting unlock:', error);
      return { success: false, error: `ステータスの更新に失敗しました: ${error.message}` };
    }
    
    // キャッシュを再検証
    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath('/ranking');
    
    return { success: true };
  }

  // upsertでステータスを更新または作成
  console.log('Upserting unlock:', { user_id: user.id, achievement_id: achievementId, status: dbStatus });
  
  const { error } = await supabase
    .from('unlocks')
    .upsert({
      user_id: user.id,
      achievement_id: achievementId,
      status: dbStatus,
      unlocked_at: newStatus === 'unlocked' ? new Date().toISOString() : null,
    }, {
      onConflict: 'user_id,achievement_id',
    });

  if (error) {
    console.error('Error updating unlock:', error);
    return { success: false, error: `ステータスの更新に失敗しました: ${error.message}` };
  }

  // キャッシュを再検証
  revalidatePath('/');
  revalidatePath('/dashboard');
  revalidatePath('/ranking');

  return { success: true };
}
