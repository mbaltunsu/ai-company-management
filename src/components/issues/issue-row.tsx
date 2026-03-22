"use client";

import { Badge } from "@/components/ui/badge";
import type { GitHubIssue } from "@/types";

interface IssueRowProps {
  issue: GitHubIssue;
  variant?: "even" | "odd";
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function IssueRow({ issue, variant = "even" }: IssueRowProps) {
  return (
    <div
      className={`flex items-start justify-between p-4 rounded-xl ${
        variant === "even" ? "bg-surface-container" : "bg-surface-dim"
      }`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <span
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
            issue.state === "open" ? "bg-success" : "bg-on-surface-dim"
          }`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-body-md font-semibold text-on-background truncate">
              {issue.title}
            </span>
            <span className="text-label-sm font-mono text-on-surface-dim">#{issue.number}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            {issue.labels.map((label) => (
              <Badge
                key={label.name}
                className="text-label-sm px-1.5 py-0"
                style={{
                  backgroundColor: `#${label.color}20`,
                  color: `#${label.color}`,
                }}
              >
                {label.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-4">
        {issue.assignee && (
          <span className="text-label-sm text-on-surface-variant">{issue.assignee}</span>
        )}
        <span className="text-label-sm text-on-surface-dim">{timeAgo(issue.createdAt)}</span>
      </div>
    </div>
  );
}
