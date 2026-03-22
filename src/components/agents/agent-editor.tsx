"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Agent } from "@/types";

// ---------------------------------------------------------------------------
// Minimal markdown-to-JSX renderer — no external deps
// Handles: # headers, ``` code blocks, - list items, paragraphs
// ---------------------------------------------------------------------------

function renderMarkdown(raw: string): React.ReactNode[] {
  const lines = raw.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.trimStart().startsWith("```")) {
      const lang = line.trimStart().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      nodes.push(
        <pre
          key={key++}
          className="my-3 rounded-lg bg-surface-dim p-4 overflow-x-auto"
        >
          <code className="font-mono text-body-md text-on-surface-variant whitespace-pre">
            {lang ? (
              <span className="block text-label-sm text-on-surface-dim mb-2 uppercase tracking-wide">
                {lang}
              </span>
            ) : null}
            {codeLines.join("\n")}
          </code>
        </pre>
      );
      i++; // skip closing ```
      continue;
    }

    // H1
    if (/^# /.test(line)) {
      nodes.push(
        <h1 key={key++} className="text-headline-sm font-bold text-on-background mt-4 mb-1 first:mt-0">
          {line.slice(2)}
        </h1>
      );
      i++;
      continue;
    }

    // H2
    if (/^## /.test(line)) {
      nodes.push(
        <h2 key={key++} className="text-body-md font-semibold text-on-background mt-4 mb-1">
          {line.slice(3)}
        </h2>
      );
      i++;
      continue;
    }

    // H3
    if (/^### /.test(line)) {
      nodes.push(
        <h3 key={key++} className="text-body-md font-semibold text-on-surface-variant mt-3 mb-1">
          {line.slice(4)}
        </h3>
      );
      i++;
      continue;
    }

    // List item (- or *)
    if (/^[-*] /.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <ul key={key++} className="my-2 space-y-1 pl-4">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-body-md text-on-surface-variant flex gap-2">
              <span className="text-primary mt-0.5 shrink-0">–</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Empty line — skip silently
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph
    nodes.push(
      <p key={key++} className="text-body-md text-on-surface-variant my-2 leading-relaxed">
        {line}
      </p>
    );
    i++;
  }

  return nodes;
}

// ---------------------------------------------------------------------------

interface AgentEditorProps {
  agent: Agent;
  isSaving?: boolean;
  onSave: (content: string) => void;
  onCancel: () => void;
}

export function AgentEditor({ agent, isSaving = false, onSave, onCancel }: AgentEditorProps) {
  const [content, setContent] = useState(agent.content);

  const handleSave = useCallback(() => {
    onSave(content);
  }, [content, onSave]);

  const preview = renderMarkdown(content);

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between gap-4 px-5 py-3 ghost-border border-b">
        <div className="min-w-0">
          <p className="text-body-md font-semibold text-on-background truncate">{agent.name}</p>
          <p className="font-mono text-label-sm uppercase tracking-wide text-on-surface-dim">
            {agent.filename}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-on-surface-variant hover:text-on-background"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {/* Split pane */}
      <div className="grid flex-1 grid-cols-2 overflow-hidden min-h-0">
        {/* Editor */}
        <div className="flex flex-col overflow-hidden ghost-border border-r">
          <p className="shrink-0 px-4 py-2 text-label-sm uppercase tracking-wide text-on-surface-dim bg-surface-container-high">
            Editor
          </p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={cn(
              "flex-1 resize-none bg-surface-container-high font-mono text-body-md",
              "text-on-background caret-primary outline-none p-4 leading-relaxed",
              "placeholder:text-on-surface-dim"
            )}
            spellCheck={false}
            aria-label="Agent content editor"
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col overflow-hidden bg-surface-container">
          <p className="shrink-0 px-4 py-2 text-label-sm uppercase tracking-wide text-on-surface-dim bg-surface-container">
            Preview
          </p>
          <ScrollArea className="flex-1 p-4">
            {preview.length > 0 ? (
              preview
            ) : (
              <p className="text-body-md text-on-surface-dim italic">Start typing to see a preview…</p>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
