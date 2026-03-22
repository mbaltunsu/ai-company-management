"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Bot, Plus, ChevronLeft, AlertTriangle } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AgentCard } from "@/components/agents/agent-card";
import { AgentEditor } from "@/components/agents/agent-editor";
import { CreateAgentDialog } from "@/components/agents/create-agent-dialog";
import { useProject } from "@/hooks/use-projects";
import { useAgents, useUpdateAgent, useDeleteAgent } from "@/hooks/use-agents";
import { cn } from "@/lib/utils";
import type { Agent } from "@/types";

// ---------------------------------------------------------------------------
// Skeleton placeholders
// ---------------------------------------------------------------------------

function AgentGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-[130px] rounded-xl" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProjectAgentsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: project, isLoading: projectLoading } = useProject(id);
  const { data: agents, isLoading: agentsLoading } = useAgents(project?.path ?? null);

  const { mutate: updateAgent, isPending: isSaving } = useUpdateAgent();
  const { mutate: deleteAgent, isPending: isDeleting } = useDeleteAgent();

  // Sheet state for editing
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  // Delete confirmation dialog
  const [pendingDelete, setPendingDelete] = useState<Agent | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);

  const handleEdit = useCallback((agent: Agent) => {
    setEditingAgent(agent);
  }, []);

  const handleSave = useCallback(
    (content: string) => {
      if (!editingAgent || !project) return;
      updateAgent(
        { projectPath: project.path, name: editingAgent.name, content },
        {
          onSuccess: () => {
            setEditingAgent(null);
          },
        }
      );
    },
    [editingAgent, project, updateAgent]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!pendingDelete || !project) return;
    setDeleteError(null);
    deleteAgent(
      { projectPath: project.path, name: pendingDelete.name },
      {
        onSuccess: () => {
          setPendingDelete(null);
        },
        onError: (err) => {
          setDeleteError(err.message);
        },
      }
    );
  }, [pendingDelete, project, deleteAgent]);

  const isLoading = projectLoading || agentsLoading;

  // Project not found
  if (!projectLoading && !project) {
    return (
      <>
        <Header title="Agents" />
        <div className="flex flex-col items-center justify-center py-24">
          <Bot className="h-10 w-10 text-on-surface-dim mb-3" />
          <p className="text-body-md text-on-surface-variant">Project not found.</p>
          <Button
            variant="ghost"
            className="mt-4 text-on-surface-variant hover:text-on-background"
            onClick={() => router.push("/projects")}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Projects
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={project ? `${project.name} — Agents` : "Agents"} />

      <div className="p-6 space-y-6">
        {/* Breadcrumb + actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-on-surface-variant hover:text-on-background px-2"
              onClick={() => router.push(`/projects/${id}`)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {project?.name ?? "Project"}
            </Button>
            <span className="text-on-surface-dim">/</span>
            <span className="text-body-md font-semibold text-on-background">Agents</span>
          </div>

          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
            size="sm"
            onClick={() => setCreateOpen(true)}
            disabled={!project}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New Agent
          </Button>
        </div>

        {/* Agent count label */}
        {!isLoading && agents && agents.length > 0 && (
          <p className="text-label-sm uppercase tracking-wide text-on-surface-dim">
            {agents.length} agent{agents.length !== 1 ? "s" : ""} configured
          </p>
        )}

        {/* Content */}
        {isLoading ? (
          <AgentGridSkeleton />
        ) : agents && agents.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <AgentCard
                key={agent.filename}
                agent={agent}
                onEdit={handleEdit}
                onDelete={(a) => {
                  setDeleteError(null);
                  setPendingDelete(a);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl bg-surface-container ghost-border py-20">
            <Bot className="h-10 w-10 text-on-surface-dim mb-3" />
            <p className="text-headline-sm text-on-background">No agents configured</p>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Create your first agent to get started.
            </p>
            <Button
              className="mt-5 bg-primary text-primary-foreground hover:bg-primary/90"
              size="sm"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              New Agent
            </Button>
          </div>
        )}
      </div>

      {/* Create agent dialog */}
      {project && (
        <CreateAgentDialog
          open={createOpen}
          projectPath={project.path}
          onOpenChange={setCreateOpen}
          onCreated={() => setCreateOpen(false)}
        />
      )}

      {/* Edit sheet */}
      <Sheet
        open={Boolean(editingAgent)}
        onOpenChange={(open) => {
          if (!open) setEditingAgent(null);
        }}
      >
        <SheetContent
          side="right"
          className={cn(
            "w-full p-0 sm:max-w-4xl ghost-border",
            "bg-surface-container-high text-on-background flex flex-col"
          )}
        >
          {editingAgent && (
            <AgentEditor
              agent={editingAgent}
              isSaving={isSaving}
              onSave={handleSave}
              onCancel={() => setEditingAgent(null)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Delete confirmation dialog */}
      <Dialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
            setDeleteError(null);
          }
        }}
      >
        <DialogContent className="bg-surface-container ghost-border text-on-background sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-headline-sm">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Delete Agent
            </DialogTitle>
          </DialogHeader>

          <p className="text-body-md text-on-surface-variant">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-on-background font-mono">
              {pendingDelete?.name}
            </span>
            ? This action cannot be undone.
          </p>

          {deleteError && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-body-md text-destructive">
              {deleteError}
            </p>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              className="text-on-surface-variant hover:text-on-background"
              onClick={() => {
                setPendingDelete(null);
                setDeleteError(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
