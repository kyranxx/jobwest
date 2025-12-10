"use client";

import MyAdsList from './my-ads-list';

type Job = {
  id: string;
  title: string;
  location: string;
  created_at: string;
};

type MyAdsClientProps = {
  initialJobs: Job[];
};

export default function MyAdsClient({ initialJobs }: MyAdsClientProps) {
  return <MyAdsList jobs={initialJobs} />;
}
