import { getSupabaseServerClient } from "@/lib/utils/supabase/server";
import JobPortalClient from "@/components/ui/job-portal-client";
import { demoJobs } from "@/lib/demo-jobs";
import { mapJobRowToJob } from "@/lib/jobs";

export default async function JobPortalPage() {
  const supabase = getSupabaseServerClient();
  const { data: jobsData, error } = await supabase.from("jobs").select("*");

  const jobs = jobsData?.map(mapJobRowToJob) ?? null;

  return <JobPortalClient jobs={!error && jobs?.length ? jobs : demoJobs} isDemoMode={!!error || !jobs?.length} />;
}
