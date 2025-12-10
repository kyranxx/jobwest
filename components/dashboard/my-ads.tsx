"use client"

import { useJobs } from '@/hooks/use-jobs';
import MyAdsList from './my-ads-list';
import MyAdsSkeleton from './my-ads-skeleton';
import { memo } from 'react';

function MyAds() {
  const { jobs, loading, error } = useJobs();

  if (loading) {
    return <MyAdsSkeleton />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Moje inzeráty</h1>
      {error && (
        <div className="text-red-500 mb-4">
          Chyba pri načítaní inzerátov: {error}
        </div>
      )}
      {!error && <MyAdsList jobs={jobs} />}
    </div>
  );
}

export default memo(MyAds);
