import React from "react";
import { Bot } from "lucide-react";

const DotsAnimation = () => (
    <div className="flex items-center gap-1.5 p-3 h-6">
        <div
            className="w-2 h-2 bg-bio-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
        >
        </div>
        <div
            className="w-2 h-2 bg-bio-500 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
        >
        </div>
        <div
            className="w-2 h-2 bg-bio-600 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
        >
        </div>
    </div>
);

export const TypingIndicatorBubble = () => (
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

export const ContinuationTypingBubble = () => (
    <div className="flex justify-end w-full animate-fade-in mb-2">
        <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm inline-block">
            <DotsAnimation />
        </div>
    </div>
);
