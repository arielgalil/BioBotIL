import React from "react";
import { BookOpen, Gift, Lightbulb, Reply, Sparkles } from "lucide-react";
import { ParsedBotContent } from "../../types";
import { RichText } from "./RichText";

export const CARD_BASE =
    "relative mb-3 rounded-2xl rounded-tl-none shadow-sm p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md animate-fade-in";
export const HEADER_BASE =
    "flex items-center gap-2 mb-3 text-lg font-black uppercase tracking-wide opacity-90";

const StandardCard: React.FC<
    { id?: string; children: React.ReactNode; onReply?: () => void }
> = ({ id, children, onReply }) => (
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

export const BotCard: React.FC<
    {
        id: string;
        type: keyof ParsedBotContent | "relatedTopics" | "widget";
        icon?: any;
        title?: string;
        color?: string;
        content?: string;
        children?: React.ReactNode;
        onReply: () => void;
    }
> = ({ id, type, icon, title, color, content, children, onReply }) => {
    const config = {
        intro: {
            color: "text-bio-600 dark:text-bio-300",
            icon: Sparkles,
            title: "פתיחה",
        },
        explanation: {
            color: "text-cyan-700 dark:text-cyan-300",
            icon: BookOpen,
            title: "הסבר מדעי",
        },
        analogy: {
            color: "text-purple-700 dark:text-purple-300",
            icon: Lightbulb,
            title: "דומה אבל שונה",
        },
        bonus: {
            color: "text-pink-600 dark:text-pink-300",
            icon: Gift,
            title: "בונוס!",
        },
        relatedTopics: {
            color: "text-gray-500 dark:text-gray-300",
            icon: null,
            title: "נושאים קשורים",
        },
        widget: {
            color: "text-gray-500 dark:text-gray-300",
            icon: null,
            title: "",
        },
    }[type as keyof typeof config] ||
        {
            color: "text-gray-600 dark:text-gray-300",
            icon: BookOpen,
            title: "תשובה",
        };

    const Icon = icon || config.icon;
    const displayTitle = title || config.title;
    const displayColor = color || config.color;

    return (
        <StandardCard id={id} onReply={onReply}>
            {displayTitle && (
                <div className={`${HEADER_BASE} ${displayColor}`}>
                    {Icon && <Icon className="w-6 h-6" />}
                    <span>{displayTitle}</span>
                </div>
            )}
            <div className="text-base leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-gray-100 font-normal">
                {content ? <RichText text={content} /> : children}
            </div>
        </StandardCard>
    );
};
