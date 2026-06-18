'use client';

import { Suspense } from 'react';

import { LoginForm } from '@/components/auth/loginForm';
import { Header } from '@/components/layout/header';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Header
        authAction={{
          title: "Don't have an account?",
          label: 'Sign Up',
          href: '/auth/register',
        }}
      />

      <section className="flex flex-1 items-center justify-center px-6 py-10">
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
