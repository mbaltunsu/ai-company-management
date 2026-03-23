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
import { useCreateIssue } from "@/hooks/use-github";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CreateIssueDialogProps {
  repo: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const inputClass =
  "bg-surface-container-high border-outline-variant text-on-background placeholder:text-on-surface-dim focus-visible:ring-primary focus-visible:border-primary";

export function CreateIssueDialog({ repo, open, onOpenChange }: CreateIssueDialogProps) {
  const titleRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [labelsInput, setLabelsInput] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  const { mutate, isPending } = useCreateIssue();

  function reset() {
    setTitle("");
    setBody("");
    setLabelsInput("");
    setFieldError(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);

    if (!title.trim()) {
      setFieldError("Issue title is required.");
      titleRef.current?.focus();
      return;
    }

    const labels = labelsInput
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);

    mutate(
      {
        repo,
        title: title.trim(),
        body: body.trim() || undefined,
        labels: labels.length > 0 ? labels : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Issue created successfully");
          handleOpenChange(false);
        },
        onError: (err: Error) => {
          setFieldError(err.message);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "bg-surface-container ghost-border sm:max-w-md",
          "text-on-background"
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-headline-sm text-on-background">
            New Issue
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="issue-title" className="text-label-sm text-on-surface-variant">
              Title <span className="text-red-400">*</span>
            </label>
            <Input
              id="issue-title"
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short description of the issue"
              className={inputClass}
              disabled={isPending}
              autoFocus
            />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <label htmlFor="issue-body" className="text-label-sm text-on-surface-variant">
              Body{" "}
              <span className="text-on-surface-dim">(optional)</span>
            </label>
            <textarea
              id="issue-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe the issue in detail..."
              rows={5}
              disabled={isPending}
              className={cn(
                "flex w-full rounded-md border px-3 py-2 text-sm resize-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
                inputClass
              )}
            />
          </div>

          {/* Labels */}
          <div className="space-y-1.5">
            <label htmlFor="issue-labels" className="text-label-sm text-on-surface-variant">
              Labels{" "}
              <span className="text-on-surface-dim">(optional)</span>
            </label>
            <Input
              id="issue-labels"
              value={labelsInput}
              onChange={(e) => setLabelsInput(e.target.value)}
              placeholder="bug, enhancement, help wanted"
              className={inputClass}
              disabled={isPending}
            />
            <p className="text-label-sm text-on-surface-dim">
              Comma-separated list of label names
            </p>
          </div>

          {fieldError && (
            <p className="text-label-sm text-red-400">{fieldError}</p>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              className="text-on-surface-variant"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {isPending ? "Creating..." : "Create Issue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
