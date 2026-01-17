import React from "react";
import { Message, ParsedBotContent, Sender, WidgetType } from "../types";
import { getWidgetSummary, WidgetRenderer } from "./GameWidgets";
import { Bot, Link } from "lucide-react";
import { BotCard } from "./chat/BotCard";
import { UserBubble } from "./chat/UserBubble";
import {
  ContinuationTypingBubble,
  TypingIndicatorBubble,
} from "./chat/TypingIndicators";

interface MessageBubbleProps {
  message: Message;
  onReply: (text: string, elementId: string) => void;
  onTopicClick: (topic: string) => void;
}

const parseBotContent = (
  raw: string,
): { type: keyof ParsedBotContent; content: string }[] => {
  if (!raw.includes("|||")) {
    if (!raw.trim()) return [];
    return [{ type: "explanation", content: raw }];
  }
  const parts = raw.split("|||").map((p) => p.trim()).filter((p) =>
    p.length > 0
  );
  const sections: { type: keyof ParsedBotContent; content: string }[] = [];
  if (parts[0]) sections.push({ type: "intro", content: parts[0] });
  if (parts[1]) sections.push({ type: "explanation", content: parts[1] });
  if (parts[2]) sections.push({ type: "analogy", content: parts[2] });
  if (parts[3]) sections.push({ type: "bonus", content: parts[3] });
  return sections;
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const MessageBubble: React.FC<MessageBubbleProps> = (
  { message, onReply, onTopicClick },
) => {
  const isUser = message.sender === Sender.User;

  const scrollToRelated = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (message.relatedMessageId) {
      const el = document.getElementById(message.relatedMessageId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-4", "ring-bio-300", "dark:ring-bio-700");
        setTimeout(() => {
          el.classList.remove("ring-4", "ring-bio-300", "dark:ring-bio-700");
        }, 1500);
      }
    }
  };

  if (isUser) {
    return (
      <UserBubble
        message={message}
        scrollToRelated={scrollToRelated}
        formatTime={formatTime}
      />
    );
  }

  const sections = parseBotContent(message.content);
  if (message.isStreaming && sections.length === 0) {
    return <TypingIndicatorBubble />;
  }

  const relatedTopicsWidget = message.widgets?.find((w) =>
    w.type === WidgetType.RelatedTopics
  );
  const otherWidgets = message.widgets?.filter((w) =>
    w.type !== WidgetType.RelatedTopics
  );

  return (
    <div
      id={message.id}
      className="flex flex-row-reverse justify-start mb-8 w-full group"
    >
      <div className="shrink-0 mr-3">
        <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-bio-600 dark:text-bio-300 border border-gray-100 dark:border-gray-700 shadow-sm sticky top-20">
          <Bot className="w-6 h-6" />
        </div>
      </div>
      <div className="max-w-[90%] md:max-w-[85%] w-full">
        <div className="space-y-2">
          {sections.map((sec, idx) => {
            const uniqueId = `msg-${message.id}-sec-${idx}`;
            return (
              <BotCard
                key={uniqueId}
                id={uniqueId}
                type={sec.type}
                content={sec.content}
                onReply={() => onReply(sec.content, uniqueId)}
              />
            );
          })}
          {message.isStreaming && <ContinuationTypingBubble />}
          {relatedTopicsWidget && !message.isStreaming && (
            <BotCard
              id={`msg-${message.id}-topics`}
              type="relatedTopics"
              icon={Link}
              onReply={() =>
                onReply(
                  getWidgetSummary(relatedTopicsWidget),
                  `msg-${message.id}-topics`,
                )}
            >
              <WidgetRenderer
                widget={relatedTopicsWidget}
                onTopicClick={onTopicClick}
              />
            </BotCard>
          )}
        </div>
        {otherWidgets && otherWidgets.length > 0 && !message.isStreaming && (
          <div className="space-y-2 mt-2">
            {otherWidgets.map((widget, idx) => {
              const uniqueId = `msg-${message.id}-widget-${idx}`;
              return (
                <BotCard
                  key={uniqueId}
                  id={uniqueId}
                  type="widget"
                  onReply={() => onReply(getWidgetSummary(widget), uniqueId)}
                >
                  <WidgetRenderer widget={widget} onTopicClick={onTopicClick} />
                </BotCard>
              );
            })}
          </div>
        )}
        {!message.isStreaming && (
          <div className="mt-2 flex justify-start">
            <div className="mr-auto text-gray-400 dark:text-gray-500 text-[10px] opacity-50 mt-1 select-none flex justify-end">
              {formatTime(message.timestamp)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
