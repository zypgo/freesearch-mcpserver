#!/bin/bash

echo "Testing FreeArch MCP API with customizable prompts"
echo "=================================================="

# Start the server in background with custom prompt file
echo "Starting server with custom prompt file..."
node dist/index.js --prompt-file ./custom-prompts.yml &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Test search endpoint
echo -e "\n1. Testing search endpoint:"
curl -s -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "TypeScript tutorial"}' | jq .

# Test summarize endpoint with search results
echo -e "\n2. Testing summarize endpoint with custom template:"
curl -s -X POST http://localhost:3000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "query": "TypeScript tutorial",
    "results": [
      {
        "title": "TypeScript Documentation",
        "snippet": "TypeScript is a strongly typed programming language that builds on JavaScript.",
        "url": "https://www.typescriptlang.org/"
      },
      {
        "title": "Getting Started with TypeScript",
        "snippet": "Learn the basics of TypeScript with this comprehensive guide.",
        "url": "https://example.com/typescript-guide"
      }
    ]
  }' | jq .

# Test runtime prompt update
echo -e "\n3. Testing runtime prompt template update:"
echo "Creating alternative prompt file..."
cat > alt-prompts.yml << EOF
summarize: |
  Query: {{query}}
  Results found: {{results.length}}
  
  {{#each results}}
  [{{@index}}] {{this.title}}
  {{/each}}
EOF

curl -s -X POST http://localhost:3000/api/config/prompts \
  -H "Content-Type: application/json" \
  -d '{"promptPath": "./alt-prompts.yml"}' | jq .

# Test summarize with new template
echo -e "\n4. Testing summarize with updated template:"
curl -s -X POST http://localhost:3000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "query": "TypeScript tutorial",
    "results": [
      {
        "title": "TypeScript Documentation",
        "snippet": "TypeScript is a strongly typed programming language that builds on JavaScript.",
        "url": "https://www.typescriptlang.org/"
      },
      {
        "title": "Getting Started with TypeScript",
        "snippet": "Learn the basics of TypeScript with this comprehensive guide.",
        "url": "https://example.com/typescript-guide"
      }
    ]
  }' | jq .

# Clean up
echo -e "\nCleaning up..."
kill $SERVER_PID
rm alt-prompts.yml

echo "Test completed!"
