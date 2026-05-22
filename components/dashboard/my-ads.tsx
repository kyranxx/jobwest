"use client"

import { useJobs } from '@/hooks/use-jobs';
import MyAdsList from './my-ads-list';
import MyAdsSkeleton from './my-ads-skeleton';
import { memo } from 'react';

function MyAds() {
  const { jobs, loading, error, invalidateCache } = useJobs();

  if (loading) {
    return <MyAdsSkeleton />;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-950">Moje inzeráty</h1>
          <p className="text-sm text-slate-500">Správa publikovaných ponúk a zvýraznení.</p>
        </div>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-4">
          Chyba pri načítaní inzerátov: {error}
        </div>
      )}
      <MyAdsList jobs={jobs} onInvalidateJobs={invalidateCache} />
    </div>
  );
}

export default memo(MyAds);
