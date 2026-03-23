"use client";

import dynamic from "next/dynamic";
import type { GraphNode, GraphLink } from "@/types";

interface NetworkGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  onNodeClick: (node: GraphNode) => void;
  width: number;
  height: number;
}

// Dynamic import prevents canvas from running on the server (no SSR)
const NetworkGraphCanvas = dynamic(
  () =>
    import("@/components/graph/network-graph-canvas").then(
      (mod) => mod.NetworkGraphCanvas
    ),
  { ssr: false }
);

export function NetworkGraph(props: NetworkGraphProps) {
  return <NetworkGraphCanvas {...props} />;
}
