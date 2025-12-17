'use client';

import Link from 'next/link';

interface HeaderProps {
  isLoggedIn: boolean;
  showRanking?: boolean;
}

export default function Header({ isLoggedIn, showRanking = true }: HeaderProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        <div className="flex items-center justify-between h-12 sm:h-14">
          {/* 左側: ロゴ */}
          <Link href="/" className="text-base sm:text-xl font-bold text-gray-700 hover:text-gray-900 transition-colors">
            Unlock My Life
          </Link>
          
          {/* 右側: ナビゲーション */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* ランキング */}
            {showRanking && (
              <Link 
                href="/ranking"
                className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="ランキング"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </Link>
            )}
            
            {/* ダッシュボード */}
            {isLoggedIn && (
              <Link 
                href="/dashboard"
                className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="ダッシュボード"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </Link>
            )}

            {/* プロフィール */}
            {isLoggedIn && (
              <Link 
                href="/profile"
                className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="プロフィール"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}
            
            {/* ログインボタン（未ログイン時のみ） */}
            {!isLoggedIn && (
              <Link 
                href="/login"
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-700 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-gray-600 transition-colors"
              >
                ログイン
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
