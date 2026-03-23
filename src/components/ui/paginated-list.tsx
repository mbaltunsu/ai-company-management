"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginatedListProps<T> {
  items: T[];
  pageSize?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyState?: React.ReactNode;
  className?: string;
}

export function PaginatedList<T>({
  items,
  pageSize = 10,
  renderItem,
  emptyState,
  className,
}: PaginatedListProps<T>) {
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);

  const start = safePage * pageSize;
  const end = Math.min(start + pageSize, items.length);
  const pageItems = items.slice(start, end);

  if (items.length === 0) {
    return <>{emptyState ?? null}</>;
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-2">
        {pageItems.map((item, i) => renderItem(item, start + i))}
      </div>

      {/* Pagination bar — only render when there is more than one page */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1 pt-1">
          <span className="text-label-sm text-on-surface-variant">
            Showing {start + 1}–{end} of {items.length}
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 ghost-border text-on-surface-variant hover:text-on-background disabled:opacity-30"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-label-sm text-on-surface-variant tabular-nums min-w-[4rem] text-center">
              {safePage + 1} / {totalPages}
            </span>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 ghost-border text-on-surface-variant hover:text-on-background disabled:opacity-30"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage === totalPages - 1}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
