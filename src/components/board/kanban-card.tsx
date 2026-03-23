"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Task } from "@/types";

// ─── Priority Config ───────────────────────────────────────────────────────────

const priorityConfig: Record<
  Task["priority"],
  { label: string; dot: string; glow: string }
> = {
  urgent: {
    label: "Urgent",
    dot: "bg-red-500",
    glow: "shadow-[0_0_12px_2px_rgba(239,68,68,0.4)]",
  },
  high: {
    label: "High",
    dot: "bg-amber-500",
    glow: "shadow-[0_0_10px_2px_rgba(245,158,11,0.35)]",
  },
  normal: {
    label: "Normal",
    dot: "bg-indigo-500",
    glow: "shadow-[0_0_8px_1px_rgba(99,102,241,0.25)]",
  },
  low: {
    label: "Low",
    dot: "bg-zinc-500",
    glow: "",
  },
};

// ─── Props ─────────────────────────────────────────────────────────────────────

interface KanbanCardProps {
  task: Task;
  onOpenDetail: (task: Task) => void;
  isDragOverlay?: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function KanbanCard({ task, onOpenDetail, isDragOverlay = false }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const pCfg = priorityConfig[task.priority];

  return (
    <div
      ref={setNodeRef}
      style={isDragOverlay ? undefined : style}
      {...(isDragOverlay ? {} : attributes)}
      className={cn(
        "group relative flex items-start gap-2 rounded-xl bg-[#111113] p-3 border border-white/[0.06]",
        pCfg.glow,
        isDragging && "opacity-40",
        isDragOverlay && "rotate-1 opacity-95 cursor-grabbing",
        !isDragOverlay && "cursor-pointer"
      )}
      onClick={() => !isDragging && onOpenDetail(task)}
    >
      {/* Drag handle */}
      <button
        {...(isDragOverlay ? {} : listeners)}
        className={cn(
          "mt-0.5 shrink-0 rounded p-0.5 text-zinc-600 transition-colors",
          "hover:text-zinc-400 cursor-grab active:cursor-grabbing",
          isDragOverlay && "cursor-grabbing"
        )}
        onClick={(e) => e.stopPropagation()}
        aria-label="Drag task"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      {/* Card body */}
      <div className="min-w-0 flex-1 space-y-2">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] font-semibold leading-snug text-[#f8f8f8] line-clamp-2">
            {task.title}
          </p>
          {task.suggestedPrompt && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-indigo-400 mt-0.5" />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  AI suggestion available
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Description preview */}
        {task.description && (
          <p className="text-[11px] leading-relaxed text-[#a1a1aa] line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Footer: priority + agents */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {/* Priority badge */}
          <span className="inline-flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.04] px-1.5 py-0.5">
            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", pCfg.dot)} />
            <span className="text-[10px] font-medium text-[#a1a1aa]">{pCfg.label}</span>
          </span>

          {/* Agent pills */}
          {task.assignedAgents.slice(0, 3).map((agent) => (
            <Badge
              key={agent}
              variant="secondary"
              className="h-4 rounded-md px-1.5 text-[10px] font-normal text-[#a1a1aa] bg-white/[0.06] border-0"
            >
              {agent}
            </Badge>
          ))}
          {task.assignedAgents.length > 3 && (
            <span className="text-[10px] text-[#a1a1aa]">
              +{task.assignedAgents.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
