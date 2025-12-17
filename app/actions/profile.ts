'use server';

import { createServerSupabaseClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_public: boolean;
}

/**
 * 現在のユーザーのプロフィールを取得
 */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, is_public')
    .eq('id', user.id)
    .single();

  if (error) {
    // プロフィールが存在しない場合は作成
    if (error.code === 'PGRST116') {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          display_name: user.user_metadata?.name || user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          is_public: false,
        })
        .select('id, display_name, avatar_url, is_public')
        .single();

      if (insertError) {
        console.error('Error creating profile:', insertError);
        return null;
      }
      return newProfile;
    }
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

/**
 * プロフィールを更新
 */
export async function updateProfile(
  displayName: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'ログインが必要です' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: displayName,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: 'プロフィールの更新に失敗しました' };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
