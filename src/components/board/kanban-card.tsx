"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
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

// ─── Relative date helper ──────────────────────────────────────────────────────

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface KanbanCardProps {
  task: Task;
  onOpenDetail: (task: Task) => void;
  isDragOverlay?: boolean;
  projectName?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function KanbanCard({
  task,
  onOpenDetail,
  isDragOverlay = false,
  projectName,
  isExpanded = false,
  onToggleExpand,
}: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const pCfg = priorityConfig[task.priority];
  const visibleAgents = isExpanded ? task.assignedAgents : task.assignedAgents.slice(0, 3);
  const hiddenCount = !isExpanded ? task.assignedAgents.length - 3 : 0;

  return (
    <div
      ref={setNodeRef}
      style={isDragOverlay ? undefined : style}
      {...(isDragOverlay ? {} : attributes)}
      className={cn(
        "group relative flex flex-col rounded-xl bg-[#111113] border border-white/[0.06]",
        pCfg.glow,
        isDragging && "opacity-40",
        isDragOverlay && "rotate-1 opacity-95 cursor-grabbing",
        !isDragOverlay && "cursor-pointer"
      )}
      onClick={() => !isDragging && onOpenDetail(task)}
    >
      {/* Main card content */}
      <div className="flex items-start gap-2 p-3">
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
            <p
              className={cn(
                "text-[13px] font-semibold leading-snug text-[#f8f8f8]",
                !isExpanded && "line-clamp-1"
              )}
            >
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

          {/* Description */}
          {task.description && (
            <p
              className={cn(
                "text-[11px] leading-relaxed text-[#a1a1aa]",
                !isExpanded && "line-clamp-2"
              )}
            >
              {task.description}
            </p>
          )}

          {/* Expanded: AI Prompt block */}
          {isExpanded && task.suggestedPrompt && (
            <div className="space-y-1">
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#a1a1aa]/60">
                AI Prompt
              </span>
              <div className="rounded-lg bg-[#201f20] p-3">
                <p className="font-mono text-[11px] leading-relaxed text-[#a1a1aa] whitespace-pre-wrap">
                  {task.suggestedPrompt}
                </p>
              </div>
            </div>
          )}

          {/* Footer row */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            {/* Left: priority + agents + project tag */}
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              {/* Priority badge */}
              <span className="inline-flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.04] px-1.5 py-0.5 shrink-0">
                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", pCfg.dot)} />
                <span className="text-[10px] font-medium text-[#a1a1aa]">{pCfg.label}</span>
              </span>

              {/* Agent pills */}
              {visibleAgents.map((agent) => (
                <Badge
                  key={agent}
                  variant="secondary"
                  className="h-4 rounded-md px-1.5 text-[10px] font-normal text-[#a1a1aa] bg-white/[0.06] border-0"
                >
                  {agent}
                </Badge>
              ))}
              {hiddenCount > 0 && (
                <span className="text-[10px] text-[#a1a1aa]">
                  +{hiddenCount}
                </span>
              )}

              {/* Project name tag */}
              {projectName && (
                <span className="text-[10px] text-[#71717a] bg-white/[0.03] border border-white/[0.04] rounded px-1.5 py-0.5 truncate max-w-[100px]">
                  {projectName}
                </span>
              )}
            </div>

            {/* Right: relative created date */}
            <span className="text-[10px] text-[#71717a] shrink-0 whitespace-nowrap">
              {relativeDate(task.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Expand / collapse toggle */}
      {onToggleExpand && !isDragOverlay && (
        <button
          className={cn(
            "flex w-full items-center justify-center py-1 text-zinc-600",
            "border-t border-white/[0.04] transition-colors",
            "hover:text-zinc-400 hover:bg-white/[0.02] rounded-b-xl"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          aria-label={isExpanded ? "Collapse card" : "Expand card"}
        >
          {isExpanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>
      )}
    </div>
  );
}
