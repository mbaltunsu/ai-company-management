"use client";

import { useState, useCallback } from "react";
import { Columns3, Plus, ChevronDown } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { KanbanBoard } from "@/components/board/kanban-board";
import { CreateTaskDialog } from "@/components/board/create-task-dialog";
import { TaskDetailSheet } from "@/components/board/task-detail-sheet";
import { useProjects } from "@/hooks/use-projects";
import { useTasks, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { useClaudeSuggest } from "@/hooks/use-claude";
import { useGitHubAgents } from "@/hooks/use-agents";
import type { Task, Agent, Project } from "@/types";

// ─── Skeleton columns ──────────────────────────────────────────────────────────

function BoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: 4 }).map((_, col) => (
        <div key={col} className="min-w-[260px] flex-1 space-y-0">
          <Skeleton className="h-10 rounded-t-xl rounded-b-none bg-[#111113]" />
          <div className="rounded-b-xl border border-t-0 border-white/[0.06] bg-[#0a0a0b] p-2 space-y-2">
            {Array.from({ length: col === 0 ? 3 : col === 1 ? 2 : 1 }).map((_, i) => (
              <Skeleton key={i} className="h-[88px] rounded-xl bg-[#111113]" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function BoardPage() {
  const { data: projects, isLoading: loadingProjects } = useProjects();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: tasks, isLoading: loadingTasks } = useTasks(selectedProjectId);
  const updateTask = useUpdateTask(selectedProjectId);
  const deleteTask = useDeleteTask(selectedProjectId);
  const claudeSuggest = useClaudeSuggest();

  const selectedProject = projects?.find((p: Project) => p.id === selectedProjectId) ?? null;

  // Agents for the task currently shown in the detail sheet (keyed by its project's github repo)
  const detailTaskProject =
    detailTask ? (projects?.find((p) => p.id === detailTask.projectId) ?? null) : null;
  const { data: detailTaskAgents } = useGitHubAgents(detailTaskProject?.githubRepo ?? null);

  function handleDragUpdate(payload: { id: string; status?: Task["status"]; order?: number }) {
    updateTask.mutate(payload);
  }

  function handleDeleteTask(id: string) {
    deleteTask.mutate(id);
  }

  function handleOpenDetail(task: Task) {
    setDetailTask(task);
    setDetailOpen(true);
  }

  /**
   * Runs Claude agent suggestion for a task, then persists the result.
   * Called from both CreateTaskDialog (new task) and TaskDetailSheet (Ask Claude button).
   */
  const runClaudeSuggestion = useCallback(
    async (task: Task, availableAgents: Agent[]) => {
      if (availableAgents.length === 0) return;
      try {
        const suggestion = await claudeSuggest.mutateAsync({
          taskTitle: task.title,
          taskDescription: task.description ?? undefined,
          availableAgents: availableAgents.map((a) => ({
            name: a.name,
            description: a.description,
          })),
        });
        updateTask.mutate({
          id: task.id,
          assignedAgents: suggestion.suggestedAgents,
          suggestedPrompt: suggestion.prompt,
        });
      } catch {
        // No API key or rate-limited — fail silently
      }
    },
    [claudeSuggest, updateTask]
  );

  /** Handler passed to CreateTaskDialog — fires BEFORE dialog closes. */
  const handleTaskCreated = useCallback(
    (task: Task, agents: Agent[]) => {
      void runClaudeSuggestion(task, agents);
    },
    [runClaudeSuggestion]
  );

  /** Handler passed to TaskDetailSheet's "Ask Claude" button. */
  const handleAskClaude = useCallback(
    (task: Task) => {
      void runClaudeSuggestion(task, detailTaskAgents ?? []);
    },
    [runClaudeSuggestion, detailTaskAgents]
  );

  const isLoading = loadingTasks;
  const hasTasks = (tasks?.length ?? 0) > 0;

  return (
    <>
      <Header title="Board" />

      <div className="flex flex-col h-[calc(100vh-56px)]">
        {/* Toolbar */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-6 py-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-white/[0.06] bg-transparent text-[#a1a1aa] hover:text-[#f8f8f8] text-[13px]"
              >
                <Columns3 className="h-4 w-4" />
                {selectedProject ? selectedProject.name : "All Projects"}
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="bg-[#111113] border-white/[0.06] w-[220px]"
            >
              <DropdownMenuItem
                onClick={() => setSelectedProjectId(null)}
                className={`text-[13px] cursor-pointer ${
                  selectedProjectId === null ? "text-indigo-400" : ""
                }`}
              >
                All Projects
              </DropdownMenuItem>
              {loadingProjects ? (
                <div className="p-2">
                  <Skeleton className="h-5 w-full bg-[#201f20]" />
                </div>
              ) : (
                (projects ?? []).map((p: Project) => (
                  <DropdownMenuItem
                    key={p.id}
                    onClick={() => setSelectedProjectId(p.id)}
                    className={`text-[13px] cursor-pointer ${
                      selectedProjectId === p.id ? "text-indigo-400" : ""
                    }`}
                  >
                    {p.name}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedProjectId && (
            <span className="text-[11px] uppercase tracking-wider text-[#a1a1aa]/60">
              {tasks?.length ?? 0} tasks
            </span>
          )}

          <Button
            size="sm"
            className="ml-auto gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[13px]"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>

        {/* Board area */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 py-4">
          {isLoading ? (
            <BoardSkeleton />
          ) : !hasTasks ? (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <Columns3 className="h-12 w-12 text-[#a1a1aa]/30" />
              <div className="text-center">
                <p className="text-[15px] font-semibold text-[#f8f8f8]">No tasks yet</p>
                <p className="mt-1 text-[13px] text-[#a1a1aa]">
                  Create your first task to get started
                </p>
              </div>
              <Button
                size="sm"
                className="gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[13px]"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Create your first task
              </Button>
            </div>
          ) : (
            <KanbanBoard
              tasks={tasks ?? []}
              onUpdateTask={handleDragUpdate}
              onOpenDetail={handleOpenDetail}
              projects={projects ?? []}
            />
          )}
        </div>
      </div>

      {/* Create dialog */}
      <CreateTaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultProjectId={selectedProjectId}
        onTaskCreated={handleTaskCreated}
      />

      {/* Detail sheet */}
      <TaskDetailSheet
        task={detailTask}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onDelete={handleDeleteTask}
        projectGithubRepo={detailTaskProject?.githubRepo}
        onAskClaude={handleAskClaude}
      />
    </>
  );
}
