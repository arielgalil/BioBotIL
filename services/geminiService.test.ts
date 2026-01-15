import { describe, it, expect, vi, beforeEach } from 'vitest';
import { streamChatResponse } from './geminiService';

// Mock the GoogleGenAI SDK
const sendMessageStreamMock = vi.fn();
const createChatMock = vi.fn().mockReturnValue({
  sendMessageStream: sendMessageStreamMock,
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
    // Default mock for successful stream
    sendMessageStreamMock.mockResolvedValue({
      [Symbol.asyncIterator]: async function* () {
        yield { text: 'Chunk' };
      },
    });
  });

  it('should log the model name when streamChatResponse is called', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const onChunk = vi.fn();
    
    await streamChatResponse('fake-api-key', [], 'Hello', onChunk);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Using model: gemini-2.5-flash-lite-preview-09-2025'));
  });

  it('should stream response chunks', async () => {
    const onChunk = vi.fn();
    const chunks = [{ text: 'Part 1' }, { text: 'Part 2' }];
    
    sendMessageStreamMock.mockResolvedValue({
      [Symbol.asyncIterator]: async function* () {
        for (const chunk of chunks) {
          yield chunk;
        }
      },
    });

    await streamChatResponse('fake-key', [], 'Hello', onChunk);
    
    expect(onChunk).toHaveBeenCalledTimes(2);
    expect(onChunk).toHaveBeenCalledWith('Part 1');
    expect(onChunk).toHaveBeenCalledWith('Part 2');
  });

  it('should retry on 429 error', async () => {
    const onChunk = vi.fn();
    const error429 = { status: 429, message: 'Resource exhausted' };
    
    sendMessageStreamMock
      .mockRejectedValueOnce(error429)
      .mockResolvedValueOnce({
        [Symbol.asyncIterator]: async function* () {
          yield { text: 'Success' };
        },
      });

    await streamChatResponse('fake-key', [], 'Hello', onChunk);
    
    expect(sendMessageStreamMock).toHaveBeenCalledTimes(2);
    expect(onChunk).toHaveBeenCalledWith('Success');
  });
});
