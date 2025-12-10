import MainDashboard from "@/components/dashboard/main-dashboard";
import { lazy, Suspense } from "react";
import MyAdsSkeleton from "@/components/dashboard/my-ads-skeleton";

// Lazy load MyAds component for better initial page load
const MyAds = lazy(() => import("@/components/dashboard/my-ads"));

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <MainDashboard />
      <Suspense fallback={<MyAdsSkeleton />}>
        <MyAds />
      </Suspense>
    </div>
  );
}
