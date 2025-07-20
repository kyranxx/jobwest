"use client";

import { useSearchParams } from "next/navigation";
import JobPortalClient from "@/components/ui/job-portal-client";
import { Job } from "@/lib/types";

export default function JobPortal({ jobs }: { jobs: Job[] }) {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  return (
    <JobPortalClient
      jobs={jobs}
      view={view ?? undefined}
    />
  );
}
