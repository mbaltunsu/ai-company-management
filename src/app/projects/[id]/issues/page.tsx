"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { GoalCard } from "@/components/goals/goal-card";
import { CreateGoalDialog } from "@/components/goals/create-goal-dialog";
import { useProject } from "@/hooks/use-projects";
import { useIssues, useCreateIssue } from "@/hooks/use-github";
import { useGoals, useUpdateGoal, useDeleteGoal } from "@/hooks/use-goals";
import { CircleDot, AlertCircle, Target, Plus } from "lucide-react";
import type { Goal, GitHubLabel } from "@/types";
import { cn } from "@/lib/utils";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

// ─── Label pill ───────────────────────────────────────────────────────────────

function LabelPill({ label }: { label: GitHubLabel }) {
  const color = label.color.startsWith("#") ? label.color : `#${label.color}`;
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-label-sm font-medium"
      style={{
        backgroundColor: `rgba(${hexToRgb(color)}, 0.18)`,
        color,
        border: `1px solid rgba(${hexToRgb(color)}, 0.35)`,
      }}
    >
      {label.name}
    </span>
  );
}

// ─── Create Issue Dialog ──────────────────────────────────────────────────────

interface CreateIssueDialogProps {
  repo: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CreateIssueDialog({ repo, open, onOpenChange }: CreateIssueDialogProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createIssue = useCreateIssue();

  function reset() {
    setTitle("");
    setBody("");
    setError(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Issue title is required.");
      return;
    }
    try {
      await createIssue.mutateAsync({ repo, title: title.trim(), body: body.trim() || undefined });
      handleOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create issue.");
    }
  }

  const inputClass =
    "bg-surface-container-high border-[#1f1f23] text-on-background placeholder:text-on-surface-dim focus-visible:ring-primary focus-visible:border-primary";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-surface-container border-[#1f1f23] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-headline-sm text-on-background">New Issue</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label htmlFor="issue-title" className="text-label-sm text-on-surface-variant">
              Title <span className="text-red-400">*</span>
            </label>
            <Input
              id="issue-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Something isn't working"
              className={inputClass}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="issue-body" className="text-label-sm text-on-surface-variant">
              Description
            </label>
            <textarea
              id="issue-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe the issue..."
              rows={4}
              className={cn(
                "flex w-full rounded-md border px-3 py-2 text-sm resize-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
                inputClass
              )}
            />
          </div>
          {error && <p className="text-label-sm text-red-400">{error}</p>}
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              className="text-on-surface-variant"
              disabled={createIssue.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createIssue.isPending}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {createIssue.isPending ? "Creating..." : "Create Issue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Goal Dialog ─────────────────────────────────────────────────────────

interface EditGoalDialogProps {
  goal: Goal | null;
  onOpenChange: (open: boolean) => void;
}

function EditGoalDialog({ goal, onOpenChange }: EditGoalDialogProps) {
  const [title, setTitle] = useState(goal?.title ?? "");
  const [description, setDescription] = useState(goal?.description ?? "");
  const [progress, setProgress] = useState(String(goal?.progress ?? 0));
  const [status, setStatus] = useState<Goal["status"]>(goal?.status ?? "active");
  const [error, setError] = useState<string | null>(null);
  const updateGoal = useUpdateGoal();

  const open = goal !== null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!goal) return;
    setError(null);

    const progressNum = parseInt(progress, 10);
    if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
      setError("Progress must be 0–100.");
      return;
    }

    try {
      await updateGoal.mutateAsync({
        id: goal.id,
        title: title.trim() || goal.title,
        description: description.trim() || null,
        progress: progressNum,
        status,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update goal.");
    }
  }

  const inputClass =
    "bg-surface-container-high border-[#1f1f23] text-on-background placeholder:text-on-surface-dim focus-visible:ring-primary focus-visible:border-primary";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-container border-[#1f1f23] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-headline-sm text-on-background">Edit Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-label-sm text-on-surface-variant">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-label-sm text-on-surface-variant">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={cn(
                "flex w-full rounded-md border px-3 py-2 text-sm resize-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
                inputClass
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-label-sm text-on-surface-variant">Progress (0–100)</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                className={cn(inputClass, "font-mono")}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-label-sm text-on-surface-variant">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Goal["status"])}
                className={cn(
                  "flex w-full rounded-md border px-3 py-2 text-sm h-10",
                  "focus-visible:outline-none focus:ring-2 focus:ring-primary",
                  "bg-surface-container-high border-[#1f1f23] text-on-background"
                )}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          {error && <p className="text-label-sm text-red-400">{error}</p>}
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-on-surface-variant"
              disabled={updateGoal.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateGoal.isPending}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {updateGoal.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IssuesGoalsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading: projectLoading } = useProject(id);

  const repoName = project?.githubRepo?.split("/")[1] ?? null;
  const { data: issues, isLoading: issuesLoading } = useIssues(repoName);
  const { data: goals, isLoading: goalsLoading } = useGoals(id);
  const deleteGoal = useDeleteGoal();

  const [createIssueOpen, setCreateIssueOpen] = useState(false);
  const [createGoalOpen, setCreateGoalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const openIssues = issues?.filter((i) => i.state === "open") ?? [];
  const completedGoals = goals?.filter((g) => g.status === "completed") ?? [];
  const avgProgress =
    goals && goals.length > 0
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
      : null;

  if (projectLoading) {
    return (
      <>
        <Header title="Issues & Goals" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-[220px]" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-[100px] rounded-xl" />
            <Skeleton className="h-[100px] rounded-xl" />
          </div>
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Header title="Issues & Goals" />
        <div className="flex items-center justify-center py-24">
          <p className="text-body-md text-on-surface-variant">Project not found.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={`${project.name} — Issues & Goals`} />

      <div className="flex gap-6 p-6">
        {/* ── Main content ──────────────────────────────────────── */}
        <div className="min-w-0 flex-1">
          <Tabs defaultValue="issues" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList className="bg-surface-container">
                <TabsTrigger value="issues" className="gap-2 text-body-md">
                  <CircleDot className="h-3.5 w-3.5" />
                  Issues
                </TabsTrigger>
                <TabsTrigger value="goals" className="gap-2 text-body-md">
                  <Target className="h-3.5 w-3.5" />
                  Goals
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Issues tab */}
            <TabsContent value="issues" className="space-y-0 mt-0">
              <div className="flex items-center justify-between mb-4">
                <p className="text-label-sm text-on-surface-variant">
                  {issues ? `${openIssues.length} open` : "Loading…"}
                </p>
                {repoName && (
                  <Button
                    size="sm"
                    onClick={() => setCreateIssueOpen(true)}
                    className="h-8 gap-1.5 bg-primary text-white hover:bg-primary/90 text-label-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create Issue
                  </Button>
                )}
              </div>

              {issuesLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : issues && issues.length > 0 ? (
                <div className="rounded-xl overflow-hidden">
                  {issues.map((issue, i) => (
                    <div
                      key={issue.number}
                      className={cn(
                        "flex items-start gap-4 px-4 py-3",
                        i % 2 === 0 ? "bg-surface-container" : "bg-surface-dim"
                      )}
                    >
                      {/* State dot */}
                      <span
                        className={cn(
                          "mt-1.5 h-2.5 w-2.5 rounded-full shrink-0",
                          issue.state === "open" ? "bg-success" : "bg-on-surface-dim"
                        )}
                        aria-label={issue.state}
                      />

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-body-md text-on-background truncate">
                            {issue.title}
                          </span>
                          {issue.labels.map((label) => (
                            <LabelPill key={label.name} label={label} />
                          ))}
                        </div>
                        <p className="mt-0.5 text-label-sm text-on-surface-variant">
                          #{issue.number}
                        </p>
                      </div>

                      {/* Date */}
                      <span className="text-label-sm font-mono text-on-surface-dim shrink-0 mt-0.5">
                        {relativeDate(issue.updatedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <AlertCircle className="mx-auto h-8 w-8 text-on-surface-dim mb-3" />
                  <p className="text-body-md text-on-surface-variant">
                    {repoName ? "No issues found" : "Connect a GitHub repo to see issues"}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Goals tab */}
            <TabsContent value="goals" className="mt-0">
              <div className="flex items-center justify-between mb-4">
                <p className="text-label-sm text-on-surface-variant">
                  {goals
                    ? `${goals.length} goal${goals.length !== 1 ? "s" : ""} · ${completedGoals.length} completed`
                    : "Loading…"}
                </p>
                <Button
                  size="sm"
                  onClick={() => setCreateGoalOpen(true)}
                  className="h-8 gap-1.5 bg-primary text-white hover:bg-primary/90 text-label-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Goal
                </Button>
              </div>

              {goalsLoading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-[160px] rounded-xl" />
                  ))}
                </div>
              ) : goals && goals.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {goals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={(g) => setEditingGoal(g)}
                      onDelete={(g) =>
                        deleteGoal.mutate({ id: g.id, projectId: g.projectId })
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <Target className="mx-auto h-8 w-8 text-on-surface-dim mb-3" />
                  <p className="text-body-md text-on-surface-variant">
                    No goals yet — create one to start tracking progress
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Quick stats sidebar ───────────────────────────────── */}
        <div className="w-[35%] shrink-0 space-y-4">
          {/* Open issues */}
          <div className="rounded-xl bg-surface-container p-5">
            <p className="text-label-sm uppercase text-on-surface-variant tracking-wide mb-2">
              Open Issues
            </p>
            <p className="text-display-sm text-warning font-semibold tabular-nums">
              {issuesLoading ? "—" : openIssues.length}
            </p>
            <p className="mt-1 text-label-sm text-on-surface-dim">
              {issues ? `${issues.length} total` : "Fetching…"}
            </p>
          </div>

          {/* Goal completion */}
          <div className="rounded-xl bg-surface-container p-5">
            <p className="text-label-sm uppercase text-on-surface-variant tracking-wide mb-2">
              Avg. Progress
            </p>
            <p className="text-display-sm text-success font-semibold tabular-nums">
              {goalsLoading ? "—" : avgProgress !== null ? `${avgProgress}%` : "—"}
            </p>
            <p className="mt-1 text-label-sm text-on-surface-dim">
              {goals
                ? `${completedGoals.length} of ${goals.length} complete`
                : "Fetching…"}
            </p>
          </div>

          {/* Repo info */}
          {repoName && (
            <div className="rounded-xl bg-surface-container p-5">
              <p className="text-label-sm uppercase text-on-surface-variant tracking-wide mb-2">
                Repository
              </p>
              <p className="text-body-md font-mono text-on-background truncate">
                {project.githubRepo}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      {repoName && (
        <CreateIssueDialog
          repo={repoName}
          open={createIssueOpen}
          onOpenChange={setCreateIssueOpen}
        />
      )}

      <CreateGoalDialog
        projectId={id}
        open={createGoalOpen}
        onOpenChange={setCreateGoalOpen}
      />

      <EditGoalDialog
        goal={editingGoal}
        onOpenChange={(open) => {
          if (!open) setEditingGoal(null);
        }}
      />
    </>
  );
}
