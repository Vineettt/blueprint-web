'use client';

import { StatusScreen } from '@/components/StatusScreen';
import { LoadingSpinner } from './loading-spinner';

export function GlobalLoading({
  message = 'Loading...',
  size = 'lg',
}: {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  return <StatusScreen icon={<LoadingSpinner size={size} />} message={message} />;
}
