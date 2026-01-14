import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, HelpCircle, MapPin, Flag, RotateCcw, Puzzle, List, GripVertical, Type, Check, X } from 'lucide-react';
import { 
  WidgetData, 
  WidgetType, 
  TrueFalseData, 
  MultipleChoiceData, 
  ClozeData, 
  CausalChainData 
} from '../types';

// --- Styles ---
const HEADER_STYLE = "flex items-center gap-2 mb-3 text-lg font-black uppercase tracking-wide text-bio-600 dark:text-bio-400 opacity-90";

const OPTION_BTN_BASE = "w-full p-3.5 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-bio-300 dark:hover:border-bio-600 hover:bg-bio-50 dark:hover:bg-gray-700 hover:shadow-md transition-all font-medium text-gray-700 dark:text-gray-200 text-base shadow-sm relative";
const OPTION_BTN_SELECTED = "w-full p-3.5 rounded-xl border-2 border-bio-500 bg-bio-100 dark:bg-bio-900/40 text-bio-900 dark:text-bio-100 font-bold shadow-md transition-all text-base relative";
const OPTION_BTN_ERROR = "w-full p-3.5 rounded-xl border-2 border-red-500 bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-100 font-bold shadow-md transition-all text-base relative";

// --- Shared UI Components ---

const CheckButton: React.FC<{ onClick: () => void, disabled?: boolean, text?: string }> = ({ onClick, disabled, text = "בדוק תשובה" }) => (
    <button 
        onClick={onClick}
        disabled={disabled} 
        className="w-full py-3 bg-bio-600 hover:bg-bio-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 text-base animate-slide-up"
    >
        <Check className="w-5 h-5"/>
        {text}
    </button>
);

const FeedbackBanner: React.FC<{ 
    isCorrect: boolean, 
    message?: string, 
    onRetry?: () => void,
    explanation?: string 
}> = ({ isCorrect, message, onRetry, explanation }) => {
    return (
        <div className={`mt-4 p-4 rounded-xl text-center border-2 shadow-sm animate-slide-up ${
            isCorrect 
            ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-100' 
            : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-100'
        }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
                {isCorrect ? <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" /> : <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />}
                <p className="font-black text-xl">{message || (isCorrect ? 'כל הכבוד! תשובה נכונה.' : 'לא מדויק. נסה שוב.')}</p>
            </div>
            
            {explanation && (
                <div className="text-sm opacity-90 leading-relaxed mb-2 px-2">
                    {explanation}
                </div>
            )}

            {!isCorrect && onRetry && (
                <button onClick={onRetry} className="inline-flex items-center gap-2 px-6 py-2 bg-white dark:bg-gray-800 rounded-full font-bold shadow-sm text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mt-2 border border-red-100 dark:border-red-800">
                    <RotateCcw className="w-4 h-4"/> נסה שוב
                </button>
            )}
        </div>
    );
};

// --- Helper to get summary text for context ---
export const getWidgetSummary = (widget: WidgetData): string => {
  switch (widget.type) {
    case WidgetType.RelatedTopics:
      return `נושאים קשורים: ${widget.data.topics.join(', ')}`;
    case WidgetType.TrueFalse:
      return `שאלת אמת/שקר: ${widget.data.question}`;
    case WidgetType.MultipleChoice:
      return `שאלה אמריקאית: ${widget.data.question}`;
    case WidgetType.Cloze:
      // Construct a preview of the sentence
      const preview = widget.data.sentenceParts.slice(0, 2).join('...');
      return `השלמת משפטים: ${preview}...`;
    case WidgetType.CausalChain:
      return `משימת סדר: ${widget.data.title || widget.data.steps[0]}...`;
    default:
      return "משימה אינטראקטיבית";
  }
};

// --- True / False Widget ---
const TrueFalseWidget: React.FC<{ data: TrueFalseData }> = ({ data }) => {
  const [selected, setSelected] = useState<boolean | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Custom large card style for True/False
  const getCardClass = (type: 'true' | 'false') => {
    const isThisType = type === 'true';
    const isThisSelected = selected === isThisType;
    
    // Base style
    let base = "flex-1 p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-200 shadow-sm hover:shadow-lg active:scale-95 cursor-pointer min-h-[140px]";
    
    if (!isSubmitted) {
        // Selection Phase
        if (isThisSelected) {
            return `${base} bg-bio-100 dark:bg-bio-900/40 border-bio-500 text-bio-900 dark:text-bio-100 shadow-inner`;
        }
        return `${base} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-bio-400 dark:hover:border-bio-500 text-gray-600 dark:text-gray-300`;
    } else {
        // Result Phase
        if (isThisSelected) {
             if (selected === data.isTrue) {
                return `${base} bg-green-100 border-green-500 text-green-900 shadow-inner`;
             } else {
                return `${base} bg-red-100 border-red-500 text-red-900 shadow-inner`;
             }
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
      <p className="text-base font-bold mb-6 text-gray-800 dark:text-gray-100 leading-relaxed">{data.question}</p>
      
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => !isSubmitted && setSelected(true)}
          disabled={isSubmitted}
          className={getCardClass('true')}
        >
          <div className={`p-3 rounded-full ${selected === true ? 'bg-white/40' : 'bg-green-100 dark:bg-green-900/30'}`}>
             <Check className={`w-8 h-8 ${selected === true ? 'text-inherit' : 'text-green-600 dark:text-green-400'}`} />
          </div>
          <span className="font-black text-xl">נכון</span>
        </button>

        <button
          onClick={() => !isSubmitted && setSelected(false)}
          disabled={isSubmitted}
          className={getCardClass('false')}
        >
          <div className={`p-3 rounded-full ${selected === false ? 'bg-white/40' : 'bg-red-100 dark:bg-red-900/30'}`}>
             <X className={`w-8 h-8 ${selected === false ? 'text-inherit' : 'text-red-600 dark:text-red-400'}`} />
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

// --- Multiple Choice Widget ---
const MultipleChoiceWidget: React.FC<{ data: MultipleChoiceData }> = ({ data }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const labels = ['א.', 'ב.', 'ג.', 'ד.'];

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
      <p className="text-base font-bold mb-6 text-gray-800 dark:text-gray-100 leading-relaxed">{data.question}</p>
      
      <div className="space-y-3 mb-4">
        {data.options.map((option, idx) => {
          let btnClass = OPTION_BTN_BASE;
          
          if (isSubmitted && selectedIndex !== null) {
            // Result State
            if (idx === data.correctIndex) {
              btnClass = OPTION_BTN_SELECTED + " bg-green-100 border-green-500 text-green-900 dark:bg-green-900/40 dark:text-green-100";
            } else if (idx === selectedIndex && idx !== data.correctIndex) {
              btnClass = OPTION_BTN_ERROR;
            } else {
              btnClass = "w-full p-3.5 rounded-xl border-2 border-transparent bg-gray-50 dark:bg-gray-800/30 text-gray-400 dark:text-gray-600 text-right text-base opacity-60";
            }
          } else {
             // Selection State
             if (selectedIndex === idx) {
                 btnClass = OPTION_BTN_SELECTED;
             }
             btnClass += " text-right";
          }

          return (
            <button
              key={idx}
              onClick={() => !isSubmitted && setSelectedIndex(idx)}
              disabled={isSubmitted}
              className={`flex justify-between items-center ${btnClass}`}
            >
              <div className="flex items-center gap-3">
                  <span className={`font-black w-6 ${selectedIndex === idx || (isSubmitted && idx === data.correctIndex) ? 'text-inherit' : 'text-bio-600/60 dark:text-bio-400/60'}`}>{labels[idx]}</span>
                  <span className="font-medium">{option}</span>
              </div>
              {isSubmitted && idx === data.correctIndex && <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0" />}
              {isSubmitted && selectedIndex === idx && idx !== data.correctIndex && <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0" />}
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

// --- Cloze (Fill in Blank) Widget ---
const ClozeWidget: React.FC<{ data: ClozeData }> = ({ data }) => {
  const [filledIndices, setFilledIndices] = useState<(string | null)[]>(Array(data.sentenceParts.length - 1).fill(null));
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
      setWordBank(wordBank.filter(w => w !== word));
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
    const correct = filledIndices.every((word, idx) => word === data.hiddenWords[idx]);
    setIsCorrect(correct);
    setIsComplete(true);
  };

  const reset = () => {
    setFilledIndices(Array(data.sentenceParts.length - 1).fill(null));
    const allWords = [...data.hiddenWords, ...data.distractors];
    setWordBank(allWords.sort(() => Math.random() - 0.5));
    setIsComplete(false);
    setIsCorrect(null);
  }

  const allFilled = filledIndices.every(w => w !== null);

  const getSlotStyle = (index: number) => {
    const word = data.hiddenWords[index];
    const charCount = word ? word.length : 5;
    const widthPx = Math.max(60, charCount * 11 + 16); 
    return { 
        width: `${widthPx}px`,
        minWidth: `${widthPx}px`
    };
  };

  const BANK_WORD_STYLE = "px-3 py-1.5 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-100 shadow-sm transition-all hover:border-bio-300 hover:shadow-md active:scale-95 cursor-pointer select-none";

  return (
    <div className="w-full">
      <div className={`${HEADER_STYLE} mb-4`}>
        <Puzzle className="w-5 h-5" />
        <span className="text-base">השלם את המשפטים</span>
      </div>
      
      {/* Sentence Area */}
      <div className="bg-white dark:bg-gray-800 px-5 py-5 rounded-2xl leading-[2.3rem] text-lg mb-4 border border-gray-100 dark:border-gray-700 font-normal text-gray-800 dark:text-gray-200 text-right shadow-sm">
        {data.sentenceParts.map((part, idx) => {
          const style = getSlotStyle(idx);
          const isFilled = filledIndices[idx] !== null;
          
          return (
            <React.Fragment key={idx}>
              <span>{part}</span>
              {idx < data.sentenceParts.length - 1 && (
                <span 
                    className={`mx-1 inline-flex items-center justify-center h-[28px] my-1 align-middle rounded-lg transition-all select-none relative
                        ${isFilled 
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-200 font-bold cursor-pointer hover:bg-red-50 hover:border-red-200 hover:text-red-500' 
                            : 'bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-300 dark:border-gray-600'
                        }`}
                    style={style}
                    onClick={() => isFilled ? handleSlotClick(idx) : null}
                >
                    <span className="truncate px-1.5 w-full text-center text-sm">
                        {filledIndices[idx] || ''}
                    </span>
                    {!isFilled && (
                        <span className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                        </span>
                    )}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Word Bank Area */}
      {!isComplete && (
        <div className="mb-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50">
           <div className="flex items-center gap-2 mb-2">
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Type className="w-3 h-3" />
                בנק מילים
             </span>
             <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1 opacity-50"></div>
           </div>
          
          <div className="flex flex-wrap gap-2 justify-start min-h-[36px]">
            {wordBank.length > 0 ? (
                wordBank.map((word, idx) => (
                <button
                    key={`${word}-${idx}`}
                    onClick={() => handleWordClick(word)}
                    className={BANK_WORD_STYLE}
                >
                    {word}
                </button>
                ))
            ) : (
                <span className="text-gray-400 text-xs italic w-full text-center py-1">
                    כל המילים שובצו. לחץ על מילה במשפט כדי להחזיר אותה.
                </span>
            )}
          </div>
        </div>
      )}

      {allFilled && !isComplete && (
        <CheckButton onClick={checkAnswer} />
      )}

      {isComplete && isCorrect !== null && (
          <FeedbackBanner 
            isCorrect={isCorrect} 
            onRetry={reset}
          />
      )}
    </div>
  );
};

// --- Causal Chain (Drag & Drop) Widget ---
interface StepItem {
  id: string;
  text: string;
}

const CausalChainWidget: React.FC<{ data: CausalChainData }> = ({ data }) => {
  const [middleSteps, setMiddleSteps] = useState<StepItem[]>([]);
  const [firstStep, setFirstStep] = useState<string>("");
  const [lastStep, setLastStep] = useState<string>("");
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  
  const longPressTimerRef = useRef<any>(null);

  // Initialize
  useEffect(() => {
    if (data.steps.length >= 3) {
      setFirstStep(data.steps[0]);
      setLastStep(data.steps[data.steps.length - 1]);
      // Create stable objects with unique IDs for keys
      const middle = data.steps.slice(1, -1).map((text, i) => ({
        id: `step-${i}-${Date.now()}`, // Unique ID for key stability
        text
      }));
      setMiddleSteps(middle.sort(() => Math.random() - 0.5));
    }
  }, [data]);

  // Swap Helper
  const swapItems = (fromIndex: number, toIndex: number) => {
    const newItems = [...middleSteps];
    const itemToMove = newItems[fromIndex];
    newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, itemToMove);
    setMiddleSteps(newItems);
  };

  // --- Drag Handlers ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
      if (isChecked) { e.preventDefault(); return; }
      setDraggedItemIndex(index);
      e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedItemIndex === null) return;
      if (draggedItemIndex !== index) {
          swapItems(draggedItemIndex, index);
          setDraggedItemIndex(index);
      }
  };

  const handleDragEnd = () => {
      setDraggedItemIndex(null);
  };

  // --- Mobile Touch Handlers ---
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    if (isChecked) return;
    longPressTimerRef.current = setTimeout(() => {
        setDraggedItemIndex(index);
        if (navigator.vibrate) navigator.vibrate(50);
    }, 600);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggedItemIndex === null) {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
        return; 
    }
    e.preventDefault(); 
    const touch = e.touches[0];
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    const row = targetElement?.closest('[data-index]');
    if (row) {
        const targetIndexStr = row.getAttribute('data-index');
        if (targetIndexStr !== null) {
            const targetIndex = parseInt(targetIndexStr, 10);
            if (targetIndex !== draggedItemIndex) {
                 swapItems(draggedItemIndex, targetIndex);
                 setDraggedItemIndex(targetIndex);
            }
        }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
    }
    setDraggedItemIndex(null);
  };

  const checkOrder = () => {
    // Reconstruct the full chain text to compare with original data
    const currentChain = [firstStep, ...middleSteps.map(s => s.text), lastStep];
    const correctChain = data.steps;
    const correct = currentChain.every((val, index) => val === correctChain[index]);
    setIsCorrect(correct);
    setIsChecked(true);
  };

  const retry = () => {
    setIsChecked(false);
    setIsCorrect(false);
    setMiddleSteps([...middleSteps].sort(() => Math.random() - 0.5));
  };

  if (data.steps.length < 3) return null;

  return (
    <div className="w-full">
      <div className={HEADER_STYLE}>
        <List className="w-6 h-6" />
        <span>שרשרת הסיבות</span>
      </div>
      <p className="text-base text-gray-500 dark:text-gray-400 mb-6">גרור את המשפטים לסדר הנכון:</p>

      <div className="relative space-y-3 mb-6 select-none py-2">
        {/* Connecting Line */}
        <div className="absolute top-6 bottom-6 right-10 w-1 bg-gray-200 dark:bg-gray-700 -z-0 rounded-full" />

        {/* First Step */}
        <div className="relative z-10 -mr-6 ml-0">
            <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-l-bio-500 border-y border-r border-gray-100 dark:border-gray-700 shadow-md">
              <div className="bg-bio-100 dark:bg-bio-900/50 p-2 rounded-full shadow-sm shrink-0">
                <MapPin className="text-bio-600 w-5 h-5" />
              </div>
              <span className="font-bold text-gray-800 dark:text-gray-100 text-base">{firstStep}</span>
            </div>
        </div>

        {/* Draggable Steps */}
        <div className="space-y-2 pr-8 relative z-10">
            {middleSteps.map((step, idx) => (
                <div 
                    key={step.id} 
                    data-index={idx}
                    draggable={!isChecked}
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    onTouchStart={(e) => handleTouchStart(e, idx)}
                    onTouchMove={(e) => handleTouchMove(e)}
                    onTouchEnd={handleTouchEnd}
                    className={`relative flex items-center justify-between p-4 rounded-xl border transition-all duration-200 touch-none select-none group backdrop-blur-sm ${
                        isChecked 
                            ? (isCorrect 
                                ? 'bg-green-50/90 border-green-200 dark:bg-green-900/40 dark:border-green-900' 
                                : 'bg-red-50/90 border-red-200 dark:bg-red-900/40 dark:border-red-900')
                            : 'bg-white/90 dark:bg-gray-800/90 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 shadow-sm'
                    } ${
                        draggedItemIndex === idx 
                        ? 'opacity-95 scale-105 shadow-xl border-blue-500 z-20 bg-blue-50 dark:bg-blue-900/30 cursor-grabbing ring-2 ring-blue-200 dark:ring-blue-800' 
                        : 'cursor-grab active:cursor-grabbing'
                    }`}
                >
                    <div className="flex items-center gap-4 flex-1">
                         {!isChecked && (
                           <div className="p-1 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-400 group-hover:text-blue-500 transition-colors">
                             <GripVertical className="w-4 h-4" />
                           </div>
                         )}
                        <span className="font-medium text-gray-800 dark:text-gray-200 text-base leading-snug">{step.text}</span>
                    </div>
                </div>
            ))}
        </div>

        {/* Last Step */}
        <div className="relative z-10 -mr-6 ml-0">
             <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-l-purple-500 border-y border-r border-gray-100 dark:border-gray-700 shadow-md">
                <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full shadow-sm shrink-0">
                    <Flag className="text-purple-600 w-5 h-5" />
                </div>
                <span className="font-bold text-gray-800 dark:text-gray-100 text-base">{lastStep}</span>
             </div>
        </div>
      </div>

      {!isChecked ? (
        <CheckButton onClick={checkOrder} text="בדוק סדר" />
      ) : (
          <FeedbackBanner 
            isCorrect={isCorrect} 
            message={isCorrect ? "כל הכבוד! הסדר נכון." : "לא ממש... נסה שוב."}
            onRetry={retry}
          />
      )}
    </div>
  );
};

export const WidgetRenderer: React.FC<{ widget: WidgetData, onTopicClick?: (t:string) => void }> = ({ widget, onTopicClick }) => {
    switch(widget.type) {
        case WidgetType.RelatedTopics:
            return (
                <div className="flex flex-wrap gap-2 mt-2">
                    {widget.data.topics.map(topic => (
                        <button 
                            key={topic}
                            onClick={() => onTopicClick?.(topic)}
                            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-bio-400 dark:hover:border-bio-600 text-gray-700 dark:text-gray-300 rounded-xl text-base font-medium hover:bg-white dark:hover:bg-gray-700 transition-all shadow-sm active:scale-95 text-bio-700 dark:text-bio-400"
                        >
                            #{topic.trim().replace(/[\s_]+/g, '_')}
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
}