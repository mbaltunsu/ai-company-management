"use client";

import { Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { GitHubRelease } from "@/types";

interface ReleaseTimelineProps {
  releases: GitHubRelease[];
}

export function ReleaseTimeline({ releases }: ReleaseTimelineProps) {
  if (releases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Tag className="h-8 w-8 text-on-surface-dim mb-3" />
        <p className="text-body-md text-on-surface-variant">No releases yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {releases.map((release, index) => (
        <div key={release.id} className="relative flex gap-4 pb-6">
          {/* Timeline line */}
          {index < releases.length - 1 && (
            <div className="absolute left-[11px] top-6 h-full w-px bg-outline-variant" />
          )}

          {/* Dot */}
          <div className="relative z-10 mt-1.5 h-[22px] w-[22px] shrink-0 rounded-full border-2 border-primary bg-surface-dim flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-body-md font-semibold font-mono text-on-background">
                {release.tagName}
              </span>
              {release.isPrerelease && (
                <Badge className="bg-warning/20 text-warning text-label-sm">pre-release</Badge>
              )}
              {release.isDraft && (
                <Badge variant="secondary" className="text-label-sm">draft</Badge>
              )}
            </div>
            <p className="text-body-md text-on-surface-variant mt-0.5">{release.name}</p>
            {release.publishedAt && (
              <p className="text-label-sm font-mono text-on-surface-dim mt-1">
                {new Date(release.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
