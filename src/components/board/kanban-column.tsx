"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { KanbanCard } from "./kanban-card";
import type { Task } from "@/types";

// ─── Column Config ─────────────────────────────────────────────────────────────

export type ColumnStatus = Task["status"];

const columnConfig: Record<
  ColumnStatus,
  { label: string; accent: string; countBg: string }
> = {
  backlog: {
    label: "Backlog",
    accent: "border-t-white/10",
    countBg: "bg-zinc-700/50 text-zinc-300",
  },
  in_progress: {
    label: "In Progress",
    accent: "border-t-indigo-500/60",
    countBg: "bg-indigo-500/20 text-indigo-300",
  },
  in_review: {
    label: "In Review",
    accent: "border-t-amber-500/60",
    countBg: "bg-amber-500/20 text-amber-300",
  },
  done: {
    label: "Done",
    accent: "border-t-emerald-500/60",
    countBg: "bg-emerald-500/20 text-emerald-300",
  },
};

// ─── Props ─────────────────────────────────────────────────────────────────────

interface KanbanColumnProps {
  status: ColumnStatus;
  tasks: Task[];
  onOpenDetail: (task: Task) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function KanbanColumn({ status, tasks, onOpenDetail }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  const cfg = columnConfig[status];
  const taskIds = tasks.map((t) => t.id);

  return (
    <div className="flex min-w-[260px] flex-1 flex-col">
      {/* Column header */}
      <div
        className={cn(
          "rounded-t-xl border border-b-0 border-white/[0.06] bg-[#0a0a0b] px-3 py-2.5",
          "border-t-2",
          cfg.accent
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#a1a1aa]">
            {cfg.label}
          </span>
          <span
            className={cn(
              "inline-flex h-5 min-w-[20px] items-center justify-center rounded-md px-1.5 text-[10px] font-semibold",
              cfg.countBg
            )}
          >
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Droppable task list */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 rounded-b-xl border border-t-0 border-white/[0.06] bg-[#0a0a0b] p-2",
          "min-h-[120px] transition-colors",
          isOver && "bg-white/[0.02]"
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {tasks.map((task) => (
              <KanbanCard key={task.id} task={task} onOpenDetail={onOpenDetail} />
            ))}
          </div>
        </SortableContext>

        {tasks.length === 0 && (
          <div
            className={cn(
              "flex h-20 items-center justify-center rounded-lg border border-dashed border-white/[0.06]",
              "text-[11px] text-[#a1a1aa]/50 transition-colors",
              isOver && "border-white/20 text-[#a1a1aa]"
            )}
          >
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
