import React, { useState } from "react";
import { Check, HelpCircle, X } from "lucide-react";
import { TrueFalseData } from "../../types";
import {
    CheckButton,
    FeedbackBanner,
    HEADER_STYLE,
} from "./SharedWidgetComponents";

const TrueFalseWidget: React.FC<{ data: TrueFalseData }> = ({ data }) => {
    const [selected, setSelected] = useState<boolean | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const getCardClass = (type: "true" | "false") => {
        const isThisType = type === "true";
        const isThisSelected = selected === isThisType;
        let base =
            "flex-1 p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-200 shadow-sm hover:shadow-lg active:scale-95 cursor-pointer min-h-[140px]";

        if (!isSubmitted) {
            if (isThisSelected) {
                return `${base} bg-bio-100 dark:bg-bio-900/40 border-bio-500 text-bio-900 dark:text-bio-100 shadow-inner`;
            }
            return `${base} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-bio-400 dark:hover:border-bio-500 text-gray-600 dark:text-gray-300`;
        } else {
            if (isThisSelected) {
                if (selected === data.isTrue) {
                    return `${base} bg-green-100 border-green-500 text-green-900 shadow-inner`;
                }
                return `${base} bg-red-100 border-red-500 text-red-900 shadow-inner`;
            }
            return `${base} bg-gray-50 dark:bg-gray-900 border-transparent opacity-50 grayscale cursor-not-allowed`;
        }
    };

    const handleRetry = () => {
        setSelected(null);
        setIsSubmitted(false);
    };

    return (
        <div className="w-full">
            <div className={HEADER_STYLE}>
                <HelpCircle className="w-6 h-6" />
                <span>אמת או שקר?</span>
            </div>
            <p className="text-base font-bold mb-6 text-gray-800 dark:text-gray-100 leading-relaxed">
                {data.question}
            </p>

            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => !isSubmitted && setSelected(true)}
                    disabled={isSubmitted}
                    className={getCardClass("true")}
                >
                    <div
                        className={`p-3 rounded-full ${
                            selected === true
                                ? "bg-white/40"
                                : "bg-green-100 dark:bg-green-900/30"
                        }`}
                    >
                        <Check
                            className={`w-8 h-8 ${
                                selected === true
                                    ? "text-inherit"
                                    : "text-green-600 dark:text-green-400"
                            }`}
                        />
                    </div>
                    <span className="font-black text-xl">נכון</span>
                </button>
                <button
                    onClick={() => !isSubmitted && setSelected(false)}
                    disabled={isSubmitted}
                    className={getCardClass("false")}
                >
                    <div
                        className={`p-3 rounded-full ${
                            selected === false
                                ? "bg-white/40"
                                : "bg-red-100 dark:bg-red-900/30"
                        }`}
                    >
                        <X
                            className={`w-8 h-8 ${
                                selected === false
                                    ? "text-inherit"
                                    : "text-red-600 dark:text-red-400"
                            }`}
                        />
                    </div>
                    <span className="font-black text-xl">לא נכון</span>
                </button>
            </div>

            {selected !== null && !isSubmitted && (
                <CheckButton onClick={() => setIsSubmitted(true)} />
            )}
            {isSubmitted && selected !== null && (
                <FeedbackBanner
                    isCorrect={selected === data.isTrue}
                    explanation={data.explanation}
                    onRetry={handleRetry}
                />
            )}
        </div>
    );
};

export default TrueFalseWidget;
