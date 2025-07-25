import MainDashboard from "@/components/dashboard/main-dashboard";
import MyAds from "@/components/dashboard/my-ads";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <MainDashboard />
      <MyAds />
    </div>
  );
}
