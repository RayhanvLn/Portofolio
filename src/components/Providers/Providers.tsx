'use client';
import type { ReactNode } from 'react';
import { SmoothScrollProvider } from './SmoothScrollProvider';
import { TransitionProvider } from '@/components/PageTransition/TransitionProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SmoothScrollProvider>
      <TransitionProvider>{children}</TransitionProvider>
    </SmoothScrollProvider>
  );
}
