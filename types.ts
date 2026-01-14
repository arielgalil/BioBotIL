export enum Sender {
  User = 'user',
  Bot = 'bot',
}

export enum WidgetType {
  RelatedTopics = 'related_topics',
  TrueFalse = 'true_false',
  MultipleChoice = 'multiple_choice',
  Cloze = 'cloze',
  CausalChain = 'causal_chain',
}

// --- Widget Data Interfaces ---

export interface RelatedTopicsData {
  topics: string[];
}

export interface TrueFalseData {
  question: string;
  isTrue: boolean;
  explanation: string;
}

export interface MultipleChoiceData {
  question: string;
  options: string[]; // 4 options
  correctIndex: number;
  explanation: string;
}

export interface ClozeData {
  sentenceParts: string[]; // Segments around gaps
  hiddenWords: string[];   // The correct words for the gaps
  distractors: string[];   // Extra wrong words
}

export interface CausalChainData {
  title: string;
  steps: string[]; // Correct order. We will separate first/last and shuffle middle in UI.
}

export type WidgetData = 
  | { type: WidgetType.RelatedTopics; data: RelatedTopicsData }
  | { type: WidgetType.TrueFalse; data: TrueFalseData }
  | { type: WidgetType.MultipleChoice; data: MultipleChoiceData }
  | { type: WidgetType.Cloze; data: ClozeData }
  | { type: WidgetType.CausalChain; data: CausalChainData };

// --- Message Structure ---

export interface Message {
  id: string;
  sender: Sender;
  content: string; // For bot, this contains the ||| delimited text
  quotedContent?: string; // Text being replied to
  relatedMessageId?: string; // ID of the message being replied to (for scrolling)
  widgets?: WidgetData[]; // Only for bot
  isStreaming?: boolean;
  timestamp: number;
}

export interface ParsedBotContent {
  intro: string;
  explanation: string;
  analogy: string;
  bonus: string;
}