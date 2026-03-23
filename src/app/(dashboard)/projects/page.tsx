"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderKanban, Search } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { ProjectCard } from "@/components/dashboard/project-card";
import { ImportProjectDialog } from "@/components/projects/import-project-dialog";

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const [search, setSearch] = useState("");

  const filtered = projects?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Header title="Projects" />
      <div className="p-6 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="relative w-[300px]">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <Input
              placeholder="Search projects..."
              className="pl-8 bg-surface-container selectable"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <ImportProjectDialog />
        </div>

        {/* Project grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[180px] rounded-xl" />
            ))}
          </div>
        ) : filtered && filtered.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24">
            <FolderKanban className="h-12 w-12 text-on-surface-dim mb-4" />
            <h2 className="text-headline-sm text-on-background">
              {search ? "No matching projects" : "No projects yet"}
            </h2>
            <p className="mt-2 text-body-md text-on-surface-variant">
              {search
                ? "Try a different search term."
                : "Import a GitHub repository to get started."}
            </p>
            {!search && (
              <div className="mt-6">
                <ImportProjectDialog />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
