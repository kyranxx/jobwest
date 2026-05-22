import { ReactNode } from 'react';
import DashboardNav from '@/components/ui/dashboard-nav';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/utils/supabase/server';
import { AuthProvider } from '@/hooks/use-auth';

export default async function UcetLayout({ children }: { children: ReactNode }) {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  return (
    <AuthProvider>
      <div className="flex min-h-[calc(100vh-3.5rem)] w-full bg-[#f4f6f1]">
        <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-4 md:flex">
          <DashboardNav />
          <div className="mt-auto pt-3 border-t">
            <Button asChild variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground">
              <Link href="/">
                <ArrowLeft className="mr-1.5 size-3.5" />
                Späť na ponuky
              </Link>
            </Button>
          </div>
        </aside>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:hidden">
              <DashboardNav />
            </div>
            {children}
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}
