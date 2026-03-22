"use client";

import Link from "next/link";
import { GitBranch, CircleDot, Bot, Clock, ExternalLink, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

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

interface StatBadgeProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  colorClass?: string;
}

function StatBadge({ icon, value, label, colorClass = "text-on-surface-variant" }: StatBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-md bg-surface-container-high px-2 py-1",
        colorClass
      )}
      title={label}
    >
      <span className="h-3 w-3 shrink-0">{icon}</span>
      <span className="text-label-sm tabular-nums">{value}</span>
    </div>
  );
}

export interface ProjectCardProps {
  project: Project;
  branchCount?: number;
  issueCount?: number;
  agentCount?: number;
  defaultBranch?: string;
}

export function ProjectCard({
  project,
  branchCount = 0,
  issueCount = 0,
  agentCount = 0,
  defaultBranch = "main",
}: ProjectCardProps) {
  const initials = project.name
    .split(/[-_\s]/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <Link href={`/projects/${project.id}`} className="group block outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-dim rounded-xl">
      <article
        className={cn(
          "relative flex h-full flex-col gap-4 rounded-xl p-5",
          "bg-surface-container border border-outline-variant/50",
          "transition-all duration-200",
          "group-hover:bg-surface-container-high group-hover:border-outline-variant",
          "group-hover:translate-y-[-1px] group-hover:shadow-lg group-hover:shadow-black/20"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm select-none">
              {initials || <Folder className="h-4 w-4" />}
            </div>

            <div className="min-w-0">
              <h3 className="text-body-md font-semibold text-on-background truncate leading-tight">
                {project.name}
              </h3>
              {project.githubRepo && (
                <p className="text-label-sm text-on-surface-dim truncate mt-0.5">
                  {project.githubRepo}
                </p>
              )}
            </div>
          </div>

          <ExternalLink
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-on-surface-dim mt-0.5",
              "opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            )}
          />
        </div>

        {project.description && (
          <p className="text-body-md text-on-surface-variant line-clamp-2 leading-relaxed -mt-1">
            {project.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          <StatBadge
            icon={<GitBranch />}
            value={branchCount}
            label="Branches"
            colorClass="text-on-surface-variant"
          />
          <StatBadge
            icon={<CircleDot />}
            value={issueCount}
            label="Open Issues"
            colorClass={issueCount > 0 ? "text-warning" : "text-on-surface-variant"}
          />
          <StatBadge
            icon={<Bot />}
            value={agentCount}
            label="Agents"
            colorClass={agentCount > 0 ? "text-success" : "text-on-surface-variant"}
          />
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-1 border-t border-outline-variant/30">
          <div className="flex items-center gap-1.5 text-on-surface-dim min-w-0">
            <GitBranch className="h-3 w-3 shrink-0" />
            <span className="text-label-sm truncate font-mono">{defaultBranch}</span>
          </div>

          <div className="flex items-center gap-1 text-on-surface-dim shrink-0">
            <Clock className="h-3 w-3" />
            <span className="text-label-sm">{formatRelativeTime(project.updatedAt)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
