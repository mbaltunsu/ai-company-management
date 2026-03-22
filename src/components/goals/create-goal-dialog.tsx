"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateGoal } from "@/hooks/use-goals";
import { cn } from "@/lib/utils";

interface CreateGoalDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGoalDialog({
  projectId,
  open,
  onOpenChange,
}: CreateGoalDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const createGoal = useCreateGoal();

  function reset() {
    setTitle("");
    setDescription("");
    setDueDate("");
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
      setError("Goal title is required.");
      titleRef.current?.focus();
      return;
    }

    try {
      // Convert local date string to ISO datetime if provided
      let dueDateIso: string | null = null;
      if (dueDate) {
        dueDateIso = new Date(dueDate + "T00:00:00").toISOString();
      }

      await createGoal.mutateAsync({
        projectId,
        title: title.trim(),
        description: description.trim() || null,
        dueDate: dueDateIso,
      });

      handleOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create goal.");
    }
  }

  const inputClass =
    "bg-surface-container-high border-[#1f1f23] text-on-background placeholder:text-on-surface-dim focus-visible:ring-primary focus-visible:border-primary";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-surface-container border-[#1f1f23] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-headline-sm text-on-background">
            New Goal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <label
              htmlFor="goal-title"
              className="text-label-sm text-on-surface-variant"
            >
              Title <span className="text-red-400">*</span>
            </label>
            <Input
              id="goal-title"
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ship v2.0 release"
              className={inputClass}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="goal-description"
              className="text-label-sm text-on-surface-variant"
            >
              Description
            </label>
            <textarea
              id="goal-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does achieving this goal look like?"
              rows={3}
              className={cn(
                "flex w-full rounded-md border px-3 py-2 text-sm resize-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
                inputClass
              )}
            />
          </div>

          {/* Due date */}
          <div className="space-y-1.5">
            <label
              htmlFor="goal-due-date"
              className="text-label-sm text-on-surface-variant"
            >
              Due Date
            </label>
            <Input
              id="goal-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={cn(inputClass, "font-mono")}
            />
          </div>

          {error && (
            <p className="text-label-sm text-red-400">{error}</p>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              className="text-on-surface-variant"
              disabled={createGoal.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createGoal.isPending}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {createGoal.isPending ? "Creating..." : "Create Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
