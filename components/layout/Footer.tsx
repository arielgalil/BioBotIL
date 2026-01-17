import React from "react";
import { Send, X } from "lucide-react";
import { RLM } from "../../config";

interface FooterProps {
    input: string;
    setInput: (val: string) => void;
    isLoading: boolean;
    replyContext: { text: string } | null;
    setReplyContext: (val: null) => void;
    handleSend: () => void;
}

export const Footer: React.FC<FooterProps> = ({
    input,
    setInput,
    isLoading,
    replyContext,
    setReplyContext,
    handleSend,
}) => (
    <footer className="bg-white dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-800 z-20 transition-colors">
        {replyContext && (
            <div className="flex items-center justify-between bg-bio-50 dark:bg-bio-900/20 p-3 px-4 rounded-t-xl text-sm border-l-4 border-bio-500 mb-2 animate-slide-up mx-2 shadow-sm">
                <div className="flex flex-col">
                    <span className="text-xs text-bio-600 dark:text-bio-400 font-bold mb-0.5">
                        משיב ל:
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 truncate font-medium max-w-xs">
                        {replyContext.text}
                    </span>
                </div>
                <button
                    onClick={() => setReplyContext(null)}
                    className="text-gray-400 hover:text-red-500 p-1"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        )}
        <div className="flex gap-2 items-end max-w-4xl mx-auto">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                placeholder="שאל אותי כל דבר על ביולוגיה..."
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-2xl p-4 pr-4 pl-12 resize-none focus:outline-none focus:ring-2 focus:ring-bio-500 focus:bg-white dark:focus:bg-gray-900 transition-all shadow-inner"
                rows={1}
                style={{ minHeight: "3.5rem", maxHeight: "120px" }}
            />
            <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="p-4 rounded-2xl bg-bio-600 hover:bg-bio-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white shadow-lg transition-all active:scale-90 flex items-center justify-center"
            >
                <Send className="w-6 h-6 transform -rotate-90" />
            </button>
        </div>
        <div className="text-center mt-2 text-[10px] text-gray-400">
            {RLM}BIOבוט עשוי לעשות טעויות. בדוק מידע חשוב.
        </div>
    </footer>
);
