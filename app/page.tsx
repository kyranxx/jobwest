import { getSupabaseServerClient } from "@/lib/utils/supabase/server";
import JobPortalClient from "@/components/ui/job-portal-client";
import { Job } from "@/lib/types";
import { countries } from "@/lib/countries_sk";

export default async function JobPortalPage() {
  const supabase = getSupabaseServerClient();
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
      accommodation_provided: !!job.accommodation_provided,
      accommodation_paid: !!job.accommodation_paid,
    };
  }) as Job[] | null;

  return <JobPortalClient jobs={jobs ?? []} />;
}
