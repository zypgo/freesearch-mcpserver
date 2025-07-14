import { generateSummarizePrompt, setCustomPromptPath } from '../src/mcp/prompts/summarizePrompt';
import { promptManager } from '../src/mcp/prompts/promptManager';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Summarize Tool Template Rendering', () => {
  beforeEach(() => {
    // Reset to default prompts before each test
    promptManager.reloadPrompts();
  });

  it('should render the summarize prompt correctly with single result', () => {
    const query = 'Test query';
    const results = [{ title: 'Result1', snippet: 'Snippet1' }];
    const prompt = generateSummarizePrompt(query, results);

    expect(prompt).toContain('Test query');
    expect(prompt).toContain('Result1');
    expect(prompt).toContain('Snippet1');
    expect(prompt).toMatch(/Summarize the following search results/);
  });

  it('should render the summarize prompt correctly with multiple results', () => {
    const query = 'JavaScript frameworks';
    const results = [
      { title: 'React', snippet: 'A JavaScript library for building user interfaces' },
      { title: 'Vue.js', snippet: 'Progressive JavaScript framework' },
      { title: 'Angular', snippet: 'Platform for building mobile and desktop web applications' }
    ];
    const prompt = generateSummarizePrompt(query, results);

    expect(prompt).toContain('JavaScript frameworks');
    expect(prompt).toContain('React');
    expect(prompt).toContain('Vue.js');
    expect(prompt).toContain('Angular');
    expect(prompt).toContain('A JavaScript library for building user interfaces');
    expect(prompt).toContain('Progressive JavaScript framework');
    expect(prompt).toContain('Platform for building mobile and desktop web applications');
  });

  it('should handle empty results array', () => {
    const query = 'No results query';
    const results: Array<{ title: string; snippet: string }> = [];
    const prompt = generateSummarizePrompt(query, results);

    expect(prompt).toContain('No results query');
    expect(prompt).toMatch(/Summarize the following search results/);
  });

  it('should handle special characters in query', () => {
    const query = 'Test & query <with> "special" characters';
    const results = [{ title: 'Result', snippet: 'Test snippet' }];
    const prompt = generateSummarizePrompt(query, results);

    // Handlebars escapes HTML entities by default
    expect(prompt).toContain('Test &amp; query &lt;with&gt; &quot;special&quot; characters');
    expect(prompt).toContain('Result');
    expect(prompt).toContain('Test snippet');
  });

  it('should use custom prompt template when provided', () => {
    // Create a temporary custom prompt file
    const tmpDir = os.tmpdir();
    const customPromptPath = path.join(tmpDir, 'test-custom-prompts.yml');
    const customContent = `summarize: |\n  Custom template for "{{query}}":\n  {{#each results}}\n  * {{this.title}}\n  {{/each}}\n`;
    
    fs.writeFileSync(customPromptPath, customContent);
    
    try {
      // Set custom prompt path
      setCustomPromptPath(customPromptPath);
      
      const query = 'Custom test';
      const results = [{ title: 'Result1', snippet: 'Snippet1' }];
      const prompt = generateSummarizePrompt(query, results);
      
      expect(prompt).toContain('Custom template for "Custom test"');
      expect(prompt).toContain('* Result1');
      expect(prompt).not.toContain('Snippet1'); // Custom template doesn't include snippets
    } finally {
      // Clean up
      fs.unlinkSync(customPromptPath);
      promptManager.reloadPrompts(); // Reset to defaults
    }
  });
});
