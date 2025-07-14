// MCP Context types
export interface MCPContext {
  llm: {
    complete: (prompt: string) => Promise<string>;
  };
}

// Tool definition type
export interface ToolDefinition<TInput, TOutput> {
  name: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
  run: (input: TInput, ctx: MCPContext) => Promise<TOutput>;
}
