import { GoogleGenAI, Type } from "@google/genai";
import { WidgetType, WidgetData } from "../types";
import { isBudgetAvailable, calculateCost, updateCumulativeCost } from "./billingService";
import { MODELS } from "../config";

// --- Singleton Instance Management ---
let genAIInstance: GoogleGenAI | null = null;
let currentApiKey: string | null = null;

const getGenAI = (apiKey: string): GoogleGenAI => {
  if (!genAIInstance || currentApiKey !== apiKey) {
    genAIInstance = new GoogleGenAI({ apiKey });
    currentApiKey = apiKey;
  }
  return genAIInstance;
};

// --- Instructions ---
const SYSTEM_INSTRUCTION_STANDARD = `
You are BIO-Bot, a friendly and knowledgeable biology tutor for Israeli high school students.
Your responses MUST be in Hebrew.
Your goal is to explain complex biological concepts simply and visually, BUT with strict scientific accuracy appropriate for the school curriculum.

CONTEXTUAL AWARENESS:
The user's message might come in the format "Slug: Message" or just "Slug". 
If a slug is provided (e.g., "Mitochondria: How does it work?"), treat the first part as the primary biological topic/context and the second part as the specific question. 
If only a slug is provided, give a general but engaging overview of that topic according to the structure below.

ACCURACY & SCOPE RULES:
1. SCOPE: Stick strictly to the Israeli High School Biology Curriculum (Bagrut level). Avoid university-level details unless absolutely necessary for clarity.
2. CONSENSUS: Adhere strictly to established scientific consensus.
3. TERMINOLOGY: Use precise biological terminology used in high school textbooks.
4. Do not oversimplify to the point of error.

STRUCTURE RULES (CRITICAL):
You must strictly format your response into exactly 4 parts separated by "|||".
Do not add labels like "Part 1:", just the content.

Format:
[Part 1: Personal & Encouraging Opening]
|||
[Part 2: The Scientific Explanation]
* Length: Approximately 60-80 words. Be comprehensive yet concise.
* Focus on the core mechanism and causality (Cause -> Effect).
* Use bold text like **this** for key terms, but DO NOT use markdown headers (like # or ##).
* Ensure specific details (names of enzymes, organelles, or molecules) are correct and required by the high school curriculum.
|||
[Part 3: "Similar but Different" - An everyday analogy]
* Include a short reservation/caveat (e.g., "Unlike a car, the body...").
|||
[Part 4: Bonus - A surprising fact, a joke, or a riddle]
`;

const SYSTEM_INSTRUCTION_REPLY = `
You are BIO-Bot. The user is replying to a specific part of your previous explanation.
Answer their follow-up question directly and conversationally in Hebrew.

RULES:
1.  **NO Structure**: Do NOT use the ||| 4-part structure.
2.  **Length Limit**: Keep the answer concise (maximum 75 words).
3.  **Tone**: Friendly, clear, and educational.
4.  **Formatting**: Use **bold** for key terms.
5.  **Closing**: ALWAYS end with a short question or encouraging statement to keep the learning going.
`;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const streamChatResponse = async (
  apiKey: string,
  history: { role: string; parts: { text: string }[] }[],
  newMessage: string,
  onChunk: (text: string) => void,
  isReply: boolean = false
) => {
  if (!(await isBudgetAvailable())) throw new Error("BUDGET_EXCEEDED");
  const ai = getGenAI(apiKey);
  let retries = 0;
  const MAX_RETRIES = 2;

  while (retries < MAX_RETRIES) {
      try {
          const chat = ai.chats.create({
            model: MODELS.TEXT,
            config: {
              systemInstruction: isReply ? SYSTEM_INSTRUCTION_REPLY : SYSTEM_INSTRUCTION_STANDARD,
              temperature: 0.7,
            },
            history: history,
          });

          const result = await chat.sendMessageStream({ message: newMessage });
          let finalUsage = null;
          for await (const chunk of result) {
            if (chunk.text) onChunk(chunk.text);
            if (chunk.usageMetadata) finalUsage = chunk.usageMetadata;
          }

          if (finalUsage) {
            const cost = calculateCost(finalUsage.promptTokenCount, finalUsage.candidatesTokenCount, MODELS.TEXT);
            await updateCumulativeCost(cost);
          }
          return; 
      } catch (e: any) {
           const isRateLimit = e && (e.status === 429 || e.code === 429 || e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED'));
           if (isRateLimit) {
              retries++;
              const waitTime = 1000;
              console.warn(`Text streaming rate limit. Retrying in ${waitTime}ms... (${retries}/${MAX_RETRIES})`);
              await delay(waitTime);
              continue;
           }

           const isNotFound = e && (e.status === 404 || e.code === 404 || e.message?.includes('404') || e.message?.includes('not found'));
           if (isNotFound) {
               throw new Error("Model not found (404). The preview model might have been deprecated.");
           }
           
           throw e;
      }
  }
  throw new Error("API Quota Exhausted (429) after retries.");
};

export const generateWidgets = async (apiKey: string, topic: string): Promise<WidgetData[]> => {
  if (!(await isBudgetAvailable())) return [];
  const ai = getGenAI(apiKey);

  const isTrueFalse = Math.random() > 0.5;
  const isCloze = Math.random() > 0.5;
  const questionType = isTrueFalse ? "True/False" : "Multiple Choice";
  const applicationType = isCloze ? "Cloze (Fill in blank)" : "Causal Chain (Ordering)";

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      relatedTopics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-4 short related biology terms in Hebrew." },
      knowledgeQuestion: {
        type: Type.OBJECT,
        properties: isTrueFalse ? {
          question: { type: Type.STRING },
          isTrue: { type: Type.BOOLEAN },
          explanation: { type: Type.STRING }
        } : {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctIndex: { type: Type.INTEGER },
          explanation: { type: Type.STRING }
        },
        required: isTrueFalse ? ["question", "isTrue", "explanation"] : ["question", "options", "correctIndex", "explanation"]
      },
      applicationTask: {
        type: Type.OBJECT,
        properties: isCloze ? {
          sentenceParts: { type: Type.ARRAY, items: { type: Type.STRING } },
          hiddenWords: { type: Type.ARRAY, items: { type: Type.STRING } },
          distractors: { type: Type.ARRAY, items: { type: Type.STRING } }
        } : {
          title: { type: Type.STRING },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: isCloze ? ["sentenceParts", "hiddenWords", "distractors"] : ["title", "steps"]
      }
    },
    required: ["relatedTopics", "knowledgeQuestion", "applicationTask"]
  };

  const prompt = `Analyze biology topic: "${topic}". Generate JSON for Israeli High School students (Bagrut level). Generate a ${questionType} question and a ${applicationType} task. Language: Hebrew.`;

  let retries = 0;
  while (retries < 1) {
    try {
      const response = await ai.models.generateContent({
        model: MODELS.LOGIC,
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: responseSchema, temperature: 0.4 },
      });

      if (!response.text) return [];
      if (response.usageMetadata) {
        const cost = calculateCost(response.usageMetadata.promptTokenCount, response.usageMetadata.candidatesTokenCount, MODELS.LOGIC);
        await updateCumulativeCost(cost);
      }

      const json = JSON.parse(response.text);
      const widgets: WidgetData[] = [];
      widgets.push({ type: WidgetType.RelatedTopics, data: { topics: json.relatedTopics } });
      
      if (isTrueFalse) widgets.push({ type: WidgetType.TrueFalse, data: json.knowledgeQuestion });
      else widgets.push({ type: WidgetType.MultipleChoice, data: json.knowledgeQuestion });

      if (isCloze) widgets.push({ type: WidgetType.Cloze, data: json.applicationTask });
      else widgets.push({ type: WidgetType.CausalChain, data: json.applicationTask });

      return widgets;
    } catch (e: any) {
      const isRateLimit = e && (e.status === 429 || e.code === 429 || e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED'));
      if (isRateLimit) {
        retries++;
        if (retries < 1) {
          const waitTime = 1000;
          console.warn(`Widget generation rate limit hit. Retrying in ${waitTime}ms... (${retries}/1)`);
          await delay(waitTime);
          continue;
        } else {
           console.warn("Widget generation skipped due to sustained rate limit.");
           return [];
        }
      }
      
      const isNotFound = e && (e.status === 404 || e.code === 404 || e.message?.includes('404') || e.message?.includes('not found'));
      if (isNotFound) {
          console.error("Widget generation failed: Model not found (404)");
          return [];
      }
      
      console.error("Failed to generate or parse widget JSON after retries", e);
      return [];
    }
  }
  return [];
};