"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export interface GitHubAuthUser {
  login: string;
  avatar: string;
  name: string;
}

export interface GitHubAuthState {
  isConnected: boolean;
  isLoading: boolean;
  user: GitHubAuthUser | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useGitHubAuth(): GitHubAuthState {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isConnected = status === "authenticated" && !!session?.accessToken;

  const user: GitHubAuthUser | null =
    isConnected && session?.githubUser?.login
      ? {
          login: session.githubUser.login,
          avatar: session.githubUser.avatar,
          name: session.githubUser.name,
        }
      : null;

  async function handleSignIn() {
    await signIn("github");
  }

  async function handleSignOut() {
    await signOut({ redirect: false });
  }

  return {
    isConnected,
    isLoading,
    user,
    signIn: handleSignIn,
    signOut: handleSignOut,
  };
}
