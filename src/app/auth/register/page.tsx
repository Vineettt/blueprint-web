'use client';

import { Suspense } from 'react';

import { RegisterForm } from '@/components/auth/registerForm';
import { Header } from '@/components/layout/header';

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header
        authAction={{
          title: 'Already have an account?',
          label: 'Login',
          href: '/auth/login',
        }}
      />

      <section className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-10">
        <Suspense fallback={<div>Loading...</div>}>
          <RegisterForm />
        </Suspense>
      </section>
    </main>
  );
}
