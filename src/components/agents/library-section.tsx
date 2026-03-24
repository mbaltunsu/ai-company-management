"use client";

import { useState } from "react";
import { BookMarked, Library, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLibraries, useDeleteLibrary } from "@/hooks/use-libraries";
import { useGitHubAgents } from "@/hooks/use-agents";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AddLibraryDialog } from "./add-library-dialog";
import { LibraryDetailDialog } from "./library-detail-dialog";
import type { AgentLibrary } from "@/types";

// ---------------------------------------------------------------------------
// Individual library card
// ---------------------------------------------------------------------------

function LibraryCard({
  library,
  onSelect,
  onDelete,
}: {
  library: AgentLibrary;
  onSelect: (lib: AgentLibrary) => void;
  onDelete: (lib: AgentLibrary) => void;
}) {
  const { data: agents } = useGitHubAgents(library.repo);

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl bg-surface-container p-5",
        "ghost-border transition-colors duration-150 hover:bg-surface-container-high cursor-pointer"
      )}
      onClick={() => onSelect(library)}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <BookMarked className="h-4 w-4 shrink-0 text-primary" />
          <p className="text-body-md font-semibold text-on-background truncate">
            {library.name}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {library.isDefault && (
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 text-label-sm"
            >
              Default
            </Badge>
          )}
          {agents !== undefined && (
            <Badge
              variant="secondary"
              className="bg-surface-container-high text-on-surface-variant border-outline-variant text-label-sm"
            >
              {agents.length} agent{agents.length !== 1 ? "s" : ""}
            </Badge>
          )}
          {!library.isDefault && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity duration-150",
                "text-on-surface-variant hover:text-destructive hover:bg-destructive/10"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(library);
              }}
              aria-label={`Remove ${library.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Repo */}
      <p className="font-mono text-label-sm text-on-surface-dim truncate">
        {library.repo}
      </p>

      {/* Description */}
      {library.description ? (
        <p className="text-body-md text-on-surface-variant line-clamp-2 leading-relaxed">
          {library.description}
        </p>
      ) : (
        <p className="text-body-md text-on-surface-dim italic">No description</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section skeleton
// ---------------------------------------------------------------------------

function LibrarySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-surface-container ghost-border p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main section
// ---------------------------------------------------------------------------

export function LibrarySection() {
  const { data: libraries, isLoading } = useLibraries();
  const { mutate: deleteLibrary } = useDeleteLibrary();

  const [addOpen, setAddOpen] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState<AgentLibrary | null>(null);

  function handleDelete(library: AgentLibrary) {
    deleteLibrary(library.id, {
      onSuccess: () => {
        toast({
          title: "Library removed",
          description: `"${library.name}" was removed.`,
        });
      },
      onError: (err) => {
        toast({
          title: "Failed to remove library",
          description: err.message,
          variant: "destructive",
        });
      },
    });
  }

  return (
    <>
      <div className="space-y-4">
        {/* Section header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Library className="h-4 w-4 text-primary" />
            <h2 className="text-headline-sm font-semibold text-on-background">
              Agent Libraries
            </h2>
          </div>
          <Button
            size="sm"
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Library
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <LibrarySkeleton />
        ) : libraries && libraries.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {libraries.map((lib) => (
              <LibraryCard
                key={lib.id}
                library={lib}
                onSelect={setSelectedLibrary}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-xl ghost-border",
              "bg-surface-container py-12"
            )}
          >
            <Library className="h-10 w-10 text-on-surface-dim mb-3" />
            <p className="text-body-md font-semibold text-on-background">
              No agent libraries yet
            </p>
            <p className="mt-1 text-body-md text-on-surface-variant text-center max-w-xs">
              Add a GitHub repository that contains a{" "}
              <code className="font-mono text-label-sm">.claude/agents/</code> folder.
            </p>
            <Button
              size="sm"
              className="mt-4 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Library
            </Button>
          </div>
        )}
      </div>

      <AddLibraryDialog open={addOpen} onOpenChange={setAddOpen} />

      <LibraryDetailDialog
        library={selectedLibrary}
        open={selectedLibrary !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedLibrary(null);
        }}
      />
    </>
  );
}
