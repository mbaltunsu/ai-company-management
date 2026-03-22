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
import { useCreateAgent } from "@/hooks/use-agents";
import { cn } from "@/lib/utils";
import type { Agent } from "@/types";

const TEMPLATE = `# Agent Name

## Role
Describe the agent's role and responsibilities.

## Capabilities
- Capability 1
- Capability 2

## When to Use
Describe when this agent should be invoked.
`;

interface CreateAgentDialogProps {
  open: boolean;
  projectPath: string;
  onOpenChange: (open: boolean) => void;
  onCreated: (agent: Agent) => void;
}

export function CreateAgentDialog({
  open,
  projectPath,
  onOpenChange,
  onCreated,
}: CreateAgentDialogProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState(TEMPLATE);
  const [nameError, setNameError] = useState<string | null>(null);

  const { mutate: createAgent, isPending } = useCreateAgent();

  function handleOpenChange(next: boolean) {
    if (!next) {
      // Reset on close
      setName("");
      setContent(TEMPLATE);
      setNameError(null);
    }
    onOpenChange(next);
  }

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Agent name is required.");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(trimmed)) {
      setNameError("Use only lowercase letters, numbers, and hyphens.");
      return;
    }
    setNameError(null);

    createAgent(
      { projectPath, name: trimmed, content },
      {
        onSuccess: (agent) => {
          onCreated(agent);
          handleOpenChange(false);
        },
        onError: (err) => {
          setNameError(err.message);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "flex flex-col gap-0 overflow-hidden p-0 ghost-border",
          "bg-surface-container text-on-background sm:max-w-2xl",
          "max-h-[90vh]"
        )}
      >
        <DialogHeader className="shrink-0 px-6 py-4 ghost-border border-b">
          <DialogTitle className="text-headline-sm font-semibold text-on-background">
            New Agent
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="flex flex-col gap-5 overflow-y-auto px-6 py-5">
          {/* Name field */}
          <div className="space-y-1.5">
            <label
              htmlFor="agent-name"
              className="text-label-sm uppercase tracking-wide text-on-surface-variant"
            >
              Agent Name
            </label>
            <Input
              id="agent-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(null);
              }}
              placeholder="e.g. code-reviewer"
              className={cn(
                "bg-surface-container-high text-on-background placeholder:text-on-surface-dim",
                "border-outline-variant focus-visible:ring-primary font-mono",
                nameError && "border-destructive focus-visible:ring-destructive"
              )}
              disabled={isPending}
              autoFocus
            />
            {nameError && (
              <p className="text-label-sm text-destructive">{nameError}</p>
            )}
            <p className="text-label-sm text-on-surface-dim">
              Lowercase letters, numbers, and hyphens only.
            </p>
          </div>

          {/* Content field */}
          <div className="space-y-1.5">
            <label
              htmlFor="agent-content"
              className="text-label-sm uppercase tracking-wide text-on-surface-variant"
            >
              Initial Content
            </label>
            <textarea
              id="agent-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={14}
              className={cn(
                "w-full resize-none rounded-lg bg-surface-container-high px-4 py-3",
                "font-mono text-body-md text-on-background placeholder:text-on-surface-dim",
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
            onClick={handleCreate}
            disabled={isPending}
          >
            {isPending ? "Creating…" : "Create Agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
