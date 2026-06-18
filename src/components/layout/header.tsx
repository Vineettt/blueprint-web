'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { AppDropdown } from '@/components/app-dropdown';
import { LayoutDashboard, LogOut, User } from 'lucide-react';

type AuthAction = {
  title: string;
  label: string;
  href: string;
};

type Props = {
  search?: string;
  setSearch?: (v: string) => void;
  showAuthButtons?: boolean;
  authAction?: AuthAction;
};

export function Header({ search, setSearch, showAuthButtons = false, authAction }: Props) {
  const { authStatus, logout } = useAuthStore();

  const isAuthenticated = authStatus === 'authenticated';
  const hasSearch = search !== undefined && setSearch;

  const actionBtn = 'h-10 rounded-2xl px-5';

  const profileItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      visible: () => isAuthenticated,
    },
    {
      label: 'Logout',
      icon: LogOut,
      onClick: logout,
      destructive: true,
      separatorBefore: true,
      visible: () => isAuthenticated,
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      {/* TOP BAR */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* LEFT */}
        <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-full bg-primary/20 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />

            <Image
              src="/brand/logo_bg.png"
              alt="Blueprint Web"
              width={40}
              height={40}
              priority
              className="relative object-contain transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-105"
            />
          </div>

          <div className="leading-tight">
            <h1 className="text-xl font-semibold tracking-tight">Blueprint Web</h1>
            <p className="text-sm text-muted-foreground"></p>
          </div>
        </Link>

        {/* DESKTOP SEARCH */}
        {hasSearch && (
          <div className="hidden w-full max-w-md lg:block">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(e) => setSearch?.(e.target.value)}
                placeholder="Search..."
                className="h-11 rounded-2xl border-border/60 bg-background/70 pl-10 backdrop-blur"
              />
            </div>
          </div>
        )}

        {/* DESKTOP ACTIONS */}
        <div className="flex shrink-0 items-center gap-3">
          {/* AUTH / GUEST BUTTONS */}
          {authAction && !isAuthenticated && (
            <>
              <span className="text-sm text-muted-foreground">{authAction.title}</span>

              <Link href={authAction.href}>
                <Button className={actionBtn}>{authAction.label}</Button>
              </Link>
            </>
          )}

          {showAuthButtons && !isAuthenticated && !authAction && (
            <>
              <Link href="/auth/login" className="hidden md:block">
                <Button variant="outline" className={actionBtn}>
                  Login
                </Button>
              </Link>

              <Link href="/auth/register" className="hidden md:block">
                <Button className={`${actionBtn} shadow-md`}>Sign Up</Button>
              </Link>
            </>
          )}

          {/* PROFILE DROPDOWN (RIGHT SIDE) */}
          {isAuthenticated && (
            <AppDropdown
              items={profileItems}
              trigger={
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              }
            />
          )}
        </div>
      </div>

      {/* MOBILE SEARCH */}
      {hasSearch && (
        <div className="border-t border-border/50 px-4 py-4 lg:hidden">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(e) => setSearch?.(e.target.value)}
              placeholder="Search..."
              className="h-11 rounded-2xl border-border/60 bg-background/70 pl-10 backdrop-blur"
            />
          </div>
        </div>
      )}

      {/* MOBILE ACTIONS */}
      {showAuthButtons && !isAuthenticated && !authAction && (
        <div className="border-t border-border/50 px-4 py-3 md:hidden">
          <div className={`grid gap-3`}>
            <Link href="/auth/login">
              <Button variant="outline" className="h-10 w-full rounded-2xl">
                Login
              </Button>
            </Link>

            <Link href="/auth/register">
              <Button className="h-10 w-full rounded-2xl shadow-md">Sign Up</Button>
            </Link>
          </div>
        </div>
      )}

      {/* MOBILE AUTH ACTION */}
      {authAction && !isAuthenticated && (
        <div className="border-t border-border/50 px-4 py-3 md:hidden">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">{authAction.title}</span>

            <Link href={authAction.href}>
              <Button className="h-10 rounded-2xl">{authAction.label}</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
