import { GoogleGenAI, Type } from "@google/genai";
import { WidgetType, WidgetData } from "../types";

// --- Configuration ---

const MODEL_TEXT = 'gemini-2.5-flash-lite-preview-09-2025';
const MODEL_LOGIC = 'gemini-2.5-flash-lite-preview-09-2025';

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

// --- Text Channel (Streaming) ---

const SYSTEM_INSTRUCTION_STANDARD = `
You are BIO-Bot, a friendly and knowledgeable biology tutor for Israeli high school students.
Your responses MUST be in Hebrew.
Your goal is to explain complex biological concepts simply and visually, BUT with strict scientific accuracy appropriate for the school curriculum.

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

Example Output:
היי! שאלה מצוינת על התא...
|||
המיטוכונדריה היא **תחנת הכוח** של התא. היא ממירה סוכר לאנרגיה כימית זמינה (ATP) בתהליך הנקרא נשימה תאית. תהליך זה מתרחש בכל תא בגוף ודורש חמצן. המבנה המיוחד שלה, הכולל קרום פנימי מפותל, מאפשר לה לייצר אנרגיה ביעילות רבה עבור תהליכי החיים.
|||
זה דומה למנוע של מכונית שמייצר אנרגיה מדלק, אבל... המזגן משתמש בחשמל, והגוף משתמש במים ובכימיה עדינה.
|||
הידעת? למיטוכונדריה יש DNA משלה!
`;

const SYSTEM_INSTRUCTION_REPLY = `
You are BIO-Bot. The user is replying to a specific part of your previous explanation.
Answer their follow-up question directly and conversationally in Hebrew.

RULES:
1.  **NO Structure**: Do NOT use the ||| 4-part structure.
2.  **Length Limit**: Keep the answer concise (maximum 75 words). It should be about 50% longer than a standard explanation, but no more.
3.  **Tone**: Friendly, clear, and educational.
4.  **Formatting**: Use **bold** for key terms.
5.  **Closing**: ALWAYS end with a short question or encouraging statement to keep the learning going.
`;

export const streamChatResponse = async (
  apiKey: string,
  history: { role: string; parts: { text: string }[] }[],
  newMessage: string,
  onChunk: (text: string) => void,
  isReply: boolean = false
) => {
  // Use Singleton instance
  const ai = getGenAI(apiKey);
  console.log(`Using model: ${MODEL_TEXT}`);
  
  let retries = 0;
  const MAX_RETRIES = 2; // Reduced for faster user feedback on 429

  while (retries < MAX_RETRIES) {
      try {
          const chat = ai.chats.create({
            model: MODEL_TEXT,
            config: {
              systemInstruction: isReply ? SYSTEM_INSTRUCTION_REPLY : SYSTEM_INSTRUCTION_STANDARD,
              temperature: 0.7,
            },
            history: history,
          });

          const result = await chat.sendMessageStream({ message: newMessage });

          for await (const chunk of result) {
            if (chunk.text) {
              onChunk(chunk.text);
            }
          }
          return; // Success
      } catch (e: any) {
           const isRateLimit = e && (e.status === 429 || e.code === 429 || e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED'));
           
           if (isRateLimit) {
              retries++;
              const waitTime = 1000; // Fast retry
              console.warn(`Text streaming rate limit. Retrying in ${waitTime}ms... (${retries}/${MAX_RETRIES})`);
              await delay(waitTime);
              continue;
           }
           
           // If not rate limit, rethrow immediately
           throw e;
      }
  }
  
  // If we ran out of retries for 429
  throw new Error("API Quota Exhausted (429) after retries.");
};

// --- Logic Channel (Widgets JSON) ---

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateWidgets = async (
  apiKey: string,
  topic: string
): Promise<WidgetData[]> => {
  // Use Singleton instance
  const ai = getGenAI(apiKey);

  // Randomization Logic to decide widget types BEFORE calling AI
  const isTrueFalse = Math.random() > 0.5;
  const isCloze = Math.random() > 0.5;

  const questionType = isTrueFalse ? "True/False" : "Multiple Choice";
  const applicationType = isCloze ? "Cloze (Fill in blank)" : "Causal Chain (Ordering)";

  // Dynamic Schema Definition based on randomization
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      relatedTopics: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "3-4 short related biology terms in Hebrew."
      },
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
        required: isTrueFalse 
          ? ["question", "isTrue", "explanation"] 
          : ["question", "options", "correctIndex", "explanation"]
      },
      applicationTask: {
        type: Type.OBJECT,
        properties: isCloze ? {
          sentenceParts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Segments of text around the hidden words." },
          hiddenWords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The words removed from the sentence, in order." },
          distractors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Wrong words to confuse the user." }
        } : {
          title: { type: Type.STRING },
          steps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5 steps of the process in the CORRECT order." }
        },
        required: isCloze 
          ? ["sentenceParts", "hiddenWords", "distractors"] 
          : ["title", "steps"]
      }
    },
    required: ["relatedTopics", "knowledgeQuestion", "applicationTask"]
  };

  const prompt = `
    Analyze the biology topic from this input: "${topic}".
    Note: The input might start with a context tag like "[בהקשר ל: ...]" (In context of: ...). 
    Use both the context and the main text to determine the specific sub-topic for the question/task.
    
    Generate a JSON response strictly following the provided schema.
    
    CONSTRAINTS:
    - Target Audience: Israeli High School Students.
    - Difficulty: Aligned with the standard Bagrut biology curriculum.
    - Content: Focus on core educational concepts, avoiding obscure academic trivia or university-level complexity.

    TASKS:
    1. Related Topics: 3-4 short related biology terms.
    2. Knowledge Question: Generate a ${questionType} question specifically about this topic.
    3. Application Task: Generate a ${applicationType} task specifically about this topic.

    Details:
    - Language: Hebrew (עברית) ONLY.
    - If Causal Chain: Provide 5 steps of a biological process strictly in the correct chronological order.
    - If Cloze: Take a sentence, remove 2-3 key terms. 
      'sentenceParts' are the text segments around the gaps. 
      'hiddenWords' are the removed terms. 
      'distractors' are incorrect terms. You must provide exactly 2 distractors.
      IMPORTANT: The length of 'sentenceParts' MUST be equal to the length of 'hiddenWords' + 1.
  `;

  let retries = 0;
  const MAX_RETRIES = 2; // Reduced for faster response

  while (retries < MAX_RETRIES) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_LOGIC,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.4, 
        },
      });

      if (!response.text) return [];

      const json = JSON.parse(response.text);
      const widgets: WidgetData[] = [];

      // 1. Related Topics
      widgets.push({
          type: WidgetType.RelatedTopics,
          data: { topics: json.relatedTopics }
      });

      // 2. Knowledge Question
      if (isTrueFalse) {
          widgets.push({
              type: WidgetType.TrueFalse,
              data: {
                  question: json.knowledgeQuestion.question,
                  isTrue: json.knowledgeQuestion.isTrue,
                  explanation: json.knowledgeQuestion.explanation
              }
          });
      } else {
          widgets.push({
              type: WidgetType.MultipleChoice,
              data: {
                  question: json.knowledgeQuestion.question,
                  options: json.knowledgeQuestion.options,
                  correctIndex: json.knowledgeQuestion.correctIndex,
                  explanation: json.knowledgeQuestion.explanation
              }
          });
      }

      // 3. Application Task
      if (isCloze) {
          widgets.push({
              type: WidgetType.Cloze,
              data: {
                  sentenceParts: json.applicationTask.sentenceParts,
                  hiddenWords: json.applicationTask.hiddenWords,
                  distractors: json.applicationTask.distractors
              }
          });
      } else {
          widgets.push({
              type: WidgetType.CausalChain,
              data: {
                  title: json.applicationTask.title,
                  steps: json.applicationTask.steps
              }
          });
      }

      return widgets;

    } catch (e: any) {
      // Handle 429 Rate Limit specifically with safe checks
      const isRateLimit = e && (e.status === 429 || e.code === 429 || e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED'));
      
      if (isRateLimit) {
        retries++;
        if (retries < MAX_RETRIES) {
          const waitTime = 1000;
          console.warn(`Widget generation rate limit hit. Retrying in ${waitTime}ms... (${retries}/${MAX_RETRIES})`);
          await delay(waitTime);
          continue;
        } else {
           // Graceful exit for widgets
           console.warn("Widget generation skipped due to sustained rate limit.");
           return [];
        }
      }
      
      console.error("Failed to generate or parse widget JSON after retries", e);
      // Return empty array to allow chat to function even if widgets fail
      return [];
    }
  }
  return [];
};