import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { decrypt, isEncrypted } from "@/lib/encryption";

const log = logger.child({ service: "ClaudeService" });

async function getApiKey(): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "claudeApiKey")
    .single();

  if (error) {
    log.warn({ error }, "Failed to read claudeApiKey from app_settings");
    return null;
  }

  // JSONB stores the value — extract it as a string
  const raw = data?.value != null ? String(data.value) : null;
  if (!raw) {
    log.warn("Claude API key is empty or not set");
    return null;
  }

  log.info({
    rawLength: raw.length,
    rawFirst20: raw.slice(0, 20),
    rawType: typeof data.value,
    isEnc: isEncrypted(raw),
  }, "Read Claude API key from DB");

  // Decrypt if stored encrypted, otherwise return as-is (legacy)
  try {
    if (isEncrypted(raw)) {
      const decrypted = decrypt(raw);
      log.info({
        decryptedLength: decrypted.length,
        decryptedFirst10: decrypted.slice(0, 10),
        decryptedLast4: decrypted.slice(-4),
      }, "Decrypted Claude API key");
      return decrypted;
    }
  } catch (err) {
    log.error({ err }, "Failed to decrypt Claude API key");
    return null;
  }
  return raw;
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

export async function testConnection(): Promise<{ connected: boolean; error?: string }> {
  const apiKey = await getApiKey();
  if (!apiKey) return { connected: false, error: "No API key configured" };

  // Trim whitespace/newlines that may have been copied
  const cleanKey = apiKey.trim();

  try {
    const client = new Anthropic({ apiKey: cleanKey });
    await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 10,
      messages: [{ role: "user", content: "ping" }],
    });
    log.info("Claude connection test succeeded");
    return { connected: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    // Extract Anthropic API error message if available
    const apiError = (err as { error?: { error?: { message?: string } } })?.error?.error?.message;
    const errorMsg = apiError || message;
    log.warn({ err }, "Claude connection test failed");
    return { connected: false, error: errorMsg };
  }
}
