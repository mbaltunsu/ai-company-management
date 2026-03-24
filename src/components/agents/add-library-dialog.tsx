"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateLibrary } from "@/hooks/use-libraries";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AddLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLibraryDialog({ open, onOpenChange }: AddLibraryDialogProps) {
  const [name, setName] = useState("");
  const [repo, setRepo] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ name?: string; repo?: string }>({});

  const { mutate: createLibrary, isPending } = useCreateLibrary();

  function handleOpenChange(next: boolean) {
    if (!next) {
      setName("");
      setRepo("");
      setDescription("");
      setErrors({});
    }
    onOpenChange(next);
  }

  function validate(): boolean {
    const next: { name?: string; repo?: string } = {};
    if (!name.trim()) next.name = "Name is required.";
    if (!repo.trim()) next.repo = "Repository is required.";
    else if (!/^[^/\s]+\/[^/\s]+$/.test(repo.trim()))
      next.repo = 'Use the format "owner/repo".';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    createLibrary(
      {
        name: name.trim(),
        repo: repo.trim(),
        description: description.trim() || null,
      },
      {
        onSuccess: () => {
          toast({ title: "Library added", description: `"${name.trim()}" was added successfully.` });
          handleOpenChange(false);
        },
        onError: (err) => {
          toast({ title: "Failed to add library", description: err.message, variant: "destructive" });
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "flex flex-col gap-0 overflow-hidden p-0 ghost-border",
          "bg-surface-container text-on-background sm:max-w-md"
        )}
      >
        <DialogHeader className="shrink-0 px-6 py-4 ghost-border border-b">
          <DialogTitle className="text-headline-sm font-semibold text-on-background">
            Add Agent Library
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 px-6 py-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="lib-name"
              className="text-label-sm uppercase tracking-wide text-on-surface-variant"
            >
              Library Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="lib-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
              }}
              placeholder="e.g. My Agent Library"
              className={cn(
                "bg-surface-container-high text-on-background placeholder:text-on-surface-dim",
                "border-outline-variant focus-visible:ring-primary",
                errors.name && "border-destructive focus-visible:ring-destructive"
              )}
              disabled={isPending}
              autoFocus
            />
            {errors.name && (
              <p className="text-label-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Repo */}
          <div className="space-y-1.5">
            <label
              htmlFor="lib-repo"
              className="text-label-sm uppercase tracking-wide text-on-surface-variant"
            >
              GitHub Repository <span className="text-destructive">*</span>
            </label>
            <Input
              id="lib-repo"
              value={repo}
              onChange={(e) => {
                setRepo(e.target.value);
                if (errors.repo) setErrors((p) => ({ ...p, repo: undefined }));
              }}
              placeholder="owner/repo"
              className={cn(
                "bg-surface-container-high text-on-background placeholder:text-on-surface-dim font-mono",
                "border-outline-variant focus-visible:ring-primary",
                errors.repo && "border-destructive focus-visible:ring-destructive"
              )}
              disabled={isPending}
            />
            {errors.repo && (
              <p className="text-label-sm text-destructive">{errors.repo}</p>
            )}
            <p className="text-label-sm text-on-surface-dim">
              Must contain a <code className="font-mono">.claude/agents/</code> folder.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="lib-desc"
              className="text-label-sm uppercase tracking-wide text-on-surface-variant"
            >
              Description <span className="text-on-surface-dim">(optional)</span>
            </label>
            <textarea
              id="lib-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What agents does this library provide?"
              className={cn(
                "w-full resize-none rounded-lg bg-surface-container-high px-4 py-3",
                "text-body-md text-on-background placeholder:text-on-surface-dim",
                "border border-outline-variant outline-none focus:ring-2 focus:ring-primary",
                "leading-relaxed"
              )}
              disabled={isPending}
            />
          </div>
        </div>

        <DialogFooter className="shrink-0 flex flex-row justify-end gap-2 px-6 py-4 ghost-border border-t">
          <Button
            variant="ghost"
            className="text-on-surface-variant hover:text-on-background"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? "Adding…" : "Add Library"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
