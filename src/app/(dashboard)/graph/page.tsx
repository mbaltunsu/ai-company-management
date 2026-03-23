"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { NetworkGraph } from "@/components/graph/network-graph";
import { GraphLegend } from "@/components/graph/graph-legend";
import { useGraphData } from "@/hooks/use-graph-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Network } from "lucide-react";
import type { GraphNode } from "@/types";

const HEADER_HEIGHT = 56;

export default function GraphPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { nodes, links, isLoading } = useGraphData();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setDimensions({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(el);
    // Set initial dimensions
    setDimensions({ width: el.clientWidth, height: el.clientHeight });

    return () => observer.disconnect();
  }, []);

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      if (node.projectId) {
        router.push(`/projects/${node.projectId}`);
      }
    },
    [router]
  );

  const isEmpty = !isLoading && nodes.length === 0;

  return (
    <>
      <Header title="Network" />
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        style={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }}
      >
        {isLoading ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <Skeleton className="h-64 w-64 rounded-full opacity-20" />
            <Skeleton className="h-4 w-40 opacity-20" />
          </div>
        ) : isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <Network className="h-14 w-14 text-[#52525b]" />
            <p className="text-base font-medium text-[#f8f8f8]">No project network yet</p>
            <p className="text-sm text-[#a1a1aa]">
              Add projects with GitHub repos to see the agent network.
            </p>
          </div>
        ) : dimensions.width > 0 ? (
          <>
            <NetworkGraph
              nodes={nodes}
              links={links}
              onNodeClick={handleNodeClick}
              width={dimensions.width}
              height={dimensions.height}
            />
            <GraphLegend />
          </>
        ) : null}
      </div>
    </>
  );
}
