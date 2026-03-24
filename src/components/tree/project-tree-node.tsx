"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, FolderGit2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

interface ProjectTreeNodeProps {
  project: Project;
  children: Project[];
  allProjects: Project[];
  depth: number;
  isLast: boolean;
  onSetParent: (projectId: string, parentId: string | null) => void;
}

function getDescendantIds(projectId: string, allProjects: Project[]): Set<string> {
  const result = new Set<string>();
  const queue = [projectId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const directChildren = allProjects.filter((p) => p.parentId === current);
    for (const child of directChildren) {
      result.add(child.id);
      queue.push(child.id);
    }
  }
  return result;
}

export function ProjectTreeNode({
  project,
  children,
  allProjects,
  depth,
  isLast,
  onSetParent,
}: ProjectTreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = children.length > 0;

  const descendants = getDescendantIds(project.id, allProjects);
  const eligibleParents = allProjects.filter(
    (p) => p.id !== project.id && !descendants.has(p.id)
  );

  const folderColor =
    depth === 0
      ? "text-[#a78bfa]"
      : depth === 1
      ? "text-[#818cf8]"
      : "text-[#52525b]";

  // The horizontal connector lands at the vertical midpoint of the node row (20px = half of 40px row).
  // The vertical line left-offset aligns with the connector origin for each depth level.
  // Each depth step is 24px wide; the line sits at (depth-1)*24 + 20 from the container left edge.
  const lineLeft = (depth - 1) * 24 + 20;

  return (
    <div className="relative">
      {/* Vertical line — runs from top down to node midpoint (last child) or full height (non-last) */}
      {depth > 0 && (
        <div
          className="absolute border-l border-[#27272a] pointer-events-none"
          style={{
            left: `${lineLeft}px`,
            top: 0,
            height: isLast ? "20px" : "100%",
          }}
        />
      )}

      {/* Horizontal connector from vertical line to node content */}
      {depth > 0 && (
        <div
          className="absolute border-t border-[#27272a] pointer-events-none"
          style={{
            left: `${lineLeft}px`,
            top: "20px",
            width: "16px",
          }}
        />
      )}

      {/* Node content row */}
      <div
        className={cn(
          "group flex items-start gap-2 rounded-lg px-3 py-2 transition-colors",
          "hover:bg-[#1c1c27]"
        )}
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
      >
        {/* Expand / collapse toggle */}
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-0.5 shrink-0 text-[#52525b] hover:text-[#a1a1aa] transition-colors"
          aria-label={expanded ? "Collapse" : "Expand"}
          style={{ visibility: hasChildren ? "visible" : "hidden" }}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* Folder icon */}
        <FolderGit2 className={cn("mt-0.5 h-4 w-4 shrink-0", folderColor)} />

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/projects/${project.id}`}
              className="text-sm font-semibold text-[#f8f8f8] hover:text-[#a78bfa] transition-colors truncate"
            >
              {project.name}
            </Link>

            {project.githubRepo && (
              <Badge
                variant="outline"
                className="shrink-0 border-[#3f3f46] bg-transparent px-1.5 py-0 text-[10px] font-mono text-[#71717a]"
              >
                {project.githubRepo}
              </Badge>
            )}
          </div>

          {project.description && (
            <p className="mt-0.5 text-xs text-[#71717a] truncate max-w-[480px]">
              {project.description}
            </p>
          )}
        </div>

        {/* "Set Parent" dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#52525b] hover:text-[#a1a1aa]"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Move project</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 border-[#3f3f46] bg-[#18181b] text-[#f8f8f8]"
          >
            <DropdownMenuLabel className="text-xs text-[#71717a]">Move under</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#3f3f46]" />
            <DropdownMenuItem
              onClick={() => onSetParent(project.id, null)}
              className="text-sm cursor-pointer hover:bg-[#27272a] focus:bg-[#27272a]"
            >
              Move to root
            </DropdownMenuItem>
            {eligibleParents.length > 0 && (
              <DropdownMenuSeparator className="bg-[#3f3f46]" />
            )}
            {eligibleParents.map((parent) => (
              <DropdownMenuItem
                key={parent.id}
                onClick={() => onSetParent(project.id, parent.id)}
                className="text-sm cursor-pointer hover:bg-[#27272a] focus:bg-[#27272a] truncate"
              >
                {parent.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {children.map((child, index) => {
            const grandchildren = allProjects.filter((p) => p.parentId === child.id);
            return (
              <ProjectTreeNode
                key={child.id}
                project={child}
                children={grandchildren}
                allProjects={allProjects}
                depth={depth + 1}
                isLast={index === children.length - 1}
                onSetParent={onSetParent}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
