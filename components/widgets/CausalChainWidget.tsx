import React, { useEffect, useRef, useState } from "react";
import { Flag, GripVertical, List, MapPin } from "lucide-react";
import { CausalChainData } from "../../types";
import {
    CheckButton,
    FeedbackBanner,
    HEADER_STYLE,
} from "./SharedWidgetComponents";

interface StepItem {
    id: string;
    text: string;
}

const CausalChainWidget: React.FC<{ data: CausalChainData }> = ({ data }) => {
    const [middleSteps, setMiddleSteps] = useState<StepItem[]>([]);
    const [isChecked, setIsChecked] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(
        null,
    );
    const longPressTimerRef = useRef<any>(null);

    useEffect(() => {
        if (data.steps.length >= 3) {
            const middle = data.steps.slice(1, -1).map((text, i) => ({
                id: `step-${i}-${Date.now()}`,
                text,
            }));
            setMiddleSteps(middle.sort(() => Math.random() - 0.5));
        }
    }, [data]);

    const swapItems = (fromIndex: number, toIndex: number) => {
        const newItems = [...middleSteps];
        const itemToMove = newItems[fromIndex];
        newItems.splice(fromIndex, 1);
        newItems.splice(toIndex, 0, itemToMove);
        setMiddleSteps(newItems);
    };

    if (data.steps.length < 3) return null;
    const firstStep = data.steps[0];
    const lastStep = data.steps[data.steps.length - 1];

    const checkOrder = () => {
        const currentChain = [
            firstStep,
            ...middleSteps.map((s) => s.text),
            lastStep,
        ];
        const correct = currentChain.every((val, index) =>
            val === data.steps[index]
        );
        setIsCorrect(correct);
        setIsChecked(true);
    };

    const retry = () => {
        setIsChecked(false);
        setIsCorrect(false);
        setMiddleSteps([...middleSteps].sort(() => Math.random() - 0.5));
    };

    return (
        <div className="w-full">
            <div className={HEADER_STYLE}>
                <List className="w-6 h-6" />
                <span>שרשרת הסיבות</span>
            </div>
            {data.title && (
                <p className="text-base font-bold mb-2 text-gray-800 dark:text-gray-100">
                    {data.title}
                </p>
            )}
            <p className="text-base text-gray-500 dark:text-gray-400 mb-6">
                גרור את המשפטים לסדר הנכון:
            </p>

            <div className="relative space-y-3 mb-6 select-none py-2">
                <div className="absolute top-6 bottom-6 right-10 w-1 bg-gray-200 dark:bg-gray-700 -z-0 rounded-full" />
                <div className="relative z-10 -mr-6 ml-0">
                    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-l-bio-500 border-y border-r border-gray-100 dark:border-gray-700 shadow-md">
                        <div className="bg-bio-100 dark:bg-bio-900/50 p-2 rounded-full shadow-sm shrink-0">
                            <MapPin className="text-bio-600 w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-800 dark:text-gray-100 text-base">
                            {firstStep}
                        </span>
                    </div>
                </div>
                <div className="space-y-2 pr-8 relative z-10">
                    {middleSteps.map((step, idx) => (
                        <div
                            key={step.id}
                            draggable={!isChecked}
                            onDragStart={(e) => {
                                if (isChecked) return;
                                setDraggedItemIndex(idx);
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                if (
                                    draggedItemIndex !== null &&
                                    draggedItemIndex !== idx
                                ) {
                                    swapItems(draggedItemIndex, idx);
                                    setDraggedItemIndex(idx);
                                }
                            }}
                            onDragEnd={() => setDraggedItemIndex(null)}
                            className={`relative flex items-center justify-between p-4 rounded-xl border transition-all duration-200 touch-none select-none group backdrop-blur-sm ${
                                isChecked
                                    ? (isCorrect
                                        ? "bg-green-50/90 border-green-200 dark:bg-green-900/40 dark:border-green-900"
                                        : "bg-red-50/90 border-red-200 dark:bg-red-900/40 dark:border-red-900")
                                    : "bg-white/90 dark:bg-gray-800/90 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 shadow-sm"
                            } ${
                                draggedItemIndex === idx
                                    ? "opacity-95 scale-105 shadow-xl border-blue-500 z-20 bg-blue-50 dark:bg-blue-900/30 cursor-grabbing"
                                    : "cursor-grab active:cursor-grabbing"
                            }`}
                        >
                            <div className="flex items-center gap-4 flex-1">
                                {!isChecked && (
                                    <div className="p-1 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-400 group-hover:text-blue-500 transition-colors">
                                        <GripVertical className="w-4 h-4" />
                                    </div>
                                )}
                                <span className="font-medium text-gray-800 dark:text-gray-200 text-base leading-snug">
                                    {step.text}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="relative z-10 -mr-6 ml-0">
                    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-l-purple-500 border-y border-r border-gray-100 dark:border-gray-700 shadow-md">
                        <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full shadow-sm shrink-0">
                            <Flag className="text-purple-600 w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-800 dark:text-gray-100 text-base">
                            {lastStep}
                        </span>
                    </div>
                </div>
            </div>
            {!isChecked
                ? <CheckButton onClick={checkOrder} text="בדוק סדר" />
                : <FeedbackBanner isCorrect={isCorrect} onRetry={retry} />}
        </div>
    );
};

export default CausalChainWidget;
