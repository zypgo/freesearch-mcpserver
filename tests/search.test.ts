import { mapToResults, search } from '../src/mcp/tools/search';
import { searchInstantAnswer } from '../src/mcp/resources/duckduckgo';
import { DDGResponse as DDGResponseType } from '../src/mcp/resources/duckduckgo';

// Mock the duckduckgo module
jest.mock('../src/mcp/resources/duckduckgo');

describe('Search Tool Result Mapping', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('mapToResults function', () => {
    it('should map DuckDuckGo response with all fields to normalized results', () => {
      const mockDDGResponse: DDGResponseType = {
        Abstract: 'Some abstract',
        AbstractText: 'Abstract text',
        AbstractSource: 'Wikipedia',
        AbstractURL: 'http://abstract.com',
        Image: '',
        Heading: 'Test Heading',
        Answer: 'Direct answer',
        AnswerType: 'calc',
        Definition: 'A definition',
        DefinitionSource: 'Dictionary',
        DefinitionURL: 'http://definition.com',
        Results: [
          { Text: 'Result1', FirstURL: 'http://result1.com', Result: 'R1' },
          { Text: 'Result2', FirstURL: 'http://result2.com', Result: 'R2' },
        ],
        RelatedTopics: [
          { Text: 'Topic1', FirstURL: 'http://topic1.com', Result: 'T1' },
          { Text: 'Topic2', FirstURL: 'http://topic2.com', Result: 'T2' },
        ],
        Type: 'A'
      };

      const { results } = mapToResults(mockDDGResponse);
      
      // Should have: 1 answer + 1 abstract + 1 definition + 2 results + 2 topics = 7 total
      expect(results).toHaveLength(7);
      
      // Check answer mapping
      expect(results[0]).toEqual({
        title: 'Test Heading',
        url: 'http://abstract.com',
        snippet: 'Direct answer',
      });
      
      // Check abstract mapping
      expect(results[1]).toEqual({
        title: 'Test Heading',
        url: 'http://abstract.com',
        snippet: 'Some abstract',
      });
      
      // Check definition mapping
      expect(results[2]).toEqual({
        title: 'Definition',
        url: 'http://definition.com',
        snippet: 'A definition',
      });
    });

    it('should handle response with only abstract', () => {
      const mockDDGResponse: Partial<DDGResponseType> = {
        Abstract: 'Only abstract',
        AbstractURL: 'http://abstract-only.com',
        Heading: 'Abstract Only',
        Results: [],
        RelatedTopics: [],
      };

      const { results } = mapToResults(mockDDGResponse as DDGResponseType);
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        title: 'Abstract Only',
        url: 'http://abstract-only.com',
        snippet: 'Only abstract',
      });
    });

    it('should handle response with missing titles', () => {
      const mockDDGResponse: Partial<DDGResponseType> = {
        Answer: 'Answer without heading',
        AnswerType: 'calc',
        AbstractURL: 'http://example.com',
        Abstract: 'Abstract without heading',
        Results: [],
        RelatedTopics: [],
      };

      const { results } = mapToResults(mockDDGResponse as DDGResponseType);
      expect(results).toHaveLength(2);
      expect(results[0]?.title).toBe('Instant Answer');
      expect(results[1]?.title).toBe('Summary');
    });

    it('should handle empty response', () => {
      const mockDDGResponse: Partial<DDGResponseType> = {
        Results: [],
        RelatedTopics: [],
      };

      const { results } = mapToResults(mockDDGResponse as DDGResponseType);
      expect(results).toHaveLength(0);
    });

    it('should use Result field as fallback for snippet', () => {
      const mockDDGResponse: Partial<DDGResponseType> = {
        Results: [
          { Text: 'Result with Result field', FirstURL: 'http://example.com', Result: 'Fallback snippet' },
        ],
        RelatedTopics: [
          { Text: 'Topic without Result field', FirstURL: 'http://topic.com' } as any,
        ],
      };

      const { results } = mapToResults(mockDDGResponse as DDGResponseType);
      expect(results).toHaveLength(2);
      expect(results[0]?.snippet).toBe('Fallback snippet');
      expect(results[1]?.snippet).toBe('Topic without Result field'); // Falls back to Text
    });
  });

  describe('search tool integration', () => {
    it('should call searchInstantAnswer and map results', async () => {
      const mockDDGResponse: DDGResponseType = {
        Abstract: 'Test abstract',
        AbstractText: '',
        AbstractSource: '',
        AbstractURL: 'http://test.com',
        Image: '',
        Heading: 'Test',
        Answer: '',
        AnswerType: '',
        Definition: '',
        DefinitionSource: '',
        DefinitionURL: '',
        Results: [],
        RelatedTopics: [],
        Type: 'A'
      };

      (searchInstantAnswer as jest.MockedFunction<typeof searchInstantAnswer>)
        .mockResolvedValueOnce(mockDDGResponse);

      const result = await search.run({ query: 'test query' });
      
      expect(searchInstantAnswer).toHaveBeenCalledWith('test query');
      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toEqual({
        title: 'Test',
        url: 'http://test.com',
        snippet: 'Test abstract',
      });
    });

    it('should handle search errors', async () => {
      (searchInstantAnswer as jest.MockedFunction<typeof searchInstantAnswer>)
        .mockRejectedValueOnce(new Error('API Error'));

      await expect(search.run({ query: 'error query' })).rejects.toThrow('API Error');
    });
  });
});
