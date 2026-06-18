'use client';

import { Card, CardContent } from '@/components/ui/card';

export function StatusScreen({
  icon,
  title,
  message,
}: {
  icon?: React.ReactNode;
  title?: string;
  message: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          {icon}

          {title && <h2 className="mt-4 text-2xl font-semibold">{title}</h2>}

          <p className="mt-2 text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}
