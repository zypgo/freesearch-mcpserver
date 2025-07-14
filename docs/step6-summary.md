# Step 6 Implementation Summary: Customizable Summarize Prompt Template

## Overview
Implemented a flexible prompt template system for the summarize feature using YAML configuration and Handlebars templating.

## Key Components

### 1. Default Template Configuration
- **File**: `src/config/prompts.yml`
- Contains the default summarize prompt template using Handlebars syntax
- Template variables: `{{query}}`, `{{results}}` with properties `title`, `snippet`, `url`

### 2. Prompt Manager Module
- **File**: `src/mcp/prompts/promptManager.ts`
- Singleton class that:
  - Loads prompts from YAML files
  - Compiles Handlebars templates
  - Supports merging custom prompts with defaults
  - Provides template rendering functionality

### 3. Summarize Prompt Interface
- **File**: `src/mcp/prompts/summarizePrompt.ts`
- Exports functions:
  - `generateSummarizePrompt()`: Renders the summarize template with data
  - `setCustomPromptPath()`: Updates the custom prompt file path

### 4. Summarize Tool
- **File**: `src/mcp/tools/summarize.ts`
- Implements the summarize tool using the customizable prompt template
- Accepts query and results array, returns formatted summary

### 5. Server Implementation
- **File**: `src/server.ts`
- Features:
  - CLI flag `--prompt-file <path>` to specify custom prompts on startup
  - POST `/api/config/prompts` endpoint to update prompt file at runtime
  - POST `/api/summarize` endpoint that uses the current template

## Usage Examples

### CLI Usage
```bash
# Start with default prompts
npm run dev

# Start with custom prompts
npm run dev -- --prompt-file ./custom-prompts.yml
```

### API Usage
```bash
# Update prompt file at runtime
curl -X POST http://localhost:3000/api/config/prompts \
  -H "Content-Type: application/json" \
  -d '{"promptPath": "./my-prompts.yml"}'

# Summarize using current template
curl -X POST http://localhost:3000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "query": "search query",
    "results": [{"title": "...", "snippet": "...", "url": "..."}]
  }'
```

## Dependencies Added
- `js-yaml`: YAML parsing
- `handlebars`: Template engine
- `commander`: CLI argument parsing
- Associated TypeScript type definitions

## Build Configuration
- Added `postbuild` script to copy config files to dist directory
- Ensures prompts.yml is available in the built output

## Testing
- `test-prompts.ts`: Tests template rendering with default and custom templates
- `test-api.sh`: End-to-end API test demonstrating all features

This implementation provides a flexible, runtime-configurable prompt system that can be easily extended to support additional prompt templates in the future.
