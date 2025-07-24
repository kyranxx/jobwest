"use client";

import { type User } from '@supabase/supabase-js';
import MyAdsList from './my-ads-list';

type Job = {
  id: string;
  title: string;
  location: string;
  created_at: string;
};

type MyAdsClientProps = {
  initialJobs: Job[];
  user: User | null;
};

export default function MyAdsClient({ initialJobs, user }: MyAdsClientProps) {
  return <MyAdsList jobs={initialJobs} user={user} />;
}
