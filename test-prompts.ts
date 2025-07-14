import { generateSummarizePrompt, setCustomPromptPath } from './dist/mcp/prompts/summarizePrompt.js';

// Test data
const testResults = [
  {
    title: 'TypeScript Documentation',
    snippet: 'TypeScript is a strongly typed programming language that builds on JavaScript.',
    url: 'https://www.typescriptlang.org/'
  },
  {
    title: 'Getting Started with TypeScript',
    snippet: 'Learn the basics of TypeScript with this comprehensive guide.',
    url: 'https://example.com/typescript-guide'
  }
];

const query = 'TypeScript tutorial';

console.log('=== Default Template ===');
console.log(generateSummarizePrompt(query, testResults));

console.log('\n=== Custom Template ===');
setCustomPromptPath('./custom-prompts.yml');
console.log(generateSummarizePrompt(query, testResults));
