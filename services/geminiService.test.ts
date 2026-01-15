import { describe, it, expect, vi, beforeEach } from 'vitest';
import { streamChatResponse, generateWidgets } from './geminiService';
import { WidgetType } from '../types';

// Mock the GoogleGenAI SDK
const sendMessageStreamMock = vi.fn();
const generateContentMock = vi.fn();
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
        models: {
          generateContent: generateContentMock,
        }
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
    vi.restoreAllMocks();

    // Default mock for successful stream
    sendMessageStreamMock.mockResolvedValue({
      [Symbol.asyncIterator]: async function* () {
        yield { text: 'Chunk' };
      },
    });

    // Default mock for generateContent
    generateContentMock.mockResolvedValue({
      text: JSON.stringify({
        relatedTopics: ['Topic 1'],
        knowledgeQuestion: {
          question: 'Q',
          isTrue: true,
          explanation: 'E'
        },
        applicationTask: {
          title: 'T',
          steps: ['S1', 'S2', 'S3', 'S4', 'S5']
        }
      })
    });
  });

  describe('streamChatResponse', () => {
    it('should log the model name', async () => {
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
      
        it('should throw clear error on 404 Model Not Found', async () => {
          const onChunk = vi.fn();
          const error404 = { status: 404, message: 'Model not found' };
          sendMessageStreamMock.mockRejectedValue(error404);
      
          await expect(streamChatResponse('fake-key', [], 'Hello', onChunk))
            .rejects.toThrow('Model not found (404)');
        });
      });
        describe('generateWidgets', () => {
    it('should call generateContent with correct model and schema', async () => {
      await generateWidgets('fake-key', 'Photosynthesis');
      
      expect(generateContentMock).toHaveBeenCalledWith(expect.objectContaining({
        model: 'gemini-2.5-flash-lite-preview-09-2025',
        config: expect.objectContaining({
          responseMimeType: 'application/json',
          responseSchema: expect.any(Object)
        })
      }));
    });

    it('should parse True/False and Cloze correctly', async () => {
      // Force True/False and Cloze by mocking Math.random
      vi.spyOn(Math, 'random').mockReturnValue(0.9); // > 0.5 for both

      generateContentMock.mockResolvedValue({
        text: JSON.stringify({
          relatedTopics: ['Topic 1'],
          knowledgeQuestion: {
            question: 'Q',
            isTrue: true,
            explanation: 'E'
          },
          applicationTask: {
            sentenceParts: ['S1', 'S2'],
            hiddenWords: ['W1'],
            distractors: ['D1', 'D2']
          }
        })
      });

      const widgets = await generateWidgets('fake-key', 'Biology');
      
      expect(widgets).toHaveLength(3);
      expect(widgets[0].type).toBe(WidgetType.RelatedTopics);
      expect(widgets[1].type).toBe(WidgetType.TrueFalse);
      expect(widgets[2].type).toBe(WidgetType.Cloze);
    });

    it('should parse Multiple Choice and Causal Chain correctly', async () => {
      // Force Multiple Choice and Causal Chain by mocking Math.random
      vi.spyOn(Math, 'random').mockReturnValue(0.1); // < 0.5 for both

      generateContentMock.mockResolvedValue({
        text: JSON.stringify({
          relatedTopics: ['Topic 1'],
          knowledgeQuestion: {
            question: 'Q',
            options: ['A', 'B'],
            correctIndex: 0,
            explanation: 'E'
          },
          applicationTask: {
            title: 'T',
            steps: ['S1', 'S2', 'S3', 'S4', 'S5']
          }
        })
      });

      const widgets = await generateWidgets('fake-key', 'Biology');
      
      expect(widgets).toHaveLength(3);
      expect(widgets[0].type).toBe(WidgetType.RelatedTopics);
      expect(widgets[1].type).toBe(WidgetType.MultipleChoice);
      expect(widgets[2].type).toBe(WidgetType.CausalChain);
    });

    it('should handle API errors by returning empty array', async () => {
      generateContentMock.mockRejectedValue(new Error('API Error'));
      const widgets = await generateWidgets('fake-key', 'Biology');
      expect(widgets).toEqual([]);
    });

    it('should be consistent across multiple calls with different topics', async () => {
      const topics = ['Photosynthesis', 'Mitosis', 'Digestion'];
      for (const topic of topics) {
        const widgets = await generateWidgets('fake-key', topic);
        expect(widgets).toHaveLength(3);
        expect(widgets[0].type).toBe(WidgetType.RelatedTopics);
      }
    });
  });
});