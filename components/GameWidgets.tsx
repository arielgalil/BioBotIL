import React from "react";
import { WidgetData, WidgetType } from "../types";
import TrueFalseWidget from "./widgets/TrueFalseWidget";
import MultipleChoiceWidget from "./widgets/MultipleChoiceWidget";
import ClozeWidget from "./widgets/ClozeWidget";
import CausalChainWidget from "./widgets/CausalChainWidget";

// --- Helper to get summary text for context ---
export const getWidgetSummary = (widget: WidgetData): string => {
  switch (widget.type) {
    case WidgetType.RelatedTopics:
      return `נושאים קשורים: ${widget.data.topics.join(", ")}`;
    case WidgetType.TrueFalse:
      return `שאלת אמת/שקר: ${widget.data.question}`;
    case WidgetType.MultipleChoice:
      return `שאלה אמריקאית: ${widget.data.question}`;
    case WidgetType.Cloze:
      const preview = widget.data.sentenceParts.slice(0, 2).join("...");
      return `השלמת משפטים: ${preview}...`;
    case WidgetType.CausalChain:
      return `משימת סדר: ${widget.data.title || widget.data.steps[0]}...`;
    default:
      return "משימה אינטראקטיבית";
  }
};

export const WidgetRenderer: React.FC<
  { widget: WidgetData; onTopicClick?: (t: string) => void }
> = ({ widget, onTopicClick }) => {
  switch (widget.type) {
    case WidgetType.RelatedTopics:
      return (
        <div className="flex flex-wrap gap-2 mt-2">
          {widget.data.topics.map((topic) => (
            <button
              key={topic}
              onClick={() => onTopicClick?.(topic)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-bio-400 dark:hover:border-bio-600 rounded-xl text-base font-medium hover:bg-white dark:hover:bg-gray-700 transition-all shadow-sm active:scale-95 text-bio-700 dark:text-bio-400"
            >
              #{topic.trim().replace(/[\s_]+/g, "_")}
            </button>
          ))}
        </div>
      );
    case WidgetType.TrueFalse:
      return <TrueFalseWidget data={widget.data} />;
    case WidgetType.MultipleChoice:
      return <MultipleChoiceWidget data={widget.data} />;
    case WidgetType.Cloze:
      return <ClozeWidget data={widget.data} />;
    case WidgetType.CausalChain:
      return <CausalChainWidget data={widget.data} />;
    default:
      return null;
  }
};
