"use client";

import { useState } from "react";
import { Sparkles, Pencil, Trash2, AlertTriangle, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CreateTaskDialog } from "./create-task-dialog";
import type { Task, ClaudeSuggestion } from "@/types";

// ─── Priority / Status labels ──────────────────────────────────────────────────

const priorityLabel: Record<Task["priority"], string> = {
  urgent: "Urgent",
  high: "High",
  normal: "Normal",
  low: "Low",
};

const priorityDot: Record<Task["priority"], string> = {
  urgent: "bg-red-500",
  high: "bg-amber-500",
  normal: "bg-indigo-500",
  low: "bg-zinc-500",
};

const statusLabel: Record<Task["status"], string> = {
  backlog: "Backlog",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
};

const statusColor: Record<Task["status"], string> = {
  backlog: "text-zinc-400 border-zinc-700",
  in_progress: "text-indigo-300 border-indigo-700",
  in_review: "text-amber-300 border-amber-700",
  done: "text-emerald-300 border-emerald-700",
};

// ─── Props ─────────────────────────────────────────────────────────────────────

interface TaskDetailSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
  projectGithubRepo?: string | null;
  onAskClaude?: (task: Task) => Promise<ClaudeSuggestion>;
  onApplySuggestion?: (taskId: string, agents: string[], prompt: string) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
  onDelete,
  projectGithubRepo,
  onAskClaude,
  onApplySuggestion,
}: TaskDetailSheetProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState<ClaudeSuggestion | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
  const [editedPrompt, setEditedPrompt] = useState("");

  if (!task) return null;

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(task.createdAt));

  function handleDelete() {
    onDelete(task!.id);
    setDeleteConfirmOpen(false);
    onOpenChange(false);
  }

  async function handleAskClaudeClick() {
    if (!task || !onAskClaude) return;
    setSuggesting(true);
    setSuggestion(null);
    try {
      const result = await onAskClaude(task);
      setSuggestion(result);
      setSelectedAgents(new Set(result.suggestedAgents));
      setEditedPrompt(result.prompt);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to get suggestion");
    } finally {
      setSuggesting(false);
    }
  }

  function handleApplyClick() {
    if (!task || !onApplySuggestion) return;
    onApplySuggestion(task.id, Array.from(selectedAgents), editedPrompt);
    setSuggestion(null);
  }

  function toggleAgent(name: string) {
    setSelectedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(value) => {
          if (!value) setSuggestion(null);
          onOpenChange(value);
        }}
      >
        <SheetContent
          side="right"
          className="w-[400px] bg-[#111113] border-l border-white/[0.06] text-[#f8f8f8] flex flex-col p-0"
        >
          {/* Header */}
          <SheetHeader className="px-5 pt-5 pb-4 border-b border-white/[0.06]">
            <div className="flex items-start justify-between gap-3">
              <SheetTitle className="text-[15px] font-semibold text-[#f8f8f8] leading-snug text-left">
                {task.title}
              </SheetTitle>
            </div>
            {/* Status + Priority */}
            <div className="flex items-center gap-2 pt-1">
              <Badge
                variant="outline"
                className={cn("text-[10px] font-medium", statusColor[task.status])}
              >
                {statusLabel[task.status]}
              </Badge>
              <span className="inline-flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.04] px-1.5 py-0.5">
                <span className={cn("h-1.5 w-1.5 rounded-full", priorityDot[task.priority])} />
                <span className="text-[10px] font-medium text-[#a1a1aa]">
                  {priorityLabel[task.priority]}
                </span>
              </span>
              <span className="ml-auto text-[10px] text-[#a1a1aa]">{formattedDate}</span>
            </div>
          </SheetHeader>

          {/* Body — scrollable */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* Description */}
            {task.description && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#a1a1aa]">
                  Description
                </p>
                <p className="text-[13px] leading-relaxed text-[#f8f8f8]/80">
                  {task.description}
                </p>
              </div>
            )}

            <Separator className="bg-white/[0.06]" />

            {/* Assigned agents */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#a1a1aa]">
                Assigned Agents
              </p>
              {task.assignedAgents.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {task.assignedAgents.map((agent) => (
                    <Badge
                      key={agent}
                      variant="secondary"
                      className="text-[11px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-md"
                    >
                      {agent}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-[#a1a1aa]/60">No agents assigned</p>
              )}
            </div>

            {/* Ask Claude — below agents */}
            {onAskClaude && projectGithubRepo && (
              <div className="space-y-3">
                {!suggestion && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAskClaudeClick}
                    disabled={suggesting}
                    className="gap-2 text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/10 text-[12px]"
                  >
                    {suggesting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    {suggesting ? "Suggesting..." : "Ask Claude for Agent Suggestions"}
                  </Button>
                )}

                {/* Confirmation card */}
                {suggestion && (
                  <div className="rounded-xl bg-[#1a1a1d] border border-indigo-500/20 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-400" />
                      <span className="text-[13px] font-semibold text-[#f8f8f8]">
                        Claude suggests these agents
                      </span>
                    </div>

                    {/* Agent checkboxes */}
                    <div className="space-y-2">
                      {suggestion.suggestedAgents.map((name) => (
                        <button
                          key={name}
                          onClick={() => toggleAgent(name)}
                          className={cn(
                            "flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-[12px] transition-colors text-left",
                            selectedAgents.has(name)
                              ? "bg-indigo-500/10 text-indigo-300"
                              : "bg-white/[0.04] text-[#a1a1aa] hover:bg-white/[0.07]"
                          )}
                        >
                          <div
                            className={cn(
                              "h-4 w-4 rounded border flex items-center justify-center shrink-0",
                              selectedAgents.has(name)
                                ? "bg-indigo-500 border-indigo-500"
                                : "border-[#3f3f46]"
                            )}
                          >
                            {selectedAgents.has(name) && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          {name}
                        </button>
                      ))}
                    </div>

                    {/* Editable prompt */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#a1a1aa]">
                        Suggested Prompt
                      </span>
                      <textarea
                        value={editedPrompt}
                        onChange={(e) => setEditedPrompt(e.target.value)}
                        rows={4}
                        className="w-full rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3 text-[11px] font-mono text-[#f8f8f8]/70 resize-y focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={handleApplyClick}
                        disabled={selectedAgents.size === 0}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] gap-1.5 disabled:opacity-40"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Apply Selected ({selectedAgents.size})
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSuggestion(null)}
                        className="text-[#a1a1aa] hover:text-[#f8f8f8] text-[12px]"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Claude prompt */}
            {task.suggestedPrompt && (
              <>
                <Separator className="bg-white/[0.06]" />
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300">
                      AI Suggestion
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#201f20] border border-white/[0.06] p-3">
                    <p className="font-mono text-[12px] leading-relaxed text-[#f8f8f8]/80 whitespace-pre-wrap">
                      {task.suggestedPrompt}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex items-center gap-2 border-t border-white/[0.06] px-5 py-4">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-white/[0.06] bg-transparent text-[#a1a1aa] hover:text-[#f8f8f8] text-[12px]"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10 hover:text-red-300 text-[12px] ml-auto"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit dialog */}
      <CreateTaskDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editTask={task}
        onSaved={() => {
          setEditOpen(false);
        }}
      />

      {/* Delete confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-[#111113] border-white/[0.06] text-[#f8f8f8] sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[15px]">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              Delete task?
            </DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-[#a1a1aa]">
            This will permanently delete &ldquo;{task.title}&rdquo;. This action cannot be undone.
          </p>
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirmOpen(false)}
              className="text-[#a1a1aa] hover:text-[#f8f8f8]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
