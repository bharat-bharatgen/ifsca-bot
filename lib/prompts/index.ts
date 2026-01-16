/**
 * System Prompts Registry
 *
 * Central registry for all system prompts. Add new prompts by:
 * 1. Creating a new file in lib/prompts/ (e.g., v3-concise.ts)
 * 2. Importing and registering it in this file
 * 3. Set SYSTEM_PROMPT_VERSION in .env.local to use it
 */

// Import all prompt versions
import * as v1Detailed from './v1-detailed';
import * as v2RagOptimized from './v2-rag-optimized';
import * as v3DocPriority from './v3-doc-priority';

// Prompt interface
export interface SystemPrompt {
  id: string;
  name: string;
  description: string;
  basePrompt: string;
}

// Registry of all available prompts
export const PROMPTS: Record<string, SystemPrompt> = {
  'v1-detailed': {
    id: v1Detailed.PROMPT_ID,
    name: v1Detailed.PROMPT_NAME,
    description: v1Detailed.PROMPT_DESCRIPTION,
    basePrompt: v1Detailed.BASE_PROMPT,
  },
  'v2-rag-optimized': {
    id: v2RagOptimized.PROMPT_ID,
    name: v2RagOptimized.PROMPT_NAME,
    description: v2RagOptimized.PROMPT_DESCRIPTION,
    basePrompt: v2RagOptimized.BASE_PROMPT,
  },
  'v3-doc-priority': {
    id: v3DocPriority.PROMPT_ID,
    name: v3DocPriority.PROMPT_NAME,
    description: v3DocPriority.PROMPT_DESCRIPTION,
    basePrompt: v3DocPriority.BASE_PROMPT,
  },
};

// Default prompt version
export const DEFAULT_PROMPT_VERSION = 'v1-detailed';

/**
 * Get list of all available prompt versions
 */
export function getAvailablePrompts(): SystemPrompt[] {
  return Object.values(PROMPTS);
}

/**
 * Get a specific prompt by ID
 */
export function getPromptById(id: string): SystemPrompt | undefined {
  return PROMPTS[id];
}

/**
 * Build the complete system prompt with optional reference data injection
 * @param version - Prompt version ID (defaults to env var or DEFAULT_PROMPT_VERSION)
 */
export function buildSystemPrompt(version?: string): string {
  const promptVersion = version || process.env.SYSTEM_PROMPT_VERSION || DEFAULT_PROMPT_VERSION;
  const prompt = PROMPTS[promptVersion];

  if (!prompt) {
    console.warn(`Unknown prompt version: ${promptVersion}, falling back to ${DEFAULT_PROMPT_VERSION}`);
    return buildSystemPrompt(DEFAULT_PROMPT_VERSION);
  }

  return prompt.basePrompt;
}

/**
 * Get the current prompt version from environment
 */
export function getCurrentPromptVersion(): string {
  return process.env.SYSTEM_PROMPT_VERSION || DEFAULT_PROMPT_VERSION;
}
