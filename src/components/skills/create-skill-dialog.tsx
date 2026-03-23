"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateSkill, useUpdateSkill } from "@/hooks/use-skills";
import { useProjects } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";
import type { Skill } from "@/types";

interface CreateSkillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSkill?: Skill | null;
  defaultProjectId?: string | null;
}

export function CreateSkillDialog({
  open,
  onOpenChange,
  editingSkill,
  defaultProjectId,
}: CreateSkillDialogProps) {
  const { data: projects } = useProjects();
  const createSkill = useCreateSkill();
  const updateSkill = useUpdateSkill();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [whenToUse, setWhenToUse] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(editingSkill);
  const isPending = createSkill.isPending || updateSkill.isPending;

  // Prefill when editing
  useEffect(() => {
    if (editingSkill) {
      setName(editingSkill.name);
      setDescription(editingSkill.description ?? "");
      setWhenToUse(editingSkill.whenToUse ?? "");
      setProjectId(editingSkill.projectId ?? "");
    } else {
      setName("");
      setDescription("");
      setWhenToUse("");
      setProjectId(defaultProjectId ?? "");
    }
    setError(null);
  }, [editingSkill, defaultProjectId, open]);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setName("");
      setDescription("");
      setWhenToUse("");
      setProjectId(defaultProjectId ?? "");
      setError(null);
    }
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Skill name is required.");
      nameRef.current?.focus();
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        whenToUse: whenToUse.trim() || null,
        projectId: projectId || null,
      };

      if (isEditing && editingSkill) {
        await updateSkill.mutateAsync({ id: editingSkill.id, ...payload });
      } else {
        await createSkill.mutateAsync(payload);
      }

      handleOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save skill.");
    }
  }

  const inputClass =
    "bg-surface-container-high border-[#1f1f23] text-on-background placeholder:text-on-surface-dim focus-visible:ring-primary focus-visible:border-primary";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-surface-container border-[#1f1f23] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-headline-sm text-on-background">
            {isEditing ? "Edit Skill" : "New Skill"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="skill-name"
              className="text-label-sm text-on-surface-variant"
            >
              Name <span className="text-red-400">*</span>
            </label>
            <Input
              id="skill-name"
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. TypeScript strict mode"
              className={inputClass}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="skill-description"
              className="text-label-sm text-on-surface-variant"
            >
              Description
            </label>
            <textarea
              id="skill-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this skill covers..."
              rows={3}
              className={cn(
                "flex w-full rounded-md border px-3 py-2 text-sm resize-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
                inputClass
              )}
            />
          </div>

          {/* When to use */}
          <div className="space-y-1.5">
            <label
              htmlFor="skill-when-to-use"
              className="text-label-sm text-on-surface-variant"
            >
              When to use
            </label>
            <Input
              id="skill-when-to-use"
              value={whenToUse}
              onChange={(e) => setWhenToUse(e.target.value)}
              placeholder="e.g. When writing TypeScript files"
              className={inputClass}
            />
          </div>

          {/* Project dropdown */}
          <div className="space-y-1.5">
            <label
              htmlFor="skill-project"
              className="text-label-sm text-on-surface-variant"
            >
              Project{" "}
              <span className="text-on-surface-dim">(leave blank for global)</span>
            </label>
            <select
              id="skill-project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className={cn(
                "flex h-10 w-full rounded-md border px-3 py-2 text-sm appearance-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
                inputClass
              )}
            >
              <option value="">Global (no project)</option>
              {(projects ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-label-sm text-red-400">{error}</p>}

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
              {isPending
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                ? "Save Changes"
                : "Create Skill"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
