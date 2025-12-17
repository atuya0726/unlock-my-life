'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { updateProfile, Profile } from '@/app/actions/profile';

interface ProfileContentProps {
  initialProfile: Profile | null;
}

export default function ProfileContent({ initialProfile }: ProfileContentProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = () => {
    if (!displayName.trim()) {
      setMessage({ type: 'error', text: '名前を入力してください' });
      return;
    }

    startTransition(async () => {
      const result = await updateProfile(displayName);
      if (result.success) {
        setProfile(prev => prev ? { ...prev, display_name: displayName } : null);
        setMessage({ type: 'success', text: '保存しました' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.error || '保存に失敗しました' });
      }
    });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header isLoggedIn={true} />

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* 戻るリンク */}
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          ダッシュボードに戻る
        </Link>

        <h1 className="text-3xl font-bold text-gray-700 mb-8">プロフィール編集</h1>

        {/* メッセージ */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-200">
          {/* アイコン */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-5xl">
              👤
            </div>
          </div>

          {/* 名前 */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              表示名
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-gray-500 outline-none text-lg"
              placeholder="名前を入力"
            />
          </div>

          {/* 保存ボタン */}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="w-full py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            {isPending ? '保存中...' : '保存する'}
          </button>

          <p className="text-xs text-gray-400 mt-4 text-center">
            ※ 名前とアイコンは公開されます
          </p>
        </div>
      </div>
    </main>
  );
}
