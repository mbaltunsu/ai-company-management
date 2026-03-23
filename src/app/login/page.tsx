"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@codeops.dev");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
      } else {
        router.push("/");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-dim select-none">
      <div className="w-full max-w-sm rounded-xl bg-surface-container border border-outline-variant/50 p-8 shadow-lg">
        {/* Logo / title */}
        <div className="mb-8 text-center space-y-1">
          <h1 className="text-display-sm text-on-background font-semibold tracking-tight">
            CodeOps
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Company Management Dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-label-sm text-on-surface-variant block"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-outline-variant/60 bg-surface-container-high px-3.5 py-2.5 text-body-md text-on-background placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-label-sm text-on-surface-variant block"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-outline-variant/60 bg-surface-container-high px-3.5 py-2.5 text-body-md text-on-background placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-colors"
            />
          </div>

          {error && (
            <p className="text-body-sm text-destructive rounded-lg bg-destructive/10 border border-destructive/30 px-3.5 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-label-md text-on-primary font-medium transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
