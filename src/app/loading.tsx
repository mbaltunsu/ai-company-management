import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <Skeleton className="h-8 w-[200px] bg-surface-container" />

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[100px] rounded-xl bg-surface-container" />
        ))}
      </div>

      {/* Content area */}
      <div className="grid gap-6 lg:grid-cols-[65fr_35fr]">
        <Skeleton className="h-[320px] rounded-xl bg-surface-container" />
        <Skeleton className="h-[320px] rounded-xl bg-surface-container" />
      </div>
    </div>
  );
}
