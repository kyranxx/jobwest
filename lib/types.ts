export type Job = {
  id: number;
  title: string;
  description: string;
  location: string;
  company: string;
  company_logo: string;
  created_at: string;
  salary_range: string;
  tags: string[];
  applications: number;
  // Properties for list view from page.tsx
  country_code: string;
  country?: {
    code: string;
    name: string;
  };
  category: string;
  jobType: string;
  salary: string;
  isTop: boolean;
  topped_at: string | null;
  accommodation_provided: boolean;
  accommodation_paid: boolean;
};
