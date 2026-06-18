'use client';

import { Header } from '@/components/layout/header';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header showAuthButtons />

      <section className="mx-auto max-w-7xl px-6 py-10"></section>
    </main>
  );
}
