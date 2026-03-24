"use client";

import { useMemo, useCallback } from "react";
import { FolderGit2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { ProjectTreeNode } from "@/components/tree/project-tree-node";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/hooks/use-projects";
import { useUpdateProject } from "@/hooks/use-projects";
import type { Project } from "@/types";

function buildTree(projects: Project[]): Map<string | null, Project[]> {
  const map = new Map<string | null, Project[]>();
  for (const project of projects) {
    const key = project.parentId ?? null;
    const existing = map.get(key) ?? [];
    existing.push(project);
    map.set(key, existing);
  }
  return map;
}

function TreeSkeleton() {
  return (
    <div className="space-y-1 px-4 py-3">
      {/* Root level */}
      <div className="flex items-center gap-2 px-3 py-2">
        <Skeleton className="h-4 w-4 rounded bg-[#27272a]" />
        <Skeleton className="h-4 w-4 rounded bg-[#27272a]" />
        <Skeleton className="h-4 w-40 rounded bg-[#27272a]" />
      </div>
      {/* Depth 1 */}
      <div className="flex items-center gap-2 py-2" style={{ paddingLeft: "36px" }}>
        <Skeleton className="h-4 w-4 rounded bg-[#27272a]" />
        <Skeleton className="h-4 w-4 rounded bg-[#27272a]" />
        <Skeleton className="h-4 w-56 rounded bg-[#27272a]" />
      </div>
      <div className="flex items-center gap-2 py-2" style={{ paddingLeft: "36px" }}>
        <Skeleton className="h-4 w-4 rounded bg-[#27272a]" />
        <Skeleton className="h-4 w-4 rounded bg-[#27272a]" />
        <Skeleton className="h-4 w-48 rounded bg-[#27272a]" />
      </div>
      {/* Depth 2 */}
      <div className="flex items-center gap-2 py-2" style={{ paddingLeft: "60px" }}>
        <Skeleton className="h-4 w-4 rounded bg-[#27272a] invisible" />
        <Skeleton className="h-4 w-4 rounded bg-[#27272a]" />
        <Skeleton className="h-4 w-32 rounded bg-[#27272a]" />
      </div>
      {/* Root level 2 */}
      <div className="flex items-center gap-2 px-3 py-2 mt-2">
        <Skeleton className="h-4 w-4 rounded bg-[#27272a] invisible" />
        <Skeleton className="h-4 w-4 rounded bg-[#27272a]" />
        <Skeleton className="h-4 w-44 rounded bg-[#27272a]" />
      </div>
      {/* Root level 3 */}
      <div className="flex items-center gap-2 px-3 py-2">
        <Skeleton className="h-4 w-4 rounded bg-[#27272a]" />
        <Skeleton className="h-4 w-4 rounded bg-[#27272a]" />
        <Skeleton className="h-4 w-36 rounded bg-[#27272a]" />
      </div>
    </div>
  );
}

export default function TreePage() {
  const { data: projects, isLoading } = useProjects();
  const updateProject = useUpdateProject();

  const treeMap = useMemo(
    () => buildTree(projects ?? []),
    [projects]
  );

  const rootProjects = useMemo(
    () => treeMap.get(null) ?? [],
    [treeMap]
  );

  const handleSetParent = useCallback(
    (projectId: string, parentId: string | null) => {
      const allProjects = projects ?? [];
      const project = allProjects.find((p) => p.id === projectId);
      const parent = parentId ? allProjects.find((p) => p.id === parentId) : null;

      updateProject.mutate(
        { id: projectId, parentId },
        {
          onSuccess: () => {
            if (parentId === null) {
              toast.success(`Moved "${project?.name ?? "project"}" to root`);
            } else {
              toast.success(
                `Moved "${project?.name ?? "project"}" under "${parent?.name ?? "project"}"`
              );
            }
          },
          onError: (err) => {
            toast.error(`Failed to move project: ${err.message}`);
          },
        }
      );
    },
    [projects, updateProject]
  );

  const isEmpty = !isLoading && rootProjects.length === 0 && (projects ?? []).length === 0;

  return (
    <>
      <Header title="Project Tree" />

      <main className="p-6">
        <div className="rounded-xl border border-[#27272a] bg-[#18181b] overflow-hidden">
          {isLoading ? (
            <TreeSkeleton />
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <FolderGit2 className="h-12 w-12 text-[#3f3f46]" />
              <p className="text-sm font-medium text-[#71717a]">No projects yet</p>
              <p className="text-xs text-[#52525b]">
                Add projects from the Projects page to see them here.
              </p>
            </div>
          ) : (
            <div className="py-2">
              {rootProjects.map((project) => {
                const children = treeMap.get(project.id) ?? [];
                return (
                  <ProjectTreeNode
                    key={project.id}
                    project={project}
                    children={children}
                    allProjects={projects ?? []}
                    depth={0}
                    onSetParent={handleSetParent}
                  />
                );
              })}
              {/* Orphaned nodes: parentId set to a non-existent project */}
              {(projects ?? [])
                .filter(
                  (p) =>
                    p.parentId !== null &&
                    !(projects ?? []).some((other) => other.id === p.parentId) &&
                    !(treeMap.get(null) ?? []).some((r) => r.id === p.id)
                )
                .map((project) => {
                  const children = treeMap.get(project.id) ?? [];
                  return (
                    <ProjectTreeNode
                      key={project.id}
                      project={project}
                      children={children}
                      allProjects={projects ?? []}
                      depth={0}
                      onSetParent={handleSetParent}
                    />
                  );
                })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
