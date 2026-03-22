"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col items-center justify-center gap-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/30">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <div className="text-center space-y-2 max-w-[400px]">
        <h2 className="text-headline-sm text-on-background">Something went wrong</h2>
        <p className="text-body-md text-on-surface-variant">
          An unexpected error occurred. This has been logged for investigation.
        </p>
        {error.digest && (
          <p className="text-label-sm font-mono text-on-surface-dim">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <Button onClick={reset} variant="outline" className="ghost-border">
        Try Again
      </Button>
    </div>
  );
}
