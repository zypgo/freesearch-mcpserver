#!/usr/bin/env node
/**
 * MCP Server for stdio communication
 * This is the entry point for MCP clients like Claude Desktop
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { search } from './mcp/tools/search';
import { setCustomPromptPath, generateSummarizePrompt } from './mcp/prompts/summarizePrompt';
import { z } from 'zod';

// Parse command line arguments
const args = process.argv.slice(2);
const promptFileIndex = args.indexOf('--prompt-file');
if (promptFileIndex !== -1 && promptFileIndex + 1 < args.length) {
  const promptFile = args[promptFileIndex + 1];
  if (promptFile) {
    setCustomPromptPath(promptFile);
  }
}

// Create MCP server
const mcpServer = new McpServer({
  name: 'freesearch-mcpserver',
  version: '1.0.0',
});

// Register search tool
mcpServer.registerTool(
  'search',
  {
    description: 'Search the web using DuckDuckGo',
    inputSchema: {
      query: z.string().describe('Search query'),
    },
  },
  async ({ query }) => {
    const results = await search.run({ query });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  }
);

// Register summarize tool
mcpServer.registerTool(
  'summarize',
  {
    description: 'Summarize search results',
    inputSchema: {
      query: z.string().describe('Original search query'),
      results: z.array(z.object({
        title: z.string(),
        url: z.string(),
        snippet: z.string()
      })).describe('Search results to summarize')
    },
  },
  async ({ query, results }) => {
    // Generate the prompt
    const prompt = generateSummarizePrompt(query, results);
    
    // For now, return the prompt since we don't have access to sampling in the tool handler
    // The client can use this prompt with their LLM
    return {
      content: [
        {
          type: 'text',
          text: `Please use this prompt with your LLM to generate a summary:\n\n${prompt}`,
        },
      ],
    };
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
  console.error('FreeSearch MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
