"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjects } from "@/hooks/use-projects";
import { useGitHubAgents } from "@/hooks/use-agents";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import type { Task, Agent, Project } from "@/types";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTask?: Task | null;
  defaultProjectId?: string | null;
  onSaved?: (task: Task) => void;
  /** Called with the newly created task and available agents BEFORE the dialog closes. */
  onTaskCreated?: (task: Task, agents: Agent[]) => void;
}

const PRIORITY_OPTIONS: { value: Task["priority"]; label: string }[] = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Low" },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export function CreateTaskDialog({
  open,
  onOpenChange,
  editTask,
  defaultProjectId,
  onSaved,
  onTaskCreated,
}: CreateTaskDialogProps) {
  const isEditing = Boolean(editTask);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("normal");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const { data: projects } = useProjects();
  const selectedProject = projects?.find((p) => p.id === selectedProjectId) ?? null;
  const { data: agents } = useGitHubAgents(selectedProject?.githubRepo ?? null);

  const createTask = useCreateTask();
  const updateTask = useUpdateTask(selectedProjectId);

  // Seed form when editing
  useEffect(() => {
    if (open && editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description ?? "");
      setPriority(editTask.priority);
      setSelectedProjectId(editTask.projectId ?? defaultProjectId ?? null);
    } else if (open && !editTask) {
      setTitle("");
      setDescription("");
      setPriority("normal");
      setSelectedProjectId(defaultProjectId ?? null);
    }
  }, [open, editTask, defaultProjectId]);

  const isBusy = createTask.isPending || updateTask.isPending;

  async function handleSave() {
    if (!title.trim()) return;

    try {
      let savedTask: Task;

      if (isEditing && editTask) {
        savedTask = await updateTask.mutateAsync({
          id: editTask.id,
          title: title.trim(),
          description: description.trim() || null,
          priority,
        });
      } else {
        savedTask = await createTask.mutateAsync({
          title: title.trim(),
          description: description.trim() || null,
          priority,
          projectId: selectedProjectId,
        });

        // Notify page-level handler BEFORE closing so the async work
        // is owned by the caller and survives unmount.
        if (onTaskCreated) {
          onTaskCreated(savedTask, agents ?? []);
        }
      }

      onSaved?.(savedTask);
      onOpenChange(false);
    } catch {
      // errors are surfaced by mutation state; silent here
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111113] border-white/[0.06] text-[#f8f8f8] sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-semibold">
            {isEditing ? "Edit Task" : "New Task"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-[#a1a1aa]">
              Title <span className="text-red-400">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title…"
              className="bg-[#0a0a0b] border-white/[0.06] text-[#f8f8f8] placeholder:text-[#a1a1aa]/50 text-[13px]"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-[#a1a1aa]">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description…"
              rows={3}
              className={cn(
                "w-full resize-none rounded-lg border border-white/[0.06] bg-[#0a0a0b]",
                "px-3 py-2 text-[13px] text-[#f8f8f8] placeholder:text-[#a1a1aa]/50",
                "focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              )}
            />
          </div>

          {/* Priority + Project row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-[#a1a1aa]">
                Priority
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-[#0a0a0b] border-white/[0.06] text-[#f8f8f8] text-[13px] h-9"
                  >
                    {PRIORITY_OPTIONS.find((p) => p.value === priority)?.label}
                    <span className="text-[#a1a1aa]">▾</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#111113] border-white/[0.06]">
                  {PRIORITY_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => setPriority(opt.value)}
                      className={cn(
                        "text-[13px] cursor-pointer",
                        priority === opt.value && "text-indigo-400"
                      )}
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Project */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-[#a1a1aa]">
                Project
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-[#0a0a0b] border-white/[0.06] text-[#f8f8f8] text-[13px] h-9 truncate"
                  >
                    <span className="truncate">
                      {selectedProject?.name ?? "None"}
                    </span>
                    <span className="text-[#a1a1aa] shrink-0">▾</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#111113] border-white/[0.06] w-[180px]">
                  <DropdownMenuItem
                    onClick={() => setSelectedProjectId(null)}
                    className="text-[13px] cursor-pointer"
                  >
                    None
                  </DropdownMenuItem>
                  {(projects ?? []).map((p: Project) => (
                    <DropdownMenuItem
                      key={p.id}
                      onClick={() => setSelectedProjectId(p.id)}
                      className={cn(
                        "text-[13px] cursor-pointer",
                        selectedProjectId === p.id && "text-indigo-400"
                      )}
                    >
                      {p.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* AI hint */}
          {!isEditing && selectedProject?.githubRepo && onTaskCreated && (
            <div className="flex items-center gap-2 rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-3 py-2">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
              <p className="text-[11px] text-indigo-300/80">
                Claude will auto-assign agents after saving.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isBusy}
            className="text-[#a1a1aa] hover:text-[#f8f8f8]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || isBusy}
            className="bg-indigo-600 hover:bg-indigo-500 text-white min-w-[80px]"
          >
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEditing ? (
              "Save"
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
