'use client';

import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  accessor: (row: T) => string | number;
  cell?: (row: T) => ReactNode;
}

export interface Action<T> {
  key: string;
  icon: ReactNode;
  onClick: (row: T) => void;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'icon';
}
