import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => (() => void);
  signOut: () => Promise<void>;
}

let authSubscription: { unsubscribe: () => void } | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  
  initialize: () => {
    // 既に初期化済みの場合は何もしない
    if (get().initialized) {
      return () => {};
    }
    
    // 既存のサブスクリプションがあればクリーンアップ
    if (authSubscription) {
      authSubscription.unsubscribe();
    }
    
    set({ initialized: true });
    const supabase = createClient();
    
    // 初回のセッション取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ user: session?.user ?? null, loading: false });
    });
    
    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, loading: false });
    });
    
    authSubscription = subscription;
    
    // クリーンアップ関数を返す
    return () => {
      subscription.unsubscribe();
      authSubscription = null;
      set({ initialized: false });
    };
  },
  
  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null });
  },
}));

