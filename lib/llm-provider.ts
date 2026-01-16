import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

// Create vLLM provider for chat completions
export const vllmProvider = createOpenAICompatible({
  name: 'vllm-gpt-oss',
  baseURL: process.env.VLLM_CHAT_BASE_URL || 'http://localhost:8001/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get the chat model instance
export const getChatModel = () => {
  const modelName = process.env.VLLM_CHAT_MODEL || 'openai/gpt-oss-20b';
  return vllmProvider.chatModel(modelName);
};
