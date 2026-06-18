import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeToggle } from '@/components/theme-toggle';
import { Toaster } from '@/components/ui/sonner';
import { AppProviders } from '@/components/providers/app-providers';

const fontSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Blueprint',
  description:
    'Blueprint is a powerful and intuitive tool designed to simplify the process of building and managing your applications. With its user-friendly interface and robust features, Blueprint empowers developers to create, deploy, and maintain their projects with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Toaster />
        <AppProviders>
          <div className="fixed bottom-4 right-4 z-50">
            <ThemeToggle />
          </div>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
