"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Goal } from "@/types";

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goal: Goal) => void;
}

const STATUS_CONFIG = {
  active: {
    label: "Active",
    dotClass: "bg-success",
    textClass: "text-success",
  },
  completed: {
    label: "Completed",
    dotClass: "bg-primary",
    textClass: "text-primary",
  },
  archived: {
    label: "Archived",
    dotClass: "bg-on-surface-dim",
    textClass: "text-on-surface-dim",
  },
} as const;

function formatDueDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function relativeProgress(progress: number): string {
  if (progress === 100) return "Complete";
  if (progress === 0) return "Not started";
  return `${progress}%`;
}

export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const status = STATUS_CONFIG[goal.status];

  function handleDeleteClick() {
    if (confirmDelete) {
      onDelete?.(goal);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
    }
  }

  return (
    <div className="rounded-xl bg-surface-container p-5 flex flex-col gap-3 group">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-body-md font-semibold text-on-background leading-snug">
            {goal.title}
          </p>
          {goal.description && (
            <p
              className="mt-1 text-body-md text-on-surface-variant line-clamp-2 leading-relaxed"
              title={goal.description}
            >
              {goal.description}
            </p>
          )}
        </div>

        {/* Action buttons — visible on hover */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-on-surface-variant hover:text-on-background"
            onClick={() => onEdit?.(goal)}
            aria-label="Edit goal"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 transition-colors",
              confirmDelete
                ? "text-red-400 hover:text-red-300"
                : "text-on-surface-variant hover:text-red-400"
            )}
            onClick={handleDeleteClick}
            onBlur={() => setConfirmDelete(false)}
            aria-label={confirmDelete ? "Confirm delete" : "Delete goal"}
          >
            {confirmDelete ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <Progress
          value={goal.progress}
          className="h-1.5 bg-surface-container-high"
        />
        <div className="flex items-center justify-between">
          <span className="text-label-sm text-on-surface-variant">
            {relativeProgress(goal.progress)}
          </span>
          <span className="text-label-sm font-mono text-on-surface-dim">
            {goal.progress}%
          </span>
        </div>
      </div>

      {/* Footer row: status + due date */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-1.5">
          <span
            className={cn("h-2 w-2 rounded-full shrink-0", status.dotClass)}
            aria-hidden="true"
          />
          <span className={cn("text-label-sm font-medium", status.textClass)}>
            {status.label}
          </span>
        </div>

        {goal.dueDate && (
          <span className="text-label-sm font-mono text-on-surface-dim">
            Due {formatDueDate(goal.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}
