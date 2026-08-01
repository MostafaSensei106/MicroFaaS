'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/features/auth/presentation/context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#0066cc]/30 border-t-[#0066cc] rounded-full animate-spin" />
        <p className="text-[#1d1d1f] tracking-widest uppercase" style={{ fontSize: '12px', fontWeight: 400 }}>Redirecting to MicroFaaS Gateway...</p>
      </div>
    </div>
  );
}
