import { cn } from "../lib/cn";
import { Skeleton } from "./skeleton";

export function GameCardSkeleton({ className, overlay = false }: { className?: string; overlay?: boolean }) {
  if (overlay) return <Skeleton aria-hidden className={cn("aspect-[2/3] w-full rounded-lg", className)} />;

  return (
    <div aria-hidden className={cn("flex flex-col rounded-lg bg-card", className)}>
      <Skeleton className="aspect-[16/10] w-full rounded-none rounded-t-lg" />
      <div className="flex flex-col gap-3 p-6">
        <Skeleton className="h-[26px] w-3/4" />
        <Skeleton className="h-[18px] w-1/2" />
        <Skeleton className="h-5 w-2/5" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-36 rounded-full" />
        </div>
      </div>
    </div>
  );
}
