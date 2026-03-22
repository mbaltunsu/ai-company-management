"use client";

import { Header } from "@/components/layout/header";
import { Bot } from "lucide-react";

export default function AgentsPage() {
  return (
    <>
      <Header title="Agents" />
      <div className="flex flex-col items-center justify-center py-24">
        <Bot className="h-12 w-12 text-on-surface-dim mb-4" />
        <h2 className="text-headline-sm text-on-background">Agent Management</h2>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Select a project to manage its agents.
        </p>
      </div>
    </>
  );
}
