import { ReactNode, Suspense } from 'react';
import DashboardNav from '@/components/ui/dashboard-nav';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AuthProvider } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}

export default function UcetLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen w-full">
        <aside className="hidden w-64 flex-col border-r bg-background p-4 md:flex">
          <DashboardNav />
          <div className="mt-auto">
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Späť na ponuky
              </Link>
            </Button>
          </div>
        </aside>
        <main className="flex-1 p-4 md:p-8">
          <Suspense fallback={<LoadingSkeleton />}>
            {children}
          </Suspense>
        </main>
      </div>
    </AuthProvider>
  );
}
