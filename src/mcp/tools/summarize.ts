import { z } from 'zod';
import { generateSummarizePrompt } from '../prompts/summarizePrompt';
import type { MCPContext } from '../types/mcp';

// Schema for search results
const ResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  snippet: z.string()
});

// Input schema for summarize tool
const SummarizeInputSchema = z.object({
  query: z.string(),
  results: z.array(ResultSchema)
});

// Output schema for summarize tool
const SummarizeOutputSchema = z.object({
  summary: z.string()
});

// Type definitions

// Helper function that mimics the defineTool pattern
function defineTool<TInput, TOutput>(config: {
  name: string;
  description: string;
  inputSchema: z.ZodSchema<TInput>;
  outputSchema: z.ZodSchema<TOutput>;
  run: (input: TInput, ctx: MCPContext) => Promise<TOutput>;
}) {
  return config;
}

// Define the summarize tool
export const summarize = defineTool({
  name: 'summarize',
  description: 'Summarize search results using a customizable prompt template',
  inputSchema: SummarizeInputSchema,
  outputSchema: SummarizeOutputSchema,
  run: async ({ query, results }, ctx) => {
    // Generate the prompt
    const prompt = generateSummarizePrompt(query, results);
    
    // Use MCP context LLM for completion
    const summary = await ctx.llm.complete(prompt);
    return { summary };
  }
});
