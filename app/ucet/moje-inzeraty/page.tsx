import MyAds from "@/components/dashboard/my-ads";
import MyAdsSkeleton from "@/components/dashboard/my-ads-skeleton";
import { Suspense } from "react";

export default function MojeInzeratyPage() {
  return (
    <Suspense fallback={<MyAdsSkeleton />}>
      <MyAds />
    </Suspense>
  );
}
