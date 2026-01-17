import React from "react";
import { Reply, User } from "lucide-react";
import { Message } from "../../types";
import { RichText } from "./RichText";

export const UserBubble: React.FC<
    {
        message: Message;
        scrollToRelated: (e: React.MouseEvent) => void;
        formatTime: (ts: number) => string;
    }
> = ({ message, scrollToRelated, formatTime }) => (
    <div
        id={message.id}
        className="flex flex-row justify-start mb-6 animate-slide-in-right group w-full"
    >
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
                            <RichText
                                text={message.quotedContent}
                                className="font-black text-white"
                            />
                        </div>
                    </div>
                )}
                {message.content}
            </div>
            <div className="ml-1 text-gray-400 dark:text-gray-500 text-[10px] opacity-50 mt-1 select-none flex justify-end">
                {formatTime(message.timestamp)}
            </div>
        </div>
    </div>
);
