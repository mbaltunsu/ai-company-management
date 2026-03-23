"use client";

import { FolderOpen } from "lucide-react";
import { Header } from "@/components/layout/header";
import { StatsBar } from "@/components/dashboard/stats-bar";
import { ProjectCard } from "@/components/dashboard/project-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ProjectHealth } from "@/components/dashboard/project-health";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/hooks/use-projects";
import { ImportProjectDialog } from "@/components/projects/import-project-dialog";
import { cn } from "@/lib/utils";
import type { DashboardStats, ActivityEntry, ProjectHealthInfo } from "@/types";

// ---------------------------------------------------------------------------
// Placeholder data — replace with real API endpoints when available
// ---------------------------------------------------------------------------

const PLACEHOLDER_ACTIVITIES: ActivityEntry[] = [];

const PLACEHOLDER_HEALTH: ProjectHealthInfo[] = [];

// ---------------------------------------------------------------------------
// Loading skeletons
// ---------------------------------------------------------------------------

function ProjectCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-surface-container border border-outline-variant/50 p-5">
      <div className="flex items-start gap-3">
        <Skeleton className="h-9 w-9 rounded-lg bg-surface-container-high shrink-0" />
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <Skeleton className="h-4 w-3/4 bg-surface-container-high" />
          <Skeleton className="h-3 w-1/2 bg-surface-container-high" />
        </div>
      </div>
      <Skeleton className="h-3 w-full bg-surface-container-high" />
      <Skeleton className="h-3 w-4/5 bg-surface-container-high" />
      <div className="flex gap-1.5">
        <Skeleton className="h-6 w-14 rounded-md bg-surface-container-high" />
        <Skeleton className="h-6 w-14 rounded-md bg-surface-container-high" />
        <Skeleton className="h-6 w-14 rounded-md bg-surface-container-high" />
      </div>
      <div className="flex justify-between pt-1 border-t border-outline-variant/30">
        <Skeleton className="h-3 w-16 bg-surface-container-high" />
        <Skeleton className="h-3 w-12 bg-surface-container-high" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyProjectsState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-surface-container border border-outline-variant/50 py-24 gap-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container-high border border-outline-variant/50">
        <FolderOpen className="h-7 w-7 text-on-surface-dim" />
      </div>
      <div className="text-center space-y-2 max-w-[300px]">
        <p className="text-headline-sm text-on-background">No projects yet</p>
        <p className="text-body-md text-on-surface-variant">
          Import a GitHub repository to bring your projects into the dashboard.
        </p>
      </div>
      <ImportProjectDialog />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { data: projects, isLoading, error } = useProjects();

  const hasProjects = projects && projects.length > 0;

  // Aggregate stats from real project data
  const stats: DashboardStats = {
    totalProjects: projects?.length ?? 0,
    activeAgents: 0,   // requires per-project agent fetch — deferred
    openIssues: 0,     // requires per-project GitHub calls — deferred
    commitsThisWeek: 0, // requires per-project GitHub calls — deferred
  };

  return (
    <>
      <Header title="Dashboard" />

      <div className="space-y-6 p-6">
        {/* Stats bar */}
        <StatsBar stats={isLoading ? null : stats} isLoading={isLoading} />

        {/* Middle row: Activity + Health */}
        <div className="grid gap-6 lg:grid-cols-[65fr_35fr]">
          <div
            className={cn(
              "rounded-xl bg-surface-container border border-outline-variant/50 p-6",
              "min-h-[320px]"
            )}
          >
            <ActivityFeed activities={PLACEHOLDER_ACTIVITIES} />
          </div>

          <div
            className={cn(
              "rounded-xl bg-surface-container border border-outline-variant/50 p-6",
              "min-h-[320px]"
            )}
          >
            <ProjectHealth items={PLACEHOLDER_HEALTH} />
          </div>
        </div>

        {/* Projects grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-headline-sm text-on-background">Projects</h2>

            {hasProjects && (
              <span className="text-label-sm text-on-surface-dim uppercase tracking-widest">
                {projects.length} registered
              </span>
            )}
          </div>

          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-5 py-4 mb-4">
              <p className="text-body-md text-destructive">
                Failed to load projects. Check your connection and try again.
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          ) : !hasProjects ? (
            <EmptyProjectsState />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  branchCount={0}
                  issueCount={0}
                  agentCount={0}
                  defaultBranch="main"
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
