/**
 * Application Configuration
 *
 * Centralized configuration for the IFSCA chatbot.
 * All magic numbers and configurable values should be defined here.
 */

// LLM Configuration
export const LLM_CONFIG = {
  temperature: 0, // Deterministic responses for factual accuracy
  maxTokens: 4096,
  defaultModel: 'gpt-oss-20b',
} as const;

// API Configuration
export const API_CONFIG = {
  maxDuration: 120, // Max request duration in seconds
} as const;

// Message Roles
export const MESSAGE_ROLES = {
  SYSTEM: 'system',
  USER: 'user',
  ASSISTANT: 'assistant',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NO_USER_MESSAGE: 'No user message found',
  CHAT_FAILED: 'Failed to process chat request',
} as const;

// Context Templates
export const CONTEXT_TEMPLATES = {
  ragContext: (context: string) => `## REGULATORY CONTEXT (from IFSCA documents):\n\n${context}`,
} as const;
