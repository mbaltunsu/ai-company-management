"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Github,
  Lock,
  Globe,
  ArrowRight,
  Loader2,
  Star,
} from "lucide-react";
import { useGitHubAuth } from "@/hooks/use-auth";
import { useGitHubRepos } from "@/hooks/use-github";
import { cn } from "@/lib/utils";
import type { GitHubRepository, ApiResult } from "@/types";

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

interface ImportProjectDialogProps {
  trigger?: React.ReactNode;
}

export function ImportProjectDialog({ trigger }: ImportProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [importingId, setImportingId] = useState<number | null>(null);

  const { isConnected, isLoading: authLoading, signIn, user } = useGitHubAuth();
  const { data: repos, isLoading: reposLoading } = useGitHubRepos(search, page);
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (repo: GitHubRepository) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: repo.name,
          path: "",
          githubRepo: repo.fullName,
          description: repo.description,
        }),
      });
      const json: ApiResult<unknown> = await res.json();
      if (json.error) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (_, repo) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(`Imported ${repo.name}`);
      setOpen(false);
      setSearch("");
      setPage(1);
      setImportingId(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to import project");
      setImportingId(null);
    },
  });

  function handleImport(repo: GitHubRepository) {
    setImportingId(repo.id);
    importMutation.mutate(repo);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setSearch(""); setPage(1); } }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-2">
            <Github className="h-4 w-4" />
            <span className="text-body-md">Import from GitHub</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px] p-0 gap-0 bg-surface-dim border-outline-variant overflow-hidden">
        {authLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-on-surface-variant" />
          </div>
        ) : !isConnected ? (
          /* ── Not connected: GitHub CTA ── */
          <div className="flex flex-col items-center justify-center py-16 px-6 gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container-high border border-outline-variant">
              <Github className="h-7 w-7 text-on-surface-dim" />
            </div>
            <div className="text-center space-y-2 max-w-[300px]">
              <p className="text-headline-sm text-on-background">Connect GitHub</p>
              <p className="text-body-md text-on-surface-variant">
                Sign in with GitHub to browse and import your repositories.
              </p>
            </div>
            <Button
              onClick={() => signIn()}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Github className="h-4 w-4" />
              Connect GitHub
            </Button>
          </div>
        ) : (
          /* ── Connected: Repo picker ── */
          <>
            <DialogHeader className="px-5 pt-5 pb-0">
              <DialogTitle className="text-headline-sm text-on-background">
                Import Repository
              </DialogTitle>
              <p className="text-body-md text-on-surface-variant mt-1">
                Select a repository from{" "}
                <span className="font-semibold text-on-background">{user?.login}</span>{" "}
                to import as a project.
              </p>
            </DialogHeader>

            {/* Search */}
            <div className="px-5 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                <Input
                  placeholder="Search repositories..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-9 bg-surface-container-high border-outline-variant text-on-background placeholder:text-on-surface-dim focus-visible:ring-primary"
                />
              </div>
            </div>

            {/* Repo list */}
            <ScrollArea className="max-h-[400px]">
              {reposLoading ? (
                <div className="px-5 pb-5 space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-[64px] rounded-xl bg-surface-container" />
                  ))}
                </div>
              ) : repos && repos.length > 0 ? (
                <div className="px-3 pb-3">
                  {repos.map((repo, i) => (
                    <div
                      key={repo.id}
                      className={cn(
                        "flex items-center justify-between gap-3 px-3 py-3 rounded-xl transition-colors",
                        i % 2 === 0 ? "bg-surface-container" : "bg-transparent",
                        "hover:bg-surface-container-high"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-body-md font-semibold text-on-background truncate">
                            {repo.name}
                          </span>
                          {repo.isPrivate ? (
                            <Lock className="h-3 w-3 shrink-0 text-on-surface-dim" />
                          ) : (
                            <Globe className="h-3 w-3 shrink-0 text-on-surface-dim" />
                          )}
                          {repo.language && (
                            <Badge variant="secondary" className="text-label-sm px-1.5 py-0 shrink-0">
                              {repo.language}
                            </Badge>
                          )}
                          {repo.starCount > 0 && (
                            <span className="flex items-center gap-0.5 text-label-sm text-on-surface-dim shrink-0">
                              <Star className="h-3 w-3" />
                              {repo.starCount}
                            </span>
                          )}
                        </div>
                        {repo.description && (
                          <p className="text-label-sm text-on-surface-variant mt-0.5 truncate">
                            {repo.description}
                          </p>
                        )}
                        <p className="text-label-sm text-on-surface-dim mt-0.5">
                          Updated {timeAgo(repo.updatedAt)}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="shrink-0 gap-1.5 border border-outline-variant text-on-surface-variant hover:text-on-background hover:bg-primary hover:text-primary-foreground hover:border-primary"
                        onClick={() => handleImport(repo)}
                        disabled={importingId === repo.id}
                      >
                        {importingId === repo.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ArrowRight className="h-3.5 w-3.5" />
                        )}
                        Import
                      </Button>
                    </div>
                  ))}

                  {/* Load more */}
                  {repos.length >= 30 && (
                    <div className="flex justify-center pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-on-surface-variant hover:text-on-background"
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Load more
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-5">
                  <Github className="h-8 w-8 text-on-surface-dim mb-3" />
                  <p className="text-body-md text-on-surface-variant">
                    {search ? "No repositories match your search" : "No repositories found"}
                  </p>
                </div>
              )}
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
