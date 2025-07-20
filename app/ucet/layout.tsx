import { ReactNode } from 'react';
import DashboardNav from '@/components/ui/dashboard-nav';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function UcetLayout({ children }: { children: ReactNode }) {
  return (
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
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
