"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, ChevronRight, ExternalLink, FolderOpen } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/hooks/use-projects";
import { useAgents } from "@/hooks/use-agents";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

// ---------------------------------------------------------------------------
// Per-project agent summary row
// ---------------------------------------------------------------------------

function ProjectAgentSection({ project }: { project: Project }) {
  const { data: agents, isLoading } = useAgents(project.path);

  return (
    <div className="rounded-xl bg-surface-container ghost-border overflow-hidden">
      {/* Project header */}
      <div className="flex items-center justify-between gap-4 px-5 py-4 bg-surface-container-high">
        <div className="flex items-center gap-3 min-w-0">
          <FolderOpen className="h-4 w-4 shrink-0 text-primary" />
          <p className="text-body-md font-semibold text-on-background truncate">{project.name}</p>
          {isLoading ? null : (
            <span className="shrink-0 text-label-sm uppercase tracking-wide text-on-surface-dim">
              {agents?.length ?? 0} agent{agents?.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <Link href={`/projects/${project.id}/agents`}>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 gap-1.5 text-on-surface-variant hover:text-on-background"
          >
            Manage
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Agent list */}
      {isLoading ? (
        <div className="px-5 py-4 space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-9 rounded-lg" />
          ))}
        </div>
      ) : agents && agents.length > 0 ? (
        <ul className="divide-y divide-transparent">
          {agents.map((agent) => (
            <li
              key={agent.filename}
              className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-surface-container-high transition-colors duration-100"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Bot className="h-3.5 w-3.5 shrink-0 text-on-surface-dim" />
                <p className="text-body-md font-medium text-on-background truncate">
                  {agent.name}
                </p>
                {agent.description && (
                  <p className="hidden sm:block text-body-md text-on-surface-variant truncate">
                    {agent.description}
                  </p>
                )}
              </div>
              <span className="shrink-0 font-mono text-label-sm uppercase tracking-wide text-on-surface-dim">
                {agent.filename}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex items-center gap-3 px-5 py-4 text-body-md text-on-surface-dim italic">
          <Bot className="h-4 w-4" />
          No agents configured for this project.
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton for project sections
// ---------------------------------------------------------------------------

function ProjectSectionSkeleton() {
  return (
    <div className="rounded-xl bg-surface-container ghost-border overflow-hidden">
      <div className="bg-surface-container-high px-5 py-4">
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="px-5 py-4 space-y-2">
        <Skeleton className="h-9 rounded-lg" />
        <Skeleton className="h-9 rounded-lg" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AgentsPage() {
  const { data: projects, isLoading } = useProjects();

  const hasProjects = !isLoading && projects && projects.length > 0;

  return (
    <>
      <Header title="Agents" />

      <div className="p-6 space-y-6">
        {/* Page heading */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-display-sm text-on-background">Agent Management</h1>
            <p className="mt-1 text-body-md text-on-surface-variant">
              View and manage agents across all your projects.
            </p>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            <ProjectSectionSkeleton />
            <ProjectSectionSkeleton />
          </div>
        ) : hasProjects ? (
          <div className="space-y-4">
            {projects.map((project) => (
              <ProjectAgentSection key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-xl ghost-border",
              "bg-surface-container py-24"
            )}
          >
            <Bot className="h-12 w-12 text-on-surface-dim mb-4" />
            <h2 className="text-headline-sm text-on-background">No projects found</h2>
            <p className="mt-2 text-body-md text-on-surface-variant text-center max-w-xs">
              Add a project first, then configure agents for it.
            </p>
            <Link href="/projects" className="mt-5">
              <Button
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                size="sm"
              >
                <ExternalLink className="h-4 w-4" />
                Go to Projects
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
