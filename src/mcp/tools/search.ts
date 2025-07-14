import { z } from 'zod';
import { searchInstantAnswer, DDGResponse } from '../resources/duckduckgo';

// Schema for individual search results
const ResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  snippet: z.string()
});

// Type for the result
type SearchResult = z.infer<typeof ResultSchema>;

// Map DuckDuckGo response to normalized results
export function mapToResults(data: DDGResponse): { results: SearchResult[] } {
  const results: SearchResult[] = [];
  
  // Map Answer if available
  if (data.Answer && data.AnswerType) {
    results.push({
      title: data.Heading || 'Instant Answer',
      url: data.AbstractURL || '',
      snippet: data.Answer
    });
  }
  
  // Map Abstract if available
  if (data.Abstract && data.AbstractURL) {
    results.push({
      title: data.Heading || 'Summary',
      url: data.AbstractURL,
      snippet: data.Abstract
    });
  }
  
  // Map Definition if available
  if (data.Definition && data.DefinitionURL) {
    results.push({
      title: 'Definition',
      url: data.DefinitionURL,
      snippet: data.Definition
    });
  }
  
  // Map Results array
  if (data.Results && data.Results.length > 0) {
    for (const result of data.Results) {
      if (result.Text && result.FirstURL) {
        results.push({
          title: result.Text,
          url: result.FirstURL,
          snippet: result.Result || result.Text
        });
      }
    }
  }
  
  // Map RelatedTopics
  if (data.RelatedTopics && data.RelatedTopics.length > 0) {
    for (const topic of data.RelatedTopics) {
      // Handle direct topics
      if (topic.Text && topic.FirstURL) {
        // Clean up the snippet by removing HTML tags if present
        const cleanSnippet = (topic.Result || topic.Text).replace(/<[^>]*>/g, '');
        results.push({
          title: topic.Text,
          url: topic.FirstURL,
          snippet: cleanSnippet
        });
      }
      
      // Handle grouped topics (e.g., "Places", "Film and television", etc.)
      if (topic.Name && topic.Topics && topic.Topics.length > 0) {
        for (const subTopic of topic.Topics) {
          if (subTopic.Text && subTopic.FirstURL) {
            // Clean up the snippet by removing HTML tags if present
            const cleanSnippet = (subTopic.Result || subTopic.Text).replace(/<[^>]*>/g, '');
            results.push({
              title: `${topic.Name}: ${subTopic.Text}`,
              url: subTopic.FirstURL,
              snippet: cleanSnippet
            });
          }
        }
      }
    }
  }
  
  return { results };
}

// Define a helper function that mimics the defineTool pattern
function defineTool<TInput, TOutput>(config: {
  name: string;
  description: string;
  inputSchema: z.ZodSchema<TInput>;
  outputSchema: z.ZodSchema<TOutput>;
  run: (input: TInput) => Promise<TOutput>;
}) {
  return config;
}

// Define the search tool using the defineTool pattern
export const search = defineTool({
  name: 'search',
  description: 'Free web search via DuckDuckGo',
  inputSchema: z.object({ query: z.string() }),
  outputSchema: z.object({ results: z.array(ResultSchema) }),
  run: async ({ query }) => {
    const data = await searchInstantAnswer(query);
    return mapToResults(data);
  }
});
