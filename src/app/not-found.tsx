import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-[calc(100vh-56px)] flex-col items-center justify-center gap-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container-high border border-outline-variant">
        <FileQuestion className="h-7 w-7 text-on-surface-dim" />
      </div>
      <div className="text-center space-y-2 max-w-[400px]">
        <h2 className="text-headline-sm text-on-background">Page not found</h2>
        <p className="text-body-md text-on-surface-variant">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-body-md font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
