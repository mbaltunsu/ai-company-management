"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Agent } from "@/types";

interface AgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

export function AgentCard({ agent, onEdit, onDelete }: AgentCardProps) {
  return (
    <div
      className={cn(
        "group flex flex-col gap-3 rounded-xl bg-surface-container p-5",
        "ghost-border transition-colors duration-150 hover:bg-surface-container-high"
      )}
    >
      {/* Name + actions row */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-body-md font-semibold text-on-background leading-snug">
          {agent.name}
        </p>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-on-surface-variant hover:text-on-background hover:bg-surface-container"
            onClick={() => onEdit(agent)}
            aria-label={`Edit ${agent.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-on-surface-variant hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(agent)}
            aria-label={`Delete ${agent.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Description */}
      {agent.description ? (
        <p className="line-clamp-2 text-body-md text-on-surface-variant leading-relaxed">
          {agent.description}
        </p>
      ) : (
        <p className="text-body-md text-on-surface-dim italic">No description</p>
      )}

      {/* Filename */}
      <p className="font-mono text-label-sm uppercase tracking-wide text-on-surface-dim">
        {agent.filename}
      </p>
    </div>
  );
}
