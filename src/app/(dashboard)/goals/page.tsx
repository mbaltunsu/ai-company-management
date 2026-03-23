"use client";

import { Header } from "@/components/layout/header";
import { Target } from "lucide-react";

export default function GoalsPage() {
  return (
    <>
      <Header title="Goals" />
      <div className="flex flex-col items-center justify-center py-24">
        <Target className="h-12 w-12 text-on-surface-dim mb-4" />
        <h2 className="text-headline-sm text-on-background">Goals</h2>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Select a project to track its goals.
        </p>
      </div>
    </>
  );
}
