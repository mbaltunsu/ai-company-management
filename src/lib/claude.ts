import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

const log = logger.child({ service: "ClaudeService" });

async function getApiKey(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "claudeApiKey")
    .single();
  return data?.value ? JSON.parse(JSON.stringify(data.value)) : null;
}

export async function generateTaskSuggestion(
  taskTitle: string,
  taskDescription: string | undefined,
  availableAgents: { name: string; description: string }[]
): Promise<{ suggestedAgents: string[]; prompt: string }> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error("Claude API key not configured");

  const client = new Anthropic({ apiKey });

  const agentList = availableAgents
    .map((a) => `- ${a.name}: ${a.description}`)
    .join("\n");

  log.info({ taskTitle, agentCount: availableAgents.length }, "Generating task suggestion");

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a project management AI. Given a task and available AI agents, suggest which agents should work on it and create a prompt for them.

Task: ${taskTitle}
${taskDescription ? `Description: ${taskDescription}` : ""}

Available Agents:
${agentList}

Respond in JSON format only:
{
  "suggestedAgents": ["agent-name-1", "agent-name-2"],
  "prompt": "A detailed prompt describing what each agent should do for this task"
}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse Claude response");

  const result = JSON.parse(jsonMatch[0]) as {
    suggestedAgents: string[];
    prompt: string;
  };

  log.info(
    { suggestedAgents: result.suggestedAgents },
    "Task suggestion generated"
  );

  return result;
}

export async function testConnection(): Promise<boolean> {
  const apiKey = await getApiKey();
  if (!apiKey) return false;

  try {
    const client = new Anthropic({ apiKey });
    await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 10,
      messages: [{ role: "user", content: "ping" }],
    });
    log.info("Claude connection test succeeded");
    return true;
  } catch (err) {
    log.warn({ err }, "Claude connection test failed");
    return false;
  }
}
