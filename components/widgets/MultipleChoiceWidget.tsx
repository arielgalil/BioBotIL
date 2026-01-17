import React, { useState } from "react";
import { CheckCircle, List, XCircle } from "lucide-react";
import { MultipleChoiceData } from "../../types";
import {
    CheckButton,
    FeedbackBanner,
    HEADER_STYLE,
    OPTION_BTN_BASE,
    OPTION_BTN_ERROR,
    OPTION_BTN_SELECTED,
} from "./SharedWidgetComponents";

const MultipleChoiceWidget: React.FC<{ data: MultipleChoiceData }> = (
    { data },
) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const labels = ["א.", "ב.", "ג.", "ד."];

    const handleRetry = () => {
        setSelectedIndex(null);
        setIsSubmitted(false);
    };

    return (
        <div className="w-full">
            <div className={HEADER_STYLE}>
                <List className="w-6 h-6" />
                <span>בחן את עצמך</span>
            </div>
            <p className="text-base font-bold mb-6 text-gray-800 dark:text-gray-100 leading-relaxed">
                {data.question}
            </p>

            <div className="space-y-3 mb-4">
                {data.options.map((option, idx) => {
                    let btnClass = OPTION_BTN_BASE;
                    if (isSubmitted && selectedIndex !== null) {
                        if (idx === data.correctIndex) {
                            btnClass = OPTION_BTN_SELECTED +
                                " bg-green-100 border-green-500 text-green-900 dark:bg-green-900/40 dark:text-green-100";
                        } else if (idx === selectedIndex) {
                            btnClass = OPTION_BTN_ERROR;
                        } else {btnClass =
                                "w-full p-3.5 rounded-xl border-2 border-transparent bg-gray-50 dark:bg-gray-800/30 text-gray-400 dark:text-gray-600 text-right text-base opacity-60";}
                    } else if (selectedIndex === idx) {
                        btnClass = OPTION_BTN_SELECTED;
                    }
                    btnClass += " text-right";

                    return (
                        <button
                            key={idx}
                            onClick={() =>
                                !isSubmitted && setSelectedIndex(idx)}
                            disabled={isSubmitted}
                            className={`flex justify-between items-center ${btnClass}`}
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className={`font-black w-6 ${
                                        selectedIndex === idx ||
                                            (isSubmitted &&
                                                idx === data.correctIndex)
                                            ? "text-inherit"
                                            : "text-bio-600/60 dark:text-bio-400/60"
                                    }`}
                                >
                                    {labels[idx]}
                                </span>
                                <span className="font-medium">{option}</span>
                            </div>
                            {isSubmitted && idx === data.correctIndex && (
                                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0" />
                            )}
                            {isSubmitted && selectedIndex === idx &&
                                idx !== data.correctIndex && (
                                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0" />
                            )}
                        </button>
                    );
                })}
            </div>

            {selectedIndex !== null && !isSubmitted && (
                <CheckButton onClick={() => setIsSubmitted(true)} />
            )}
            {isSubmitted && selectedIndex !== null && (
                <FeedbackBanner
                    isCorrect={selectedIndex === data.correctIndex}
                    explanation={data.explanation}
                    onRetry={handleRetry}
                />
            )}
        </div>
    );
};

export default MultipleChoiceWidget;
