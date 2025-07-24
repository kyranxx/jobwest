import MainDashboard from "@/components/dashboard/main-dashboard";
import { Suspense } from "react";
import UcetLoading from "./loading";

export default function UcetPage() {
  return (
    <Suspense fallback={<UcetLoading />}>
      <MainDashboard />
    </Suspense>
  );
}
