import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import jsonrpc from 'jsonrpc-lite';
import dotenv from 'dotenv';

const { McpServer } = require('@modelcontextprotocol/sdk');

// Load environment variables
dotenv.config();
import { search } from './mcp/tools/search';
import { setCustomPromptPath, generateSummarizePrompt } from './mcp/prompts/summarizePrompt';
import { Command } from 'commander';
import { z } from 'zod';

// Command line argument parsing
const program = new Command();
program
  .option('-p, --port [4m[21mport[24m', 'port to run the server on', '3000')
  .option('--prompt-file <path>', 'path to custom prompts YAML file')
  .parse(process.argv);

const options = program.opts();

// Set custom prompt path if provided
if (options['promptFile']) {
  setCustomPromptPath(options['promptFile']);
}

// Create and configure MCP server
const server = new McpServer({ name: 'FreeSearch', version: '1.0.0' });

// Define schemas for the tools
const summarizeSchema = {
  query: z.string(),
  results: z.array(z.object({
    title: z.string(),
    url: z.string(),
    snippet: z.string()
  }))
};

const searchSchema = {
  query: z.string()
};

// Register summarize tool that uses client's LLM via sampling
server.registerTool(
  'summarize',
  {
    title: 'Summarize Search Results',
    description: 'Summarize search results using a customizable prompt template',
    inputSchema: summarizeSchema
  },
  async (args: any, context: any) => {
    const { query, results } = args as { query: string; results: Array<{ title: string; url: string; snippet: string }> };
    
    // Check if sampling is available
    const sampling = (context as any).sampling;
    if (!sampling) {
      // Fallback if no sampling available
      const prompt = generateSummarizePrompt(query, results);
      return {
        content: [{
          type: 'text',
          text: `Generated prompt for summarization:\n\n${prompt}`
        }]
      };
    }
    
    // Generate the prompt
    const prompt = generateSummarizePrompt(query, results);
    
    // Use MCP sampling to get LLM completion from the client
    const response = await sampling.createMessage({
      messages: [{
        role: 'user',
        content: { type: 'text', text: prompt }
      }],
      maxTokens: 500
    });
    
    // Extract the summary from the response
    const summary = response.content.find((c: any) => c.type === 'text')?.text || 'Could not generate summary';
    
    return {
      content: [{
        type: 'text',
        text: summary
      }]
    };
  }
);

// Also register search tool
server.registerTool(
  'search',
  {
    title: 'Web Search',
    description: 'Free web search via DuckDuckGo',
    inputSchema: searchSchema
  },
  async (args: any) => {
    const { query } = args as { query: string };
    const results = await search.run({ query });
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(results, null, 2)
      }]
    };
  }
);

export async function startServer(): Promise<void> {
  const app = express();
  const port = process.env['PORT'] || options['port'];

  // Middleware
  app.use(bodyParser.json());

  // Health check route
app.get('/ping', (_req: Request, res: Response) => {
    res.status(200).send('PONG');
  });

  // JSON-RPC 2.0 POST handler
  app.post('/rpc', async (req: Request, res: Response) => {
    try {
      const { body } = req;
      
      // Parse the JSON-RPC request
      const rpcRequest = jsonrpc.parseObject(body);
      
      if (rpcRequest.type === 'request' && rpcRequest.payload) {
        const { method, params, id } = rpcRequest.payload;
        
        // Handle the request through MCP server
        try {
          const result = await server.handle({
            method,
            params: params || {},
            id
          });
          
          // Create JSON-RPC success response
          const response = jsonrpc.success(id, result);
          res.json(response);
        } catch (error: any) {
          // Create JSON-RPC error response
          const errorResponse = jsonrpc.error(id, new jsonrpc.JsonRpcError(
            error.message || 'Internal error',
            -32603,
            error
          ));
          res.json(errorResponse);
        }
      } else if (rpcRequest.type === 'notification' && rpcRequest.payload) {
        // Handle notification (no response expected)
        const { method, params } = rpcRequest.payload;
        await server.handle({
          method,
          params: params || {}
        });
        res.status(204).send();
      } else {
        // Invalid request
        const errorResponse = jsonrpc.error(
          body.id || null,
          new jsonrpc.JsonRpcError('Invalid Request', -32600)
        );
        res.status(400).json(errorResponse);
      }
    } catch (error: any) {
      // Parse error
      const errorResponse = jsonrpc.error(
        null,
        new jsonrpc.JsonRpcError('Parse error', -32700)
      );
      res.status(400).json(errorResponse);
    }
  });

  // Start server
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  console.log('FreeSearch MCP server started');
  if (options['promptFile']) {
    console.log(`Using custom prompt file: ${options['promptFile']}`);
  }
}
