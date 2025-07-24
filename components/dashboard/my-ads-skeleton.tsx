import { Skeleton } from "@/components/ui/skeleton";

export default function MyAdsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/4" />
      <div className="space-y-2">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    </div>
  );
}
