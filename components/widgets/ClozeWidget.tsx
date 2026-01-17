import React, { useEffect, useState } from "react";
import { Puzzle, Type } from "lucide-react";
import { ClozeData } from "../../types";
import {
    CheckButton,
    FeedbackBanner,
    HEADER_STYLE,
} from "./SharedWidgetComponents";

const ClozeWidget: React.FC<{ data: ClozeData }> = ({ data }) => {
    const [filledIndices, setFilledIndices] = useState<(string | null)[]>(
        Array(data.sentenceParts.length - 1).fill(null),
    );
    const [wordBank, setWordBank] = useState<string[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    useEffect(() => {
        const allWords = [...data.hiddenWords, ...data.distractors];
        setWordBank(allWords.sort(() => Math.random() - 0.5));
    }, [data]);

    const handleWordClick = (word: string) => {
        if (isComplete) return;
        const firstEmptyIndex = filledIndices.indexOf(null);
        if (firstEmptyIndex !== -1) {
            const newFilled = [...filledIndices];
            newFilled[firstEmptyIndex] = word;
            setFilledIndices(newFilled);
            setWordBank(wordBank.filter((w) => w !== word));
        }
    };

    const handleSlotClick = (index: number) => {
        if (isComplete) return;
        const wordToRemove = filledIndices[index];
        if (wordToRemove) {
            const newFilled = [...filledIndices];
            newFilled[index] = null;
            setFilledIndices(newFilled);
            setWordBank([...wordBank, wordToRemove]);
        }
    };

    const checkAnswer = () => {
        const correct = filledIndices.every((word, idx) =>
            word === data.hiddenWords[idx]
        );
        setIsCorrect(correct);
        setIsComplete(true);
    };

    const reset = () => {
        setFilledIndices(Array(data.sentenceParts.length - 1).fill(null));
        const allWords = [...data.hiddenWords, ...data.distractors];
        setWordBank(allWords.sort(() => Math.random() - 0.5));
        setIsComplete(false);
        setIsCorrect(null);
    };

    const allFilled = filledIndices.every((w) => w !== null);

    const BANK_WORD_STYLE =
        "px-3 py-1.5 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-100 shadow-sm transition-all hover:border-bio-300 hover:shadow-md active:scale-95 cursor-pointer select-none";

    return (
        <div className="w-full">
            <div className={`${HEADER_STYLE} mb-4`}>
                <Puzzle className="w-5 h-5" />
                <span className="text-base">השלם את המשפטים</span>
            </div>

            <div className="bg-white dark:bg-gray-800 px-5 py-5 rounded-2xl leading-[2.3rem] text-lg mb-4 border border-gray-100 dark:border-gray-700 font-normal text-gray-800 dark:text-gray-200 text-right shadow-sm">
                {data.sentenceParts.map((part, idx) => (
                    <React.Fragment key={idx}>
                        <span>{part}</span>
                        {idx < data.sentenceParts.length - 1 && (
                            <span
                                className={`mx-1 inline-flex items-center justify-center h-[28px] my-1 align-middle rounded-lg transition-all select-none relative
                        ${
                                    filledIndices[idx] !== null
                                        ? "bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-200 font-bold cursor-pointer hover:bg-red-50 hover:border-red-200 hover:text-red-500"
                                        : "bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-300 dark:border-gray-600"
                                }`}
                                style={{
                                    width: `${
                                        Math.max(
                                            60,
                                            (data.hiddenWords[idx] || "")
                                                        .length * 11 + 16,
                                        )
                                    }px`,
                                    minWidth: "60px",
                                }}
                                onClick={() =>
                                    filledIndices[idx] !== null
                                        ? handleSlotClick(idx)
                                        : null}
                            >
                                <span className="truncate px-1.5 w-full text-center text-sm">
                                    {filledIndices[idx] || ""}
                                </span>
                            </span>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {!isComplete && (
                <div className="mb-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <Type className="w-3 h-3" /> בנק מילים
                        </span>
                        <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1 opacity-50">
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-start min-h-[36px]">
                        {wordBank.map((word, idx) => (
                            <button
                                key={`${word}-${idx}`}
                                onClick={() => handleWordClick(word)}
                                className={BANK_WORD_STYLE}
                            >
                                {word}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {allFilled && !isComplete && <CheckButton onClick={checkAnswer} />}
            {isComplete && isCorrect !== null && (
                <FeedbackBanner isCorrect={isCorrect} onRetry={reset} />
            )}
        </div>
    );
};

export default ClozeWidget;
