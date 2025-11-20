'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const unsubscribe = useAuthStore.getState().initialize();
    return unsubscribe;
  }, []);

  return <>{children}</>;
}





