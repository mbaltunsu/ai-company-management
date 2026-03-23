import fs from "fs/promises";
import path from "path";
import { logger } from "./logger";
import type { ProjectConfig, Agent, Rule } from "@/types";

const log = logger.child({ service: "ProjectService" });

export class ProjectService {
  /**
   * Read the full .claude/ config for a project
   */
  async getProjectConfig(projectPath: string): Promise<ProjectConfig> {
    const claudeDir = path.join(projectPath, ".claude");

    const agents = await this.readAgents(path.join(claudeDir, "agents"));
    const rules = await this.readRules(path.join(claudeDir, "rules"));
    const skills = await this.listMarkdownFiles(path.join(claudeDir, "skills"));

    return { agents, rules, skills };
  }

  /**
   * Read all agents from a project's .claude/agents/ directory
   */
  async readAgents(agentsDir: string): Promise<Agent[]> {
    const files = await this.listMarkdownFiles(agentsDir);
    const agents: Agent[] = [];

    for (const filename of files) {
      const filePath = path.join(agentsDir, filename);
      const content = await fs.readFile(filePath, "utf-8");
      const name = filename.replace(/\.md$/, "");
      const description = this.extractDescription(content);

      agents.push({ name, filename, description, content });
    }

    return agents;
  }

  /**
   * Read all rules from a project's .claude/rules/ directory
   */
  async readRules(rulesDir: string): Promise<Rule[]> {
    const files = await this.listMarkdownFiles(rulesDir);
    const rules: Rule[] = [];

    for (const filename of files) {
      const filePath = path.join(rulesDir, filename);
      const content = await fs.readFile(filePath, "utf-8");
      const name = filename.replace(/\.md$/, "");

      rules.push({ name, filename, content });
    }

    return rules;
  }

  /**
   * Get a single agent by name
   */
  async getAgent(projectPath: string, agentName: string): Promise<Agent | null> {
    const filename = agentName.endsWith(".md") ? agentName : `${agentName}.md`;
    const filePath = path.join(projectPath, ".claude", "agents", filename);

    try {
      const content = await fs.readFile(filePath, "utf-8");
      const name = filename.replace(/\.md$/, "");
      return { name, filename, description: this.extractDescription(content), content };
    } catch {
      return null;
    }
  }

  /**
   * Save (create or update) an agent file
   */
  async saveAgent(projectPath: string, agentName: string, content: string): Promise<void> {
    const filename = agentName.endsWith(".md") ? agentName : `${agentName}.md`;
    const agentsDir = path.join(projectPath, ".claude", "agents");

    await fs.mkdir(agentsDir, { recursive: true });
    await fs.writeFile(path.join(agentsDir, filename), content, "utf-8");
    log.info({ projectPath, agentName }, "Agent saved");
  }

  /**
   * Delete an agent file
   */
  async deleteAgent(projectPath: string, agentName: string): Promise<void> {
    const filename = agentName.endsWith(".md") ? agentName : `${agentName}.md`;
    const filePath = path.join(projectPath, ".claude", "agents", filename);

    await fs.unlink(filePath);
    log.info({ projectPath, agentName }, "Agent deleted");
  }

  /**
   * Read project README if it exists
   */
  async getReadme(projectPath: string): Promise<string | null> {
    const candidates = ["README.md", "readme.md", "Readme.md"];

    for (const name of candidates) {
      try {
        return await fs.readFile(path.join(projectPath, name), "utf-8");
      } catch {
        continue;
      }
    }

    return null;
  }

  /**
   * Get basic git info (current branch, recent commits count) via filesystem
   */
  async getGitInfo(projectPath: string): Promise<{ branch: string | null; hasGit: boolean }> {
    const headPath = path.join(projectPath, ".git", "HEAD");

    try {
      const head = await fs.readFile(headPath, "utf-8");
      const match = head.trim().match(/^ref: refs\/heads\/(.+)$/);
      return { branch: match ? match[1] : null, hasGit: true };
    } catch {
      return { branch: null, hasGit: false };
    }
  }

  // ── Private helpers ──────────────────────────────────────

  private async listMarkdownFiles(dirPath: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(dirPath);
      return entries.filter((f) => f.endsWith(".md")).sort();
    } catch {
      return [];
    }
  }

  private async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private extractDescription(content: string): string {
    const lines = content.split("\n").filter((l) => l.trim().length > 0);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("#") && !trimmed.startsWith("---") && !trimmed.startsWith("```")) {
        return trimmed.slice(0, 200);
      }
    }
    return "";
  }
}

export const projectService = new ProjectService();
