import React from "react";
import { Check, CheckCircle, RotateCcw, XCircle } from "lucide-react";

export const HEADER_STYLE =
    "flex items-center gap-2 mb-3 text-lg font-black uppercase tracking-wide text-bio-600 dark:text-bio-400 opacity-90";

export const OPTION_BTN_BASE =
    "w-full p-3.5 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-bio-300 dark:hover:border-bio-600 hover:bg-bio-50 dark:hover:bg-gray-700 hover:shadow-md transition-all font-medium text-gray-700 dark:text-gray-200 text-base shadow-sm relative";
export const OPTION_BTN_SELECTED =
    "w-full p-3.5 rounded-xl border-2 border-bio-500 bg-bio-100 dark:bg-bio-900/40 text-bio-900 dark:text-bio-100 font-bold shadow-md transition-all text-base relative";
export const OPTION_BTN_ERROR =
    "w-full p-3.5 rounded-xl border-2 border-red-500 bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-100 font-bold shadow-md transition-all text-base relative";

export const CheckButton: React.FC<
    { onClick: () => void; disabled?: boolean; text?: string }
> = ({ onClick, disabled, text = "בדוק תשובה" }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="w-full py-3 bg-bio-600 hover:bg-bio-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 text-base animate-slide-up"
    >
        <Check className="w-5 h-5" />
        {text}
    </button>
);

export const FeedbackBanner: React.FC<{
    isCorrect: boolean;
    message?: string;
    onRetry?: () => void;
    explanation?: string;
}> = ({ isCorrect, message, onRetry, explanation }) => {
    return (
        <div
            className={`mt-4 p-4 rounded-xl text-center border-2 shadow-sm animate-slide-up ${
                isCorrect
                    ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-100"
                    : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-100"
            }`}
        >
            <div className="flex items-center justify-center gap-2 mb-2">
                {isCorrect
                    ? (
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    )
                    : (
                        <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    )}
                <p className="font-black text-xl">
                    {message || (isCorrect
                        ? "כל הכבוד! תשובה נכונה."
                        : "לא מדויק. נסה שוב.")}
                </p>
            </div>
            {explanation && (
                <div className="text-sm opacity-90 leading-relaxed mb-2 px-2">
                    {explanation}
                </div>
            )}
            {!isCorrect && onRetry && (
                <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-white dark:bg-gray-800 rounded-full font-bold shadow-sm text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mt-2 border border-red-100 dark:border-red-800"
                >
                    <RotateCcw className="w-4 h-4" /> נסה שוב
                </button>
            )}
        </div>
    );
};
