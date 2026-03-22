"use client";

import { HeartPulse, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectHealthInfo } from "@/types";

function getHealthConfig(health: number) {
  if (health > 70) {
    return {
      color: "text-success",
      barColor: "bg-success",
      bgColor: "bg-success/10",
      icon: CheckCircle2,
      label: "Healthy",
    };
  }
  if (health >= 40) {
    return {
      color: "text-warning",
      barColor: "bg-warning",
      bgColor: "bg-warning/10",
      icon: AlertTriangle,
      label: "Warning",
    };
  }
  return {
    color: "text-destructive",
    barColor: "bg-destructive",
    bgColor: "bg-destructive/10",
    icon: XCircle,
    label: "Critical",
  };
}

interface HealthRowProps {
  item: ProjectHealthInfo;
}

function HealthRow({ item }: HealthRowProps) {
  const config = getHealthConfig(item.health);
  const Icon = config.icon;
  const clampedHealth = Math.max(0, Math.min(100, item.health));

  return (
    <div className="group flex flex-col gap-2 py-3 transition-colors duration-150">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className={cn("h-3.5 w-3.5 shrink-0", config.color)} />
          <span className="text-body-md text-on-background truncate font-medium">
            {item.projectName}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={cn("text-label-sm font-semibold tabular-nums", config.color)}>
            {clampedHealth}%
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-md px-1.5 py-0.5 text-label-sm uppercase tracking-widest",
              config.color,
              config.bgColor
            )}
          >
            {config.label}
          </span>
        </div>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            config.barColor
          )}
          style={{ width: `${clampedHealth}%` }}
          role="progressbar"
          aria-valuenow={clampedHealth}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${item.projectName} health: ${clampedHealth}%`}
        />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container-high border border-outline-variant/50">
        <HeartPulse className="h-5 w-5 text-on-surface-dim" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-body-md font-medium text-on-background">No projects registered</p>
        <p className="text-body-md text-on-surface-variant">
          Scan a directory to discover projects.
        </p>
      </div>
    </div>
  );
}

interface ProjectHealthProps {
  items: ProjectHealthInfo[];
  className?: string;
}

export function ProjectHealth({ items, className }: ProjectHealthProps) {
  const sorted = [...items].sort((a, b) => b.health - a.health);

  const healthyCount = items.filter((i) => i.health > 70).length;
  const criticalCount = items.filter((i) => i.health < 40).length;

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-headline-sm text-on-background">Project Health</h2>
        {items.length > 0 && (
          <span className="text-label-sm text-on-surface-dim uppercase tracking-widest">
            {items.length} projects
          </span>
        )}
      </div>

      {items.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="text-label-sm text-on-surface-variant">
              {healthyCount} healthy
            </span>
          </div>
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
              <span className="text-label-sm text-on-surface-variant">
                {criticalCount} critical
              </span>
            </div>
          )}
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col divide-y divide-outline-variant/20">
          {sorted.map((item) => (
            <HealthRow key={item.projectId} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
