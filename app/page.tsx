// Test commit to trigger Vercel deployment
import { createClient } from "@/lib/utils/supabase/server";
import JobPortalClient from "@/components/ui/job-portal-client";
import { Job } from "@/lib/types";
import { UserButton } from "@/components/auth/user-button";
import { countries } from "@/lib/countries_sk";

export default async function JobPortalPage() {
  const supabase = createClient();
  const { data: jobsData } = await supabase.from("jobs").select("*");

  const jobs = jobsData?.map((job) => {
    const country = countries.find((c) => c.code === job.country_code);
    return {
      ...job,
      tags: [],
      applications: 0,
      isTop: job.is_top,
      jobType: job.job_type,
      country: country,
    };
  }) as Job[] | null;

  return (
    <JobPortalClient
      jobs={jobs ?? []}
      userButton={<UserButton />}
    />
  );
}
