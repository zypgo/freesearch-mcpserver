# FreeArch MCP

A TypeScript project with strict type checking, ESLint, and Prettier configured.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev    # Watch mode
npm run build  # Build project
```

## Code Quality

```bash
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
npm run format      # Format with Prettier
npm run format:check # Check formatting
npm run type-check  # Type check without building
```

## Project Structure

```
freearch-mcp/
├── src/           # Source files
├── dist/          # Compiled output
├── package.json   # Project configuration
├── tsconfig.json  # TypeScript configuration
├── .eslintrc.json # ESLint configuration
└── .prettierrc.json # Prettier configuration
```
