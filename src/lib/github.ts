import { Octokit } from "@octokit/rest";
import { logger } from "./logger";
import type {
  GitHubCommit,
  GitHubBranch,
  GitHubRelease,
  GitHubIssue,
  GitHubRateLimit,
  GitHubRepository,
  RepoInfo,
} from "@/types";

const log = logger.child({ service: "GitHubService" });

export class GitHubService {
  private octokit: Octokit;
  private owner: string;

  constructor(token: string, owner: string) {
    this.octokit = new Octokit({ auth: token });
    this.owner = owner;
  }

  async getRepoInfo(repo: string): Promise<RepoInfo> {
    log.info({ repo }, "Fetching repo info");
    const { data } = await this.octokit.repos.get({
      owner: this.owner,
      repo,
    });

    return {
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      defaultBranch: data.default_branch,
      starCount: data.stargazers_count,
      openIssueCount: data.open_issues_count,
      language: data.language,
      isPrivate: data.private,
      url: data.html_url,
    };
  }

  async getCommits(
    repo: string,
    options?: { since?: string; until?: string; page?: number; perPage?: number }
  ): Promise<GitHubCommit[]> {
    log.info({ repo, ...options }, "Fetching commits");
    const { data } = await this.octokit.repos.listCommits({
      owner: this.owner,
      repo,
      since: options?.since,
      until: options?.until,
      page: options?.page || 1,
      per_page: options?.perPage || 30,
    });

    return data.map((commit) => ({
      sha: commit.sha,
      message: commit.commit.message.split("\n")[0],
      author: commit.commit.author?.name || "Unknown",
      authorAvatar: commit.author?.avatar_url || null,
      date: commit.commit.author?.date || "",
      url: commit.html_url,
    }));
  }

  async getBranches(repo: string): Promise<GitHubBranch[]> {
    log.info({ repo }, "Fetching branches");
    const { data } = await this.octokit.repos.listBranches({
      owner: this.owner,
      repo,
      per_page: 100,
    });

    const repoInfo = await this.getRepoInfo(repo);

    return data.map((branch) => ({
      name: branch.name,
      commitSha: branch.commit.sha,
      isDefault: branch.name === repoInfo.defaultBranch,
      isProtected: branch.protected,
      lastCommitDate: null,
    }));
  }

  async getReleases(repo: string, perPage = 10): Promise<GitHubRelease[]> {
    log.info({ repo }, "Fetching releases");
    const { data } = await this.octokit.repos.listReleases({
      owner: this.owner,
      repo,
      per_page: perPage,
    });

    return data.map((release) => ({
      id: release.id,
      tagName: release.tag_name,
      name: release.name || release.tag_name,
      body: release.body ?? null,
      isDraft: release.draft,
      isPrerelease: release.prerelease,
      publishedAt: release.published_at,
      url: release.html_url,
    }));
  }

  async getIssues(
    repo: string,
    options?: { state?: "open" | "closed" | "all"; labels?: string; page?: number; perPage?: number }
  ): Promise<GitHubIssue[]> {
    log.info({ repo, ...options }, "Fetching issues");
    const { data } = await this.octokit.issues.listForRepo({
      owner: this.owner,
      repo,
      state: options?.state || "open",
      labels: options?.labels,
      page: options?.page || 1,
      per_page: options?.perPage || 30,
    });

    return data
      .filter((issue) => !issue.pull_request)
      .map((issue) => ({
        number: issue.number,
        title: issue.title,
        body: issue.body ?? null,
        state: issue.state as "open" | "closed",
        labels: issue.labels
          .filter((l): l is { name: string; color: string; description: string | null } =>
            typeof l === "object" && l !== null && "name" in l
          )
          .map((l) => ({
            name: l.name || "",
            color: l.color || "6366f1",
            description: l.description || null,
          })),
        assignee: issue.assignee?.login || null,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        url: issue.html_url,
      }));
  }

  async createIssue(
    repo: string,
    title: string,
    body?: string,
    labels?: string[]
  ): Promise<GitHubIssue> {
    log.info({ repo, title }, "Creating issue");
    const { data } = await this.octokit.issues.create({
      owner: this.owner,
      repo,
      title,
      body,
      labels,
    });

    return {
      number: data.number,
      title: data.title,
      body: data.body ?? null,
      state: data.state as "open" | "closed",
      labels: data.labels
        .filter((l): l is { name: string; color: string; description: string | null } =>
          typeof l === "object" && l !== null && "name" in l
        )
        .map((l) => ({
          name: l.name || "",
          color: l.color || "6366f1",
          description: l.description || null,
        })),
      assignee: data.assignee?.login || null,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      url: data.html_url,
    };
  }

  async updateIssue(
    repo: string,
    issueNumber: number,
    updates: { title?: string; body?: string; state?: "open" | "closed"; labels?: string[] }
  ): Promise<GitHubIssue> {
    log.info({ repo, issueNumber }, "Updating issue");
    const { data } = await this.octokit.issues.update({
      owner: this.owner,
      repo,
      issue_number: issueNumber,
      ...updates,
    });

    return {
      number: data.number,
      title: data.title,
      body: data.body ?? null,
      state: data.state as "open" | "closed",
      labels: data.labels
        .filter((l): l is { name: string; color: string; description: string | null } =>
          typeof l === "object" && l !== null && "name" in l
        )
        .map((l) => ({
          name: l.name || "",
          color: l.color || "6366f1",
          description: l.description || null,
        })),
      assignee: data.assignee?.login || null,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      url: data.html_url,
    };
  }

  async getRateLimit(): Promise<GitHubRateLimit> {
    const { data } = await this.octokit.rateLimit.get();
    return {
      limit: data.rate.limit,
      remaining: data.rate.remaining,
      resetAt: new Date(data.rate.reset * 1000).toISOString(),
    };
  }

  async getAuthenticatedUser(): Promise<{
    login: string;
    avatar: string;
    name: string;
    publicRepos: number;
  }> {
    log.info("Fetching authenticated user");
    const { data } = await this.octokit.users.getAuthenticated();
    return {
      login: data.login,
      avatar: data.avatar_url,
      name: data.name ?? data.login,
      publicRepos: data.public_repos,
    };
  }

  async listUserRepositories(
    options?: { page?: number; perPage?: number; sort?: "updated" | "created" | "pushed" | "full_name" }
  ): Promise<GitHubRepository[]> {
    log.info({ ...options }, "Listing user repositories");
    const { data } = await this.octokit.repos.listForAuthenticatedUser({
      sort: options?.sort || "updated",
      direction: "desc",
      per_page: options?.perPage || 30,
      page: options?.page || 1,
    });

    return data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description ?? null,
      language: repo.language ?? null,
      isPrivate: repo.private,
      defaultBranch: repo.default_branch,
      updatedAt: repo.updated_at ?? "",
      url: repo.html_url,
      starCount: repo.stargazers_count ?? 0,
    }));
  }

  async searchUserRepositories(query: string): Promise<GitHubRepository[]> {
    log.info({ query }, "Searching user repositories");
    const { data } = await this.octokit.search.repos({
      q: `${query} user:${this.owner}`,
      sort: "updated",
      order: "desc",
      per_page: 30,
    });

    return data.items.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description ?? null,
      language: repo.language ?? null,
      isPrivate: repo.private,
      defaultBranch: repo.default_branch,
      updatedAt: repo.updated_at ?? "",
      url: repo.html_url,
      starCount: repo.stargazers_count ?? 0,
    }));
  }
}

/**
 * Create a GitHubService instance from environment variables.
 * Returns null if credentials are not configured.
 * Kept for non-authenticated contexts such as setup scripts.
 */
export function createGitHubService(token?: string, owner?: string): GitHubService | null {
  const resolvedToken = token ?? process.env.GITHUB_TOKEN;
  const resolvedOwner = owner ?? process.env.GITHUB_OWNER;

  if (!resolvedToken || !resolvedOwner) {
    log.warn("GitHub credentials not configured");
    return null;
  }

  return new GitHubService(resolvedToken, resolvedOwner);
}

/**
 * Create a GitHubService instance from a NextAuth session.
 * Returns null if the session has no access token or GitHub user.
 */
export function createGitHubServiceFromSession(session: {
  accessToken?: string;
  githubUser?: { login?: string };
} | null): GitHubService | null {
  const token = session?.accessToken;
  const owner = session?.githubUser?.login;

  if (!token || !owner) {
    log.warn("No GitHub session token available");
    return null;
  }

  return new GitHubService(token, owner);
}
