"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CircleDot, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjects } from "@/hooks/use-projects";
import { useIssues } from "@/hooks/use-github";
import { IssueRow } from "@/components/issues/issue-row";
import type { Project } from "@/types";

export default function IssuesPage() {
  const { data: projects, isLoading: loadingProjects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const repoName = selectedProject?.githubRepo?.split("/")[1] || null;
  const { data: issues, isLoading: loadingIssues } = useIssues(repoName);

  const projectsWithRepo = projects?.filter((p) => p.githubRepo) || [];

  return (
    <>
      <Header title="Issues & Goals" />
      <div className="p-6 space-y-6">
        {/* Project selector */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 ghost-border">
                <CircleDot className="h-4 w-4" />
                <span className="text-body-md">
                  {selectedProject ? selectedProject.name : "Select a project"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-on-surface-variant" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[240px]">
              {loadingProjects ? (
                <div className="p-2">
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : projectsWithRepo.length > 0 ? (
                projectsWithRepo.map((project) => (
                  <DropdownMenuItem
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="cursor-pointer"
                  >
                    <span className="text-body-md">{project.name}</span>
                    <span className="ml-auto text-label-sm font-mono text-on-surface-dim">
                      {project.githubRepo}
                    </span>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-3 text-body-md text-on-surface-variant">
                  No projects with GitHub repos
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedProject && issues && (
            <span className="text-label-sm text-on-surface-variant uppercase">
              {issues.length} open issues
            </span>
          )}
        </div>

        {/* Issues list */}
        {!selectedProject ? (
          <div className="flex flex-col items-center justify-center py-24">
            <CircleDot className="h-12 w-12 text-on-surface-dim mb-4" />
            <h2 className="text-headline-sm text-on-background">Issues & Goals</h2>
            <p className="mt-2 text-body-md text-on-surface-variant">
              Select a project above to view its GitHub issues.
            </p>
          </div>
        ) : loadingIssues ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[72px] rounded-xl bg-surface-container" />
            ))}
          </div>
        ) : issues && issues.length > 0 ? (
          <div className="space-y-2">
            {issues.map((issue, i) => (
              <IssueRow
                key={issue.number}
                issue={issue}
                variant={i % 2 === 0 ? "even" : "odd"}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <CircleDot className="h-8 w-8 text-on-surface-dim mb-3" />
            <p className="text-body-md text-on-surface-variant">No open issues</p>
          </div>
        )}
      </div>
    </>
  );
}
