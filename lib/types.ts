export type HighlightTier = "standard" | "top" | "exclusive"
export type SalaryBasis = "gross" | "net" | "unspecified"

export type Job = {
  id: number | string;
  title: string;
  description: string;
  location: string;
  company: string;
  company_logo: string;
  created_at: string;
  salary_range: string;
  tags: string[];
  applications: number;
  country_code: string;
  country?: {
    code: string;
    name: string;
  };
  category: string;
  jobType: string;
  salary: string;
  salaryBasis?: SalaryBasis;
  languageRequirements?: string[];
  isTop: boolean;
  highlightTier?: HighlightTier;
  topped_at: string | null;
  accommodation_provided: boolean;
  accommodation_paid: boolean;
  companyName?: string;
  contactInfo?: string;
};

export type JobSummary = Pick<Job, "id" | "title" | "location" | "created_at">

export function getHighlightTier(job: { highlightTier?: HighlightTier; isTop?: boolean }): HighlightTier {
  if (job.highlightTier === "exclusive") return "exclusive"
  if (job.highlightTier === "top" || job.isTop) return "top"
  return "standard"
}
