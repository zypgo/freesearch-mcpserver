import { searchInstantAnswer, DDGResponse } from '../src/mcp/resources/duckduckgo';

// Mock fetch is already set up globally in setup.ts

describe('DuckDuckGo API Wrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and parse the DuckDuckGo Instant Answer API response', async () => {
    const mockResponse: Partial<DDGResponse> = {
      Abstract: 'Sample Abstract',
      AbstractText: 'Sample Abstract Text',
      AbstractSource: 'Wikipedia',
      AbstractURL: 'http://example.com',
      Image: '',
      Heading: 'Test Query',
      Answer: '',
      AnswerType: '',
      Definition: '',
      DefinitionSource: '',
      DefinitionURL: '',
      Results: [],
      RelatedTopics: [],
      Type: ''
    };

    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await searchInstantAnswer('test query');
    
    expect(fetch).toHaveBeenCalledWith(
      'https://api.duckduckgo.com/?q=test%20query&format=json&no_html=1&skip_disambig=1'
    );
    expect(result.Abstract).toBe('Sample Abstract');
    expect(result.AbstractURL).toBe('http://example.com');
  });

  it('should handle HTTP errors with retry', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    await expect(searchInstantAnswer('test query')).rejects.toThrow(
      'Failed to fetch DuckDuckGo results after 3 attempts'
    );
    
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('should handle network errors with retry', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockRejectedValue(new Error('Network error'));

    await expect(searchInstantAnswer('test query')).rejects.toThrow(
      'Failed to fetch DuckDuckGo results after 3 attempts: Network error'
    );
    
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('should successfully retry and return results', async () => {
    const mockResponse: Partial<DDGResponse> = {
      Abstract: 'Retry Success',
      AbstractURL: 'http://retry-success.com',
      Results: [],
      RelatedTopics: [],
      Type: 'A'
    };

    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockRejectedValueOnce(new Error('Temporary error'));
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await searchInstantAnswer('retry test');
    
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result.Abstract).toBe('Retry Success');
  });
});
