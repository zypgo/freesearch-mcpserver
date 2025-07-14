/**
 * FreeArch MCP - Main entry point
 */

export function main(): void {
  console.log('FreeArch MCP initialized');
}

// Run if called directly
if (require.main === module) {
  main();
}
