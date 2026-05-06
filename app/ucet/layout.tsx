import { ReactNode, Suspense } from 'react';
import DashboardNav from '@/components/ui/dashboard-nav';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AuthProvider } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-1/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    </div>
  );
}

export default function UcetLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-[calc(100vh-3.5rem)] w-full bg-background">
        <aside className="hidden w-56 flex-col border-r bg-card p-4 md:flex">
          <DashboardNav />
          <div className="mt-auto pt-3 border-t">
            <Button asChild variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground">
              <Link href="/">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Späť na ponuky
              </Link>
            </Button>
          </div>
        </aside>
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-3xl">
          <Suspense fallback={<LoadingSkeleton />}>
            {children}
          </Suspense>
        </main>
      </div>
    </AuthProvider>
  );
}
