"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderKanban, Search, Plus, ScanLine } from "lucide-react";
import { useProjects, useScanProjects } from "@/hooks/use-projects";
import { ProjectCard } from "@/components/dashboard/project-card";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

function ScanDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [scanPath, setScanPath] = useState("");
  const scanMutation = useScanProjects();

  function handleOpenChange(next: boolean) {
    if (!next) setScanPath("");
    onOpenChange(next);
  }

  function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!scanPath.trim()) return;

    scanMutation.mutate(
      { rootPath: scanPath.trim() },
      {
        onSuccess: () => {
          toast.success("Directory scanned successfully");
          handleOpenChange(false);
        },
        onError: (err: Error) => {
          toast.error(err.message);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-surface-container ghost-border sm:max-w-sm text-on-background">
        <DialogHeader>
          <DialogTitle className="text-headline-sm text-on-background">
            Scan Directory
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleScan} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label
              htmlFor="scan-path"
              className="text-label-sm text-on-surface-variant"
            >
              Root Path
            </label>
            <Input
              id="scan-path"
              value={scanPath}
              onChange={(e) => setScanPath(e.target.value)}
              placeholder="/home/user/projects"
              className="bg-surface-container-high border-outline-variant text-on-background placeholder:text-on-surface-dim font-mono focus-visible:ring-primary"
              disabled={scanMutation.isPending}
              autoFocus
            />
            <p className="text-label-sm text-on-surface-dim">
              Scans for Claude Code projects recursively inside this path.
            </p>
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              className="text-on-surface-variant"
              disabled={scanMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={scanMutation.isPending || !scanPath.trim()}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {scanMutation.isPending ? "Scanning..." : "Scan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const [createOpen, setCreateOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
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
              className="pl-8 bg-surface-container"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 ghost-border"
              onClick={() => setScanOpen(true)}
            >
              <ScanLine className="h-4 w-4" />
              <span className="text-body-md">Scan Directory</span>
            </Button>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => setCreateOpen(true)}
            >
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
                : "Scan a directory or manually add a project to get started."}
            </p>
          </div>
        )}
      </div>

      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ScanDialog open={scanOpen} onOpenChange={setScanOpen} />
    </>
  );
}
