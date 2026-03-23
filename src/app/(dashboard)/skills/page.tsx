"use client";

import { useState } from "react";
import { Wand2, Plus } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SkillCard } from "@/components/skills/skill-card";
import { CreateSkillDialog } from "@/components/skills/create-skill-dialog";
import { useSkills, useDeleteSkill } from "@/hooks/use-skills";
import { useProjects } from "@/hooks/use-projects";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Skill } from "@/types";

type Filter = "all" | "global" | "project";

const FILTER_OPTIONS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "All" },
  { id: "global", label: "Global" },
  { id: "project", label: "Per-project" },
];

export default function SkillsPage() {
  const { data: skills, isLoading } = useSkills(null);
  const { data: projects } = useProjects();
  const deleteSkill = useDeleteSkill();

  const [filter, setFilter] = useState<Filter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  const projectMap = new Map(
    (projects ?? []).map((p) => [p.id, p.name])
  );

  const filtered = (skills ?? []).filter((s) => {
    if (filter === "global") return s.projectId === null;
    if (filter === "project") return s.projectId !== null;
    return true;
  });

  function handleEdit(skill: Skill) {
    setEditingSkill(skill);
    setDialogOpen(true);
  }

  function handleDelete(skill: Skill) {
    deleteSkill.mutate(
      { id: skill.id, projectId: skill.projectId },
      {
        onSuccess: () => toast.success("Skill deleted"),
        onError: (err: Error) => toast.error(err.message),
      }
    );
  }

  function handleDialogClose(open: boolean) {
    setDialogOpen(open);
    if (!open) setEditingSkill(null);
  }

  return (
    <>
      <Header title="Skills" />

      <div className="p-6 space-y-6">
        {/* Page heading + action */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display-sm text-on-background">Skills</h1>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Reusable knowledge and capabilities for your AI agents
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingSkill(null);
              setDialogOpen(true);
            }}
            className="gap-2 bg-primary text-white hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Skill
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-surface-container p-1 w-fit">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id)}
              className={cn(
                "px-4 py-1.5 rounded-md text-label-sm font-medium transition-colors",
                filter === opt.id
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface-variant hover:text-on-background"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid gap-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[140px] rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Wand2 className="h-10 w-10 text-on-surface-dim mb-4" />
            <p className="text-body-md font-semibold text-on-background">
              No skills yet
            </p>
            <p className="mt-1 text-body-md text-on-surface-variant">
              {filter === "all"
                ? "Create your first skill to get started"
                : filter === "global"
                ? "No global skills found"
                : "No project-specific skills found"}
            </p>
            {filter === "all" && (
              <Button
                onClick={() => {
                  setEditingSkill(null);
                  setDialogOpen(true);
                }}
                className="mt-4 gap-2 bg-primary text-white hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                New Skill
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
            {filtered.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                projectName={
                  skill.projectId ? projectMap.get(skill.projectId) : undefined
                }
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <CreateSkillDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        editingSkill={editingSkill}
      />
    </>
  );
}
