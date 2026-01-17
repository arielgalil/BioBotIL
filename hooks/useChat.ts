import { useState, useRef, useEffect, useCallback } from 'react';
import { Message, Sender, WidgetData } from '../types';
import { streamChatResponse, generateWidgets } from '../services/geminiService';
import { trackMessageSent, trackMessageReceived } from '../services/trackingService';
import { API_KEY, STORAGE_KEYS } from '../config';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [replyContext, setReplyContext] = useState<{ id: string, text: string } | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  const handleClearChat = useCallback((confirmClear: boolean) => {
    if (confirmClear) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    }
  }, []);

  const handleSend = useCallback(async (text: string = input) => {
    const trimmedText = text.trim();
    if (!trimmedText || isLoading) return;
    if (!API_KEY) {
      alert("Please provide a Gemini API Key in the config or environment.");
      return;
    }

    const currentContext = replyContext;
    const isContextReply = !!currentContext;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: Sender.User,
      content: trimmedText,
      quotedContent: currentContext?.text || undefined,
      relatedMessageId: currentContext?.id || undefined,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setReplyContext(null);
    setIsLoading(true);

    trackMessageSent();

    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: botMsgId,
      sender: Sender.Bot,
      content: '',
      isStreaming: true,
      timestamp: Date.now()
    }]);

    const promptToSend = currentContext ? `[בהקשר ל: ${currentContext.text}] ${trimmedText}` : trimmedText;

    try {
      let accumulatedText = "";
      const history = messages.slice(-12).map(m => ({
        role: m.sender === Sender.User ? 'user' : 'model',
        parts: [{ text: m.quotedContent ? `[בהקשר ל: ${m.quotedContent}] ${m.content}` : m.content }]
      }));

      let widgetPromise: Promise<WidgetData[]> = Promise.resolve([]);
      if (!isContextReply) {
        widgetPromise = new Promise((resolve) => {
          setTimeout(() => {
            generateWidgets(API_KEY, promptToSend).then(resolve);
          }, 2000);
        });
      }

      await streamChatResponse(
        API_KEY,
        history,
        promptToSend,
        (chunk) => {
          accumulatedText += chunk;
          setMessages(prev => prev.map(msg =>
            msg.id === botMsgId ? { ...msg, content: accumulatedText } : msg
          ));
        },
        isContextReply
      );

      setMessages(prev => prev.map(msg =>
        msg.id === botMsgId ? { ...msg, isStreaming: false } : msg
      ));

      trackMessageReceived();

      if (!isContextReply) {
        widgetPromise.then(widgets => {
          if (widgets && widgets.length > 0) {
            setMessages(prev => prev.map(msg =>
              msg.id === botMsgId ? { ...msg, widgets } : msg
            ));
          }
        }).catch(err => {
          console.warn("Background widget generation failed:", err);
        });
      }

    } catch (error: any) {
      const isRateLimit = error?.status === 429 || error?.code === 429 || error?.message?.includes('429');
      const isBudgetExceeded = error?.message?.includes('BUDGET_EXCEEDED');

      let userMessage = "\n\n(אירעה שגיאה בתקשורת. אנא נסה שוב)";
      if (isBudgetExceeded) {
        userMessage = "\n\n---\n🛑 **מגבלת תקציב**\nמצטערים, המערכת הגיעה למגבלת התקציב היומית שלה.";
      } else if (isRateLimit) {
        userMessage = "\n\n---\n🛑 **הגענו למגבלת השימוש**\nאנא המתינו דקה או שתיים ונסו שוב.";
      }

      setMessages(prev => prev.map(msg =>
        msg.id === botMsgId ? { ...msg, content: msg.content + userMessage, isStreaming: false } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, replyContext]);

  return {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    replyContext,
    setReplyContext,
    handleSend,
    handleClearChat
  };
};
