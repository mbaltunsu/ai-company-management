"use client";

import { useRef, useEffect, useCallback } from "react";
import ForceGraph2D, { type ForceGraphMethods, type NodeObject } from "react-force-graph-2d";
import type { GraphNode, GraphLink } from "@/types";

interface NetworkGraphCanvasProps {
  nodes: GraphNode[];
  links: GraphLink[];
  onNodeClick: (node: GraphNode) => void;
  width: number;
  height: number;
}

type FGNode = NodeObject & GraphNode;

export function NetworkGraphCanvas({
  nodes,
  links,
  onNodeClick,
  width,
  height,
}: NetworkGraphCanvasProps) {
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);

  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    // Configure forces after mount
    fg.d3Force("charge")?.strength(-80);
    fg.d3Force("link")?.distance(60);
  }, []);

  const nodeCanvasObject = useCallback(
    (rawNode: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const node = rawNode as FGNode;
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const radius = node.size / 2;
      const isProject = node.type === "project";

      // Glow effect for project nodes with activity
      if (isProject && node.glow) {
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = node.glow;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = isProject ? node.color : `${node.color}99`; // 60% opacity for agents
        ctx.fill();
      }

      // Label below the node
      const fontSize = isProject
        ? Math.max(10 / globalScale, 3)
        : Math.max(8 / globalScale, 2.5);
      ctx.font = `${isProject ? "600" : "400"} ${fontSize}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = isProject ? "#f8f8f8" : "#a1a1aa";
      ctx.fillText(node.label, x, y + radius + 2 / globalScale);
    },
    []
  );

  const handleNodeClick = useCallback(
    (rawNode: NodeObject) => {
      const node = rawNode as FGNode;
      if (node.type === "project") {
        onNodeClick(node);
      }
    },
    [onNodeClick]
  );

  return (
    <ForceGraph2D
      ref={fgRef}
      graphData={{ nodes, links }}
      width={width}
      height={height}
      backgroundColor="transparent"
      nodeCanvasObject={nodeCanvasObject}
      nodeRelSize={1}
      nodeVal={(n) => ((n as FGNode).size ?? 10) / 2}
      linkColor={() => "#1f1f23"}
      linkWidth={1.2}
      onNodeClick={handleNodeClick}
      cooldownTicks={120}
      enableNodeDrag
      enableZoomInteraction
    />
  );
}
