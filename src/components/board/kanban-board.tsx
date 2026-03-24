"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import type { Task, Project } from "@/types";
import type { ColumnStatus } from "./kanban-column";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface KanbanBoardProps {
  tasks: Task[];
  onUpdateTask: (payload: { id: string; status?: Task["status"]; order?: number }) => void;
  onOpenDetail: (task: Task) => void;
  projects?: Project[];
}

const COLUMNS: ColumnStatus[] = ["backlog", "in_progress", "in_review", "done"];

// ─── Component ─────────────────────────────────────────────────────────────────

export function KanbanBoard({ tasks, onUpdateTask, onOpenDetail, projects }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // Track the last serialized tasks we synced from props to avoid loops
  const lastSyncedRef = useRef<string>(JSON.stringify(tasks));

  // Sync incoming tasks prop only when not dragging and data actually changed
  useEffect(() => {
    if (activeTask) return;
    const serialized = JSON.stringify(tasks);
    if (serialized !== lastSyncedRef.current) {
      lastSyncedRef.current = serialized;
      setLocalTasks(tasks);
    }
  }, [tasks, activeTask]);

  const projectNameMap = useMemo<Record<string, string>>(() => {
    if (!projects) return {};
    return projects.reduce<Record<string, string>>((acc, p) => {
      acc[p.id] = p.name;
      return acc;
    }, {});
  }, [projects]);

  function toggleExpand(id: string) {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const tasksInColumn = (status: ColumnStatus) =>
    localTasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.order - b.order);

  function handleDragStart(event: DragStartEvent) {
    const task = localTasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the task being dragged
    const activeTask = localTasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Determine target column: over could be a column droppable id or a task id
    const targetStatus = (COLUMNS.includes(overId as ColumnStatus)
      ? overId
      : localTasks.find((t) => t.id === overId)?.status) as ColumnStatus | undefined;

    if (!targetStatus || activeTask.status === targetStatus) return;

    // Optimistically move task to new column
    setLocalTasks((prev) =>
      prev.map((t) =>
        t.id === activeId ? { ...t, status: targetStatus } : t
      )
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskData = localTasks.find((t) => t.id === activeId);
    if (!activeTaskData) return;

    // Determine target column
    const targetStatus = (COLUMNS.includes(overId as ColumnStatus)
      ? overId
      : localTasks.find((t) => t.id === overId)?.status) as ColumnStatus | undefined;

    if (!targetStatus) return;

    const columnTasks = localTasks
      .filter((t) => t.status === targetStatus)
      .sort((a, b) => a.order - b.order);

    let newOrder = activeTaskData.order;

    if (activeId !== overId && !COLUMNS.includes(overId as ColumnStatus)) {
      const activeIndex = columnTasks.findIndex((t) => t.id === activeId);
      const overIndex = columnTasks.findIndex((t) => t.id === overId);

      if (activeIndex !== -1 && overIndex !== -1) {
        const reordered = arrayMove(columnTasks, activeIndex, overIndex);
        newOrder = overIndex;

        // Update orders for all affected tasks
        setLocalTasks((prev) => {
          const reorderedIds = reordered.map((t) => t.id);
          return prev.map((t) => {
            const idx = reorderedIds.indexOf(t.id);
            if (idx !== -1) return { ...t, order: idx };
            return t;
          });
        });

        onUpdateTask({ id: activeId, status: targetStatus, order: newOrder });
        return;
      }
    }

    // Status change only (dropped onto column droppable)
    if (activeTaskData.status !== targetStatus) {
      onUpdateTask({ id: activeId, status: targetStatus, order: newOrder });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksInColumn(status)}
            onOpenDetail={onOpenDetail}
            projectNameMap={projectNameMap}
            expandedTasks={expandedTasks}
            onToggleExpand={toggleExpand}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <KanbanCard task={activeTask} onOpenDetail={() => {}} isDragOverlay />
        )}
      </DragOverlay>
    </DndContext>
  );
}
