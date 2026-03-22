"use client";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderKanban, Search, Plus, ScanLine } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { ProjectCard } from "@/components/dashboard/project-card";

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();

  return (
    <>
      <Header title="Projects" />
      <div className="p-6 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="relative w-[300px]">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <Input placeholder="Search projects..." className="pl-8 bg-surface-container" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 ghost-border">
              <ScanLine className="h-4 w-4" />
              <span className="text-body-md">Scan Directory</span>
            </Button>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="text-body-md">Add Project</span>
            </Button>
          </div>
        </div>

        {/* Project grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[180px] rounded-xl" />
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24">
            <FolderKanban className="h-12 w-12 text-on-surface-dim mb-4" />
            <h2 className="text-headline-sm text-on-background">No projects yet</h2>
            <p className="mt-2 text-body-md text-on-surface-variant">
              Scan a directory or manually add a project to get started.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
