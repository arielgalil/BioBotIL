import { describe, it, expect, vi, beforeEach } from 'vitest';
import { streamChatResponse } from './geminiService';

// Mock the GoogleGenAI SDK
const createChatMock = vi.fn().mockReturnValue({
  sendMessageStream: vi.fn().mockResolvedValue([]),
});

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(function() {
      return {
        chats: {
          create: createChatMock,
        },
      };
    }),
    Type: {
      OBJECT: 'OBJECT',
      ARRAY: 'ARRAY',
      STRING: 'STRING',
      BOOLEAN: 'BOOLEAN',
      INTEGER: 'INTEGER',
    },
  };
});

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should log the model name when streamChatResponse is called', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const onChunk = vi.fn();
    
    await streamChatResponse('fake-api-key', [], 'Hello', onChunk);

    // This expectation is expected to fail initially (Red Phase)
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Using model: gemini-2.5-flash-lite-preview-09-2025'));
  });
});
