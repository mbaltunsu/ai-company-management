"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useProject, useDeleteProject } from "@/hooks/use-projects";
import { useCommits, useBranches, useReleases } from "@/hooks/use-github";
import { toast } from "sonner";
import {
  GitBranch,
  GitCommit,
  Tag,
  Target,
  Bot,
  Trash2,
} from "lucide-react";
import { CommitGraph } from "@/components/charts/commit-graph";
import { ReleaseTimeline } from "@/components/charts/release-timeline";

function DeleteConfirmDialog({
  projectName,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-container ghost-border sm:max-w-sm text-on-background">
        <DialogHeader>
          <DialogTitle className="text-headline-sm text-on-background">
            Delete Project
          </DialogTitle>
        </DialogHeader>
        <p className="text-body-md text-on-surface-variant mt-2">
          Are you sure you want to remove{" "}
          <span className="font-semibold text-on-background">{projectName}</span> from the
          dashboard? This will not delete any files on disk.
        </p>
        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-on-surface-variant"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: project, isLoading } = useProject(id);
  const deleteMutation = useDeleteProject();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const repoName = project?.githubRepo?.split("/")[1] || null;
  const { data: commits } = useCommits(repoName);
  const { data: branches } = useBranches(repoName);
  const { data: releases } = useReleases(repoName);

  function handleDelete() {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Project removed from dashboard");
          router.push("/projects");
        },
        onError: (err: Error) => {
          toast.error(err.message);
          setDeleteOpen(false);
        },
      }
    );
  }

  if (isLoading) {
    return (
      <>
        <Header title="Project" />
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-[200px]" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-[120px] rounded-xl" />
            <Skeleton className="h-[120px] rounded-xl" />
            <Skeleton className="h-[120px] rounded-xl" />
          </div>
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Header title="Project Not Found" />
        <div className="flex items-center justify-center py-24">
          <p className="text-body-md text-on-surface-variant">Project not found.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={project.name} />
      <div className="p-6 space-y-6">
        {/* Project header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-display-sm text-on-background">{project.name}</h1>
            {project.description && (
              <p className="mt-1 text-body-md text-on-surface-variant">{project.description}</p>
            )}
            <div className="mt-3 flex items-center gap-2">
              {project.githubRepo && (
                <Badge variant="secondary" className="text-label-sm font-mono">
                  {project.githubRepo}
                </Badge>
              )}
            </div>
          </div>

          {/* Delete button */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-on-surface-variant hover:text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-label-sm">Delete</span>
          </Button>
        </div>

        {/* Stat cards row */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-surface-container p-5">
            <div className="flex items-center gap-2 text-label-sm uppercase text-on-surface-variant">
              <GitCommit className="h-3.5 w-3.5" />
              Total Commits
            </div>
            <p className="mt-2 text-display-sm text-on-background">
              {commits?.length ?? "—"}
            </p>
          </div>
          <div className="rounded-xl bg-surface-container p-5">
            <div className="flex items-center gap-2 text-label-sm uppercase text-on-surface-variant">
              <GitBranch className="h-3.5 w-3.5" />
              Active Branches
            </div>
            <p className="mt-2 text-display-sm text-on-background">
              {branches?.length ?? "—"}
            </p>
          </div>
          <div className="rounded-xl bg-surface-container p-5">
            <div className="flex items-center gap-2 text-label-sm uppercase text-on-surface-variant">
              <Tag className="h-3.5 w-3.5" />
              Releases
            </div>
            <p className="mt-2 text-display-sm text-on-background">
              {releases?.length ?? "—"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="commits" className="space-y-4">
          <TabsList className="bg-surface-container">
            <TabsTrigger value="commits" className="gap-2 text-body-md">
              <GitCommit className="h-3.5 w-3.5" />
              Commits
            </TabsTrigger>
            <TabsTrigger value="branches" className="gap-2 text-body-md">
              <GitBranch className="h-3.5 w-3.5" />
              Branches
            </TabsTrigger>
            <TabsTrigger value="releases" className="gap-2 text-body-md">
              <Tag className="h-3.5 w-3.5" />
              Releases
            </TabsTrigger>
            <TabsTrigger value="agents" className="gap-2 text-body-md">
              <Bot className="h-3.5 w-3.5" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="goals" className="gap-2 text-body-md">
              <Target className="h-3.5 w-3.5" />
              Goals
            </TabsTrigger>
          </TabsList>

          {/* Commits tab */}
          <TabsContent value="commits" className="space-y-4">
            {commits && commits.length > 0 && (
              <div className="rounded-xl bg-surface-container p-5">
                <h3 className="text-label-sm uppercase text-on-surface-variant mb-3">
                  Commit Activity
                </h3>
                <CommitGraph commits={commits} />
              </div>
            )}
            {commits && commits.length > 0 ? (
              commits.map((commit, i) => (
                <div
                  key={commit.sha}
                  className={`flex items-start justify-between p-4 rounded-xl ${
                    i % 2 === 0 ? "bg-surface-container" : "bg-surface-dim"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-body-md text-on-background truncate">{commit.message}</p>
                    <div className="mt-1 flex items-center gap-3 text-label-sm text-on-surface-variant">
                      <span className="font-mono">{commit.sha.slice(0, 7)}</span>
                      <span>{commit.author}</span>
                    </div>
                  </div>
                  <span className="text-label-sm text-on-surface-dim shrink-0 ml-4">
                    {new Date(commit.date).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <GitCommit className="mx-auto h-8 w-8 text-on-surface-dim mb-3" />
                <p className="text-body-md text-on-surface-variant">
                  {repoName ? "No commits found" : "Connect a GitHub repo to see commits"}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Branches tab */}
          <TabsContent value="branches" className="space-y-3">
            {branches && branches.length > 0 ? (
              branches.map((branch, i) => (
                <div
                  key={branch.name}
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    i % 2 === 0 ? "bg-surface-container" : "bg-surface-dim"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GitBranch className="h-4 w-4 text-primary" />
                    <span className="text-body-md font-mono text-on-background">{branch.name}</span>
                    {branch.isDefault && (
                      <Badge className="bg-success/20 text-success text-label-sm">default</Badge>
                    )}
                    {branch.isProtected && (
                      <Badge variant="secondary" className="text-label-sm">protected</Badge>
                    )}
                  </div>
                  <span className="text-label-sm font-mono text-on-surface-variant">
                    {branch.commitSha.slice(0, 7)}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <GitBranch className="mx-auto h-8 w-8 text-on-surface-dim mb-3" />
                <p className="text-body-md text-on-surface-variant">No branches found</p>
              </div>
            )}
          </TabsContent>

          {/* Releases tab */}
          <TabsContent value="releases">
            <div className="rounded-xl bg-surface-container p-5">
              <h3 className="text-label-sm uppercase text-on-surface-variant mb-4">
                Release Timeline
              </h3>
              <ReleaseTimeline releases={releases || []} />
            </div>
          </TabsContent>

          {/* Agents tab — placeholder */}
          <TabsContent value="agents">
            <div className="py-12 text-center">
              <Bot className="mx-auto h-8 w-8 text-on-surface-dim mb-3" />
              <p className="text-body-md text-on-surface-variant">
                Agent management coming soon
              </p>
            </div>
          </TabsContent>

          {/* Goals tab — placeholder */}
          <TabsContent value="goals">
            <div className="py-12 text-center">
              <Target className="mx-auto h-8 w-8 text-on-surface-dim mb-3" />
              <p className="text-body-md text-on-surface-variant">
                Goals tracking coming soon
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <DeleteConfirmDialog
        projectName={project.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
