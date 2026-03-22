"use client";

import { Header } from "@/components/layout/header";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <>
      <Header title="Settings" />
      <div className="flex flex-col items-center justify-center py-24">
        <Settings className="h-12 w-12 text-on-surface-dim mb-4" />
        <h2 className="text-headline-sm text-on-background">Settings</h2>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Settings page coming in Phase 6.
        </p>
      </div>
    </>
  );
}
