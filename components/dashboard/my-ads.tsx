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
    <div>
      <h1 className="text-xl font-bold mb-4">Moje inzeráty</h1>
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
