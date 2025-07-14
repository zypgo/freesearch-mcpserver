import { promptManager } from './promptManager';

// Function to generate summarization prompt
export function generateSummarizePrompt(query: string, results: Array<{ title: string; snippet: string }>): string {
  return promptManager.render('summarize', { query, results });
}

// Function to set custom prompt path
export function setCustomPromptPath(path: string): void {
  promptManager.setCustomPromptPath(path);
}
