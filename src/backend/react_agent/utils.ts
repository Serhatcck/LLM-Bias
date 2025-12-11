import { ChatOpenAI } from "@langchain/openai";

/**
 * Load a ChatOpenAI model with optional logit_bias.
 * @param modelName - The model name (e.g., "gpt-4o-mini").
 * @param logitBias - Optional logit_bias parameter (token ID -> bias value mapping).
 * @returns A ChatOpenAI instance.
 */
export function loadChatModel(
  modelName: string,
  logitBias?: Record<number, number>
): ChatOpenAI {
  // Convert number keys to string keys for OpenAI API (JSON requires string keys)
  const logitBiasStringKeys: Record<string, number> | undefined = logitBias
    ? Object.fromEntries(
        Object.entries(logitBias).map(([key, value]) => [String(key), value])
      )
    : undefined;

  return new ChatOpenAI({
    model: modelName,
    logitBias: logitBiasStringKeys,
  });
}