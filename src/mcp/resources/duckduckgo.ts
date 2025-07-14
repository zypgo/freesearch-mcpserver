// DuckDuckGo Instant Answer API response types
export interface DDGResponse {
  Abstract: string;
  AbstractText: string;
  AbstractSource: string;
  AbstractURL: string;
  Image: string;
  Heading: string;
  Answer: string;
  AnswerType: string;
  Definition: string;
  DefinitionSource: string;
  DefinitionURL: string;
  RelatedTopics: Array<{
    Result?: string;
    FirstURL?: string;
    Icon?: {
      URL: string;
      Height: number | string;
      Width: number | string;
    };
    Text?: string;
    // For grouped topics
    Name?: string;
    Topics?: Array<{
      Result: string;
      FirstURL: string;
      Icon?: {
        URL: string;
        Height: number | string;
        Width: number | string;
      };
      Text: string;
    }>;
  }>;
  Results: Array<{
    Result: string;
    FirstURL: string;
    Icon?: {
      URL: string;
      Height: number;
      Width: number;
    };
    Text: string;
  }>;
  Type: string;
}

// Configuration for retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Helper function to delay execution
const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

// Main function to search DuckDuckGo Instant Answer API
export async function searchInstantAnswer(query: string): Promise<DDGResponse> {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data as DDGResponse;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If this isn't the last attempt, wait before retrying
      if (attempt < MAX_RETRIES - 1) {
        await delay(RETRY_DELAY_MS * (attempt + 1)); // Exponential backoff
      }
    }
  }
  
  // If we've exhausted all retries, throw the last error
  throw new Error(`Failed to fetch DuckDuckGo results after ${MAX_RETRIES} attempts: ${lastError?.message}`);
}
