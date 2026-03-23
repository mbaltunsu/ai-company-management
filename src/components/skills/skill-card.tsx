"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Skill } from "@/types";

interface SkillCardProps {
  skill: Skill;
  projectName?: string;
  onEdit: (skill: Skill) => void;
  onDelete: (skill: Skill) => void;
}

export function SkillCard({
  skill,
  projectName,
  onEdit,
  onDelete,
}: SkillCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn(
        "group relative rounded-xl bg-surface-container p-5 transition-colors",
        hovered && "bg-surface-container-high"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Action buttons — hover reveal */}
      <div
        className={cn(
          "absolute top-3 right-3 flex items-center gap-1 transition-opacity",
          hovered ? "opacity-100" : "opacity-0"
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-on-surface-variant hover:text-primary hover:bg-primary/10"
          onClick={() => onEdit(skill)}
          aria-label="Edit skill"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-on-surface-variant hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(skill)}
          aria-label="Delete skill"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Name */}
      <p className="text-body-md font-semibold text-on-background pr-16">
        {skill.name}
      </p>

      {/* Description */}
      {skill.description && (
        <p className="mt-1.5 text-body-md text-on-surface-variant line-clamp-2">
          {skill.description}
        </p>
      )}

      {/* When to use */}
      {skill.whenToUse && (
        <div className="mt-3">
          <Badge
            variant="secondary"
            className="text-label-sm font-normal bg-primary/10 text-primary border-0 max-w-full truncate"
            title={skill.whenToUse}
          >
            {skill.whenToUse}
          </Badge>
        </div>
      )}

      {/* Project / Global badge */}
      <div className="mt-3 flex items-center gap-2">
        {skill.projectId ? (
          <Badge
            variant="outline"
            className="text-label-sm border-[#1f1f23] text-on-surface-variant"
          >
            {projectName ?? "Project"}
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="text-label-sm bg-success/10 text-success border-0"
          >
            Global
          </Badge>
        )}
      </div>
    </div>
  );
}
