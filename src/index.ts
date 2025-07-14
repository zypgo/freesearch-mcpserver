/**
 * FreeArch MCP - Main entry point
 */

import { startServer } from './server';

export async function main(): Promise<void> {
  console.log('FreeArch MCP initialized');
  await startServer();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
