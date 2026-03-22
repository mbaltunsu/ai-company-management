"use client";

import { Header } from "@/components/layout/header";
import { CircleDot } from "lucide-react";

export default function IssuesPage() {
  return (
    <>
      <Header title="Issues & Goals" />
      <div className="flex flex-col items-center justify-center py-24">
        <CircleDot className="h-12 w-12 text-on-surface-dim mb-4" />
        <h2 className="text-headline-sm text-on-background">Issues & Goals</h2>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Select a project to view its issues and goals.
        </p>
      </div>
    </>
  );
}
