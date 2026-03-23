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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { projectKeys } from "@/hooks/use-projects";
import type { Project, ApiResult } from "@/types";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CreateProjectPayload {
  name: string;
  path: string;
  githubRepo: string | null;
  description: string | null;
}

async function createProject(payload: CreateProjectPayload): Promise<Project> {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json: ApiResult<Project> = await res.json();
  if (json.error) throw new Error(json.error);
  if (!json.data) throw new Error("No data returned");
  return json.data;
}

const inputClass =
  "bg-surface-container-high border-outline-variant text-on-background placeholder:text-on-surface-dim focus-visible:ring-primary focus-visible:border-primary";

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const queryClient = useQueryClient();
  const nameRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [description, setDescription] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success("Project created successfully");
      handleOpenChange(false);
    },
    onError: (err: Error) => {
      setFieldError(err.message);
    },
  });

  function reset() {
    setName("");
    setPath("");
    setGithubRepo("");
    setDescription("");
    setFieldError(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);

    if (!name.trim()) {
      setFieldError("Project name is required.");
      nameRef.current?.focus();
      return;
    }
    if (!path.trim()) {
      setFieldError("Local path is required.");
      return;
    }

    const repoValue = githubRepo.trim();
    if (repoValue && !/^[^/]+\/[^/]+$/.test(repoValue)) {
      setFieldError('GitHub repo must be in "owner/repo" format.');
      return;
    }

    mutate({
      name: name.trim(),
      path: path.trim(),
      githubRepo: repoValue || null,
      description: description.trim() || null,
    });
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
            New Project
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="proj-name" className="text-label-sm text-on-surface-variant">
              Project Name <span className="text-red-400">*</span>
            </label>
            <Input
              id="proj-name"
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Project"
              className={inputClass}
              disabled={isPending}
              autoFocus
            />
          </div>

          {/* Local path */}
          <div className="space-y-1.5">
            <label htmlFor="proj-path" className="text-label-sm text-on-surface-variant">
              Local Path <span className="text-red-400">*</span>
            </label>
            <Input
              id="proj-path"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/home/user/projects/my-project"
              className={cn(inputClass, "font-mono")}
              disabled={isPending}
            />
          </div>

          {/* GitHub repo */}
          <div className="space-y-1.5">
            <label htmlFor="proj-repo" className="text-label-sm text-on-surface-variant">
              GitHub Repo{" "}
              <span className="text-on-surface-dim">(optional)</span>
            </label>
            <Input
              id="proj-repo"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              placeholder="owner/repo"
              className={cn(inputClass, "font-mono")}
              disabled={isPending}
            />
            <p className="text-label-sm text-on-surface-dim">
              Format: owner/repo
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="proj-desc" className="text-label-sm text-on-surface-variant">
              Description{" "}
              <span className="text-on-surface-dim">(optional)</span>
            </label>
            <textarea
              id="proj-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description of this project"
              rows={3}
              disabled={isPending}
              className={cn(
                "flex w-full rounded-md border px-3 py-2 text-sm resize-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
                inputClass
              )}
            />
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
              {isPending ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
