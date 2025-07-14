# Prompt Customization

FreeArch MCP supports customizable prompt templates for the summarization feature.

## Default Template

The default summarize prompt template is stored in `src/config/prompts.yml`:

```yaml
summarize: |
  Summarize the following search results for "{{query}}" in bullet points:
  {{#each results}}
  - {{this.title}}: {{this.snippet}}
  {{/each}}
```

## Template Syntax

Templates use [Handlebars](https://handlebarsjs.com/) syntax. Available variables:

- `{{query}}` - The search query string
- `{{results}}` - Array of search results
  - `{{title}}` - Result title
  - `{{snippet}}` - Result snippet/description
  - `{{url}}` - Result URL

## Customizing Templates

### Method 1: CLI Flag

Start the server with a custom prompts file:

```bash
npm run dev -- --prompt-file ./my-custom-prompts.yml
```

### Method 2: Runtime API

Update the prompt file at runtime via the API:

```bash
curl -X POST http://localhost:3000/api/config/prompts \
  -H "Content-Type: application/json" \
  -d '{"promptPath": "./my-custom-prompts.yml"}'
```

## Custom Template Example

Create a custom prompts file (e.g., `custom-prompts.yml`):

```yaml
summarize: |
  ## Search Results for "{{query}}"
  
  {{#each results}}
  ### {{@index}}. {{this.title}}
  {{this.snippet}}
  
  URL: {{this.url}}
  {{/each}}
  
  ---
  *Total results: {{results.length}}*
```

## Testing

Run the test script to see both default and custom templates in action:

```bash
npx ts-node test-prompts.ts
```
