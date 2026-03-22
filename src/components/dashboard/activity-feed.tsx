"use client";

import { GitCommit, CircleDot, Tag, Bot, GitBranch, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivityEntry, ActivityType } from "@/types";

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 30) return `${Math.floor(diffDays / 30)}mo ago`;
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return "just now";
}

const ACTIVITY_CONFIG: Record<
  ActivityType,
  { icon: React.ComponentType<{ className?: string }>; color: string; dotColor: string; label: string }
> = {
  commit: {
    icon: GitCommit,
    color: "text-success",
    dotColor: "bg-success",
    label: "Commit",
  },
  issue: {
    icon: CircleDot,
    color: "text-primary",
    dotColor: "bg-primary",
    label: "Issue",
  },
  release: {
    icon: Tag,
    color: "text-warning",
    dotColor: "bg-warning",
    label: "Release",
  },
  agent_change: {
    icon: Bot,
    color: "text-on-surface-variant",
    dotColor: "bg-on-surface-variant",
    label: "Agent",
  },
  branch: {
    icon: GitBranch,
    color: "text-primary",
    dotColor: "bg-primary",
    label: "Branch",
  },
};

interface ActivityItemProps {
  entry: ActivityEntry;
  isLast: boolean;
}

function ActivityItem({ entry, isLast }: ActivityItemProps) {
  const config = ACTIVITY_CONFIG[entry.type];
  const Icon = config.icon;
  const projectName =
    typeof entry.metadata?.projectName === "string" ? entry.metadata.projectName : null;

  return (
    <div className="group flex gap-3">
      <div className="flex flex-col items-center shrink-0">
        <div
          className={cn(
            "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
            "bg-surface-container-high border border-outline-variant/50",
            "transition-colors duration-150 group-hover:border-outline-variant"
          )}
        >
          <div className={cn("h-2 w-2 rounded-full", config.dotColor)} />
        </div>
        {!isLast && (
          <div className="mt-1 w-px flex-1 bg-outline-variant/30 min-h-[16px]" />
        )}
      </div>

      <div className={cn("flex flex-col gap-1 pb-4", isLast && "pb-0")}>
        <div className="flex flex-wrap items-center gap-2">
          <div className={cn("flex items-center gap-1.5 text-label-sm uppercase tracking-widest", config.color)}>
            <Icon className="h-3 w-3" />
            <span>{config.label}</span>
          </div>

          {projectName && (
            <span className="inline-flex items-center rounded-md bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant border border-outline-variant/40">
              {projectName}
            </span>
          )}
        </div>

        <p className="text-body-md text-on-background leading-snug">
          {entry.title}
        </p>

        <span className="text-label-sm text-on-surface-dim">
          {formatRelativeTime(entry.occurredAt)}
        </span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container-high border border-outline-variant/50">
        <Activity className="h-6 w-6 text-on-surface-dim" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-headline-sm text-on-background">No activity yet</p>
        <p className="text-body-md text-on-surface-variant max-w-[220px]">
          Connect a project and start committing to see your activity stream here.
        </p>
      </div>
    </div>
  );
}

interface ActivityFeedProps {
  activities: ActivityEntry[];
  className?: string;
}

export function ActivityFeed({ activities, className }: ActivityFeedProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-headline-sm text-on-background">Recent Activity</h2>
        {activities.length > 0 && (
          <span className="text-label-sm text-on-surface-dim uppercase tracking-widest">
            {activities.length} events
          </span>
        )}
      </div>

      {activities.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col">
          {activities.map((entry, index) => (
            <ActivityItem
              key={entry.id}
              entry={entry}
              isLast={index === activities.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
