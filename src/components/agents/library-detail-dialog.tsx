"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, ChevronDown, ExternalLink, Search } from "lucide-react";
import { useGitHubAgents } from "@/hooks/use-agents";
import { useCreateAgent } from "@/hooks/use-agents";
import { useProjects } from "@/hooks/use-projects";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { AgentLibrary } from "@/types";

interface LibraryDetailDialogProps {
  library: AgentLibrary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AgentRow({ agent }: { agent: { name: string; filename: string; description: string; content: string } }) {
  const [expanded, setExpanded] = useState(false);
  const { data: projects } = useProjects();
  const { mutate: createAgent, isPending } = useCreateAgent();

  function handleAddToProject(projectPath: string, projectName: string) {
    createAgent(
      { projectPath, name: agent.name, content: agent.content },
      {
        onSuccess: () => {
          toast({
            title: "Agent added",
            description: `"${agent.name}" was added to ${projectName}.`,
          });
        },
        onError: (err) => {
          toast({
            title: "Failed to add agent",
            description: err.message,
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high transition-colors duration-100 rounded-lg">
        <Bot className="h-3.5 w-3.5 shrink-0 text-on-surface-dim" />
        <div className="min-w-0 flex-1">
          <p className="text-body-md font-semibold text-on-background leading-snug">
            {agent.name}
          </p>
          {agent.description && (
            <p className="line-clamp-1 text-body-md text-on-surface-variant mt-0.5">
              {agent.description}
            </p>
          )}
        </div>
        <span className="hidden sm:block shrink-0 font-mono text-label-sm text-on-surface-dim">
          {agent.filename}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-on-surface-variant hover:text-on-background text-label-sm"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Hide" : "View"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 gap-1 text-on-surface-variant hover:text-on-background text-label-sm"
                disabled={isPending}
              >
                Add to Project
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-surface-container ghost-border text-on-background min-w-[180px]"
            >
              {projects && projects.length > 0 ? (
                projects.map((project) => (
                  <DropdownMenuItem
                    key={project.id}
                    className="cursor-pointer hover:bg-surface-container-high focus:bg-surface-container-high"
                    onSelect={() => handleAddToProject(project.path, project.name)}
                  >
                    {project.name}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled className="text-on-surface-dim italic">
                  No projects found
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {expanded && (
        <div className="mx-4 mb-3 rounded-lg bg-surface-container-high p-4 overflow-x-auto">
          <pre className="font-mono text-label-sm text-on-surface-variant whitespace-pre-wrap leading-relaxed">
            {agent.content}
          </pre>
        </div>
      )}
    </div>
  );
}

export function LibraryDetailDialog({
  library,
  open,
  onOpenChange,
}: LibraryDetailDialogProps) {
  const [search, setSearch] = useState("");

  const { data: agents, isLoading, isError } = useGitHubAgents(
    library?.repo ?? null
  );

  const filtered = (agents ?? []).filter((agent) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      agent.name.toLowerCase().includes(q) ||
      agent.description.toLowerCase().includes(q)
    );
  });

  function handleOpenChange(next: boolean) {
    if (!next) setSearch("");
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "flex flex-col gap-0 overflow-hidden p-0 ghost-border",
          "bg-surface-container text-on-background",
          "w-full max-w-4xl max-h-[80vh]"
        )}
      >
        <DialogHeader className="shrink-0 px-6 py-4 ghost-border border-b">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div className="min-w-0">
              <DialogTitle className="text-headline-sm font-semibold text-on-background">
                {library?.name ?? "Library"}
              </DialogTitle>
              {library?.repo && (
                <a
                  href={`https://github.com/${library.repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 inline-flex items-center gap-1 font-mono text-label-sm text-on-surface-dim hover:text-primary transition-colors"
                >
                  {library.repo}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            {agents && (
              <Badge
                variant="secondary"
                className="shrink-0 bg-surface-container-high text-on-surface-variant border-outline-variant"
              >
                {agents.length} agent{agents.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-dim pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter agents…"
              className={cn(
                "pl-9 bg-surface-container-high text-on-background placeholder:text-on-surface-dim",
                "border-outline-variant focus-visible:ring-primary h-8 text-body-md"
              )}
            />
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-hidden">
          <div className="px-2 py-3 space-y-0.5">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="h-3.5 w-3.5 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
              ))
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-16 text-on-surface-dim">
                <Bot className="h-8 w-8 mb-3" />
                <p className="text-body-md">Failed to load agents from this repository.</p>
                <p className="text-label-sm mt-1 text-on-surface-dim">
                  Make sure the repo exists and contains a{" "}
                  <code className="font-mono">.claude/agents/</code> folder.
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-on-surface-dim">
                <Bot className="h-8 w-8 mb-3" />
                {search ? (
                  <p className="text-body-md">No agents match your search.</p>
                ) : (
                  <>
                    <p className="text-body-md">No agents found.</p>
                    <p className="text-label-sm mt-1">
                      This repository has no{" "}
                      <code className="font-mono">.claude/agents/</code> files.
                    </p>
                  </>
                )}
              </div>
            ) : (
              filtered.map((agent) => (
                <AgentRow key={agent.filename} agent={agent} />
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
