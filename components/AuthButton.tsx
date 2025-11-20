'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function AuthButton() {
  const { user, loading, signOut } = useAuthStore();
  console.log(user);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="px-4 py-2 text-sm text-gray-500">
        読込中...
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={() => router.push('/login')}
        className="px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md"
      >
        ログイン
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors cursor-pointer border-2 border-gray-200"
      >
        {user.user_metadata?.avatar_url && (
          <img 
            src={user.user_metadata.avatar_url} 
            alt="avatar" 
            className="w-8 h-8 rounded-full"
          />
        )}
        <span className="text-sm font-medium text-gray-700">
          {user.user_metadata?.name || user.email}
        </span>
      </button>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
      >
        ログアウト
      </button>
    </div>
  );
}

