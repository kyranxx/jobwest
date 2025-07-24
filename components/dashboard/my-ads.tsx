import { getSupabaseServerClient } from '@/lib/utils/supabase/server';
import MyAdsClient from './my-ads-client';

type Job = {
  id: string;
  title: string;
  location: string;
  created_at: string;
};

export default async function MyAds() {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  let jobs: Job[] = [];
  let error: string | null = null;

  if (user) {
    const { data, error: fetchError } = await supabase
      .from('jobs')
      .select('id, title, location, created_at')
      .eq('user_id', user.id);

    if (fetchError) {
      error = fetchError.message;
    } else {
      jobs = data as Job[];
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Moje inzeráty</h1>
      {error && <p>Chyba pri načítaní inzerátov: {error}</p>}
      {!error && <MyAdsClient initialJobs={jobs} user={user} />}
    </div>
  );
}
