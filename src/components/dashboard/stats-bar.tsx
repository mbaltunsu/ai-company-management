"use client";

import { FolderKanban, Bot, CircleDot, GitCommit, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/types";

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
  colorClass: string;
  bgClass: string;
}

function StatCard({ label, value, icon, trend, colorClass, bgClass }: StatCardProps) {
  const TrendIcon =
    trend === undefined || trend === 0
      ? Minus
      : trend > 0
        ? TrendingUp
        : TrendingDown;

  const trendColor =
    trend === undefined || trend === 0
      ? "text-on-surface-dim"
      : trend > 0
        ? "text-success"
        : "text-destructive";

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-4 rounded-xl bg-surface-container p-5",
        "border border-outline-variant/50",
        "transition-all duration-200 hover:bg-surface-container-high hover:border-outline-variant",
        "overflow-hidden"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-label-sm uppercase tracking-widest text-on-surface-variant">
          {label}
        </span>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", bgClass)}>
          <span className={cn("h-4 w-4", colorClass)}>{icon}</span>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <span className="text-display-sm tabular-nums text-on-background">
          {value.toLocaleString()}
        </span>

        {trend !== undefined && (
          <div className={cn("flex items-center gap-1 text-label-sm", trendColor)}>
            <TrendIcon className="h-3 w-3" />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 h-[2px] opacity-0 transition-opacity duration-200 group-hover:opacity-100",
          colorClass.replace("text-", "bg-")
        )}
      />
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-surface-container border border-outline-variant/50 p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-28 bg-surface-container-high" />
        <Skeleton className="h-8 w-8 rounded-lg bg-surface-container-high" />
      </div>
      <div className="flex items-end justify-between">
        <Skeleton className="h-8 w-20 bg-surface-container-high" />
        <Skeleton className="h-3 w-10 bg-surface-container-high" />
      </div>
    </div>
  );
}

interface StatsBarProps {
  stats: DashboardStats | null;
  isLoading?: boolean;
}

const STAT_CONFIGS = [
  {
    key: "totalProjects" as const,
    label: "Total Projects",
    icon: <FolderKanban />,
    colorClass: "text-primary",
    bgClass: "bg-primary/10",
    trend: 12,
  },
  {
    key: "activeAgents" as const,
    label: "Active Agents",
    icon: <Bot />,
    colorClass: "text-success",
    bgClass: "bg-success/10",
    trend: 8,
  },
  {
    key: "openIssues" as const,
    label: "Open Issues",
    icon: <CircleDot />,
    colorClass: "text-warning",
    bgClass: "bg-warning/10",
    trend: -3,
  },
  {
    key: "commitsThisWeek" as const,
    label: "Commits This Week",
    icon: <GitCommit />,
    colorClass: "text-primary",
    bgClass: "bg-primary/10",
    trend: 24,
  },
] as const;

export function StatsBar({ stats, isLoading = false }: StatsBarProps) {
  if (isLoading || stats === null) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STAT_CONFIGS.map((config) => (
        <StatCard
          key={config.key}
          label={config.label}
          value={stats[config.key]}
          icon={config.icon}
          trend={config.trend}
          colorClass={config.colorClass}
          bgClass={config.bgClass}
        />
      ))}
    </div>
  );
}
