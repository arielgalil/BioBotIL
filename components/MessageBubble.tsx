import React from 'react';
import { Sender, Message, ParsedBotContent, WidgetType, WidgetData } from '../types';
import { WidgetRenderer, getWidgetSummary } from './GameWidgets';
import { User, Bot, Reply, Sparkles, BookOpen, Lightbulb, Gift, Link } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  onReply: (text: string, elementId: string) => void;
  onTopicClick: (topic: string) => void;
}

interface BotSection {
  type: keyof ParsedBotContent;
  content: string;
}

const parseBotContent = (raw: string): BotSection[] => {
  if (!raw.includes('|||')) {
      if (!raw.trim()) return [];
      return [{ type: 'explanation', content: raw }];
  }

  const parts = raw.split('|||').map(p => p.trim()).filter(p => p.length > 0);
  
  const sections: BotSection[] = [];
  
  if (parts[0]) sections.push({ type: 'intro', content: parts[0] });
  if (parts[1]) sections.push({ type: 'explanation', content: parts[1] });
  if (parts[2]) sections.push({ type: 'analogy', content: parts[2] });
  if (parts[3]) sections.push({ type: 'bonus', content: parts[3] });
  
  return sections; 
};

// Format time HH:MM
const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Helper to render **bold** text
const RichText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          // Default styling if no className provided
          const style = className || "font-black text-bio-700 dark:text-bio-300";
          return <strong key={i} className={style}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

// --- Shared Styles ---
const CARD_BASE = "relative mb-3 rounded-2xl rounded-tl-none shadow-sm p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md animate-fade-in";
const HEADER_BASE = "flex items-center gap-2 mb-3 text-lg font-black uppercase tracking-wide opacity-90";
const TIMESTAMP_STYLE = "text-[10px] opacity-50 mt-1 select-none flex justify-end";

// Standardized Wrapper Card
const StandardCard: React.FC<{ 
    id?: string;
    children: React.ReactNode, 
    onReply?: () => void 
}> = ({ id, children, onReply }) => {
    return (
        <div id={id} className={CARD_BASE}>
            {children}
            {onReply && (
                <div className="mt-4 flex justify-end">
                    <button 
                        onClick={onReply}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-bio-600 dark:hover:text-bio-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                    >
                        <Reply className="w-4 h-4" />
                        <span>הגב לקטע זה</span>
                    </button>
                </div>
            )}
        </div>
    );
};

const BotCard: React.FC<{ 
  id: string;
  type: keyof ParsedBotContent; 
  content: string; 
  onReply: () => void 
}> = ({ id, type, content, onReply }) => {
  
  const config = {
    intro: { color: 'text-bio-600 dark:text-bio-300', icon: Sparkles, title: 'פתיחה' },
    explanation: { color: 'text-cyan-700 dark:text-cyan-300', icon: BookOpen, title: 'הסבר מדעי' },
    analogy: { color: 'text-purple-700 dark:text-purple-300', icon: Lightbulb, title: 'דומה אבל שונה' },
    bonus: { color: 'text-pink-600 dark:text-pink-300', icon: Gift, title: 'בונוס!' }
  }[type] || { color: 'text-gray-600 dark:text-gray-300', icon: BookOpen, title: 'תשובה' };

  const Icon = config.icon;

  return (
    <StandardCard id={id} onReply={onReply}>
        <div className={`${HEADER_BASE} ${config.color}`}>
            <Icon className="w-6 h-6" />
            <span>{config.title}</span>
        </div>
        <div className="text-base leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-gray-100 font-normal">
            <RichText text={content} />
        </div>
    </StandardCard>
  );
};

const RelatedTopicsCard: React.FC<{ id: string, widget: WidgetData, onTopicClick: (t: string) => void, onReply: () => void }> = ({ id, widget, onTopicClick, onReply }) => {
    return (
        <StandardCard id={id} onReply={onReply}>
            <div className={`${HEADER_BASE} text-gray-500 dark:text-gray-300`}>
                <Link className="w-6 h-6" />
                <span>נושאים קשורים</span>
            </div>
            <WidgetRenderer widget={widget} onTopicClick={onTopicClick} />
        </StandardCard>
    );
};

const WidgetCard: React.FC<{ id: string, widget: WidgetData, onTopicClick: (t: string) => void, onReply: () => void }> = ({ id, widget, onTopicClick, onReply }) => {
    return (
        <StandardCard id={id} onReply={onReply}>
            <WidgetRenderer widget={widget} onTopicClick={onTopicClick} />
        </StandardCard>
    );
}

// Bouncing dots content only
const DotsAnimation = () => (
    <div className="flex items-center gap-1.5 p-3 h-6">
        <div className="w-2 h-2 bg-bio-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-bio-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-bio-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
);

const TypingIndicatorBubble = () => (
  <div className="flex flex-row-reverse justify-start mb-4 w-full animate-fade-in">
     <div className="shrink-0 mr-3">
        <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-bio-600 dark:text-bio-300 border border-gray-100 dark:border-gray-700 shadow-sm">
            <Bot className="w-6 h-6" />
        </div>
      </div>
      <div className="flex items-center gap-1.5 p-4 bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm h-fit self-end">
          <DotsAnimation />
      </div>
  </div>
);

// Minimal continuation bubble without avatar
const ContinuationTypingBubble = () => (
    <div className="flex justify-end w-full animate-fade-in mb-2">
         <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm inline-block">
             <DotsAnimation />
         </div>
    </div>
);

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onReply, onTopicClick }) => {
  const isUser = message.sender === Sender.User;

  const scrollToRelated = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (message.relatedMessageId) {
        const el = document.getElementById(message.relatedMessageId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a temporary highlight effect
            const originalBg = el.style.backgroundColor;
            const originalTransition = el.style.transition;
            
            el.style.transition = 'all 0.5s ease';
            el.classList.add('ring-4', 'ring-bio-300', 'dark:ring-bio-700');
            
            setTimeout(() => {
                el.classList.remove('ring-4', 'ring-bio-300', 'dark:ring-bio-700');
                el.style.transition = originalTransition;
            }, 1500);
        }
    }
  };

  if (isUser) {
    return (
      <div id={message.id} className="flex flex-row justify-start mb-6 animate-slide-in-right group w-full">
        <div className="shrink-0 ml-3 self-start">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 shadow-sm border border-gray-100 dark:border-gray-600">
                <User className="w-6 h-6" />
            </div>
        </div>
        
        <div className="max-w-[80%] flex flex-col items-start pt-1">
             <div className="bg-bio-600 text-white px-5 py-3 rounded-2xl rounded-tr-none shadow-sm text-base leading-relaxed font-medium w-full">
                {message.quotedContent && (
                    <div 
                        onClick={scrollToRelated}
                        className="mb-2 p-3 bg-black/10 rounded-xl border-r-4 border-white/50 text-sm italic text-white/90 cursor-pointer hover:bg-black/20 transition-colors"
                    >
                        <div className="flex items-center gap-1 mb-1 text-[10px] uppercase font-bold opacity-75">
                             <Reply className="w-3 h-3" />
                             <span>בתגובה ל:</span>
                        </div>
                        <div className="line-clamp-2">
                            <RichText text={message.quotedContent} className="font-black text-white" />
                        </div>
                    </div>
                )}
                {message.content}
            </div>
            <div className={`ml-1 text-gray-400 dark:text-gray-500 ${TIMESTAMP_STYLE}`}>
                {formatTime(message.timestamp)}
            </div>
        </div>
      </div>
    );
  }

  const sections = parseBotContent(message.content);

  // Case 1: Initial Loading (No text yet)
  if (message.isStreaming && sections.length === 0) {
      return <TypingIndicatorBubble />;
  }

  const relatedTopicsWidget = message.widgets?.find(w => w.type === WidgetType.RelatedTopics);
  const otherWidgets = message.widgets?.filter(w => w.type !== WidgetType.RelatedTopics);

  return (
    <div id={message.id} className="flex flex-row-reverse justify-start mb-8 w-full group">
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

          {/* Case 2: Continuation Loading (Text exists, but widgets/stream still active) */}
          {message.isStreaming && (
              <ContinuationTypingBubble />
          )}
          
          {relatedTopicsWidget && !message.isStreaming && (
              <RelatedTopicsCard 
                id={`msg-${message.id}-topics`}
                widget={relatedTopicsWidget} 
                onTopicClick={onTopicClick} 
                onReply={() => onReply(getWidgetSummary(relatedTopicsWidget), `msg-${message.id}-topics`)}
              />
          )}
        </div>

        {otherWidgets && otherWidgets.length > 0 && !message.isStreaming && (
            <div className="space-y-2 mt-2">
                {otherWidgets.map((widget, idx) => {
                    const uniqueId = `msg-${message.id}-widget-${idx}`;
                    return (
                        <WidgetCard 
                            key={uniqueId} 
                            id={uniqueId}
                            widget={widget} 
                            onTopicClick={onTopicClick}
                            onReply={() => onReply(getWidgetSummary(widget), uniqueId)}
                        />
                    );
                })}
            </div>
        )}
        
        {!message.isStreaming && (
             <div className="mt-2 flex justify-start">
                 <div className={`mr-auto text-gray-400 dark:text-gray-500 ${TIMESTAMP_STYLE}`}>
                    {formatTime(message.timestamp)}
                </div>
             </div>
        )}
      </div>
    </div>
  );
};
