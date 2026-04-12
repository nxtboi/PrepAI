
import { GoogleGenAI, GenerateContentResponse, Chat, Type } from "@google/genai";
import { syllabus } from "../data/syllabus";
import { Question, PriorityTopic } from "../types";

// Ensure the API key is available. In a real app, this would be handled more robustly.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const qBankModel = 'gemini-3-flash-preview';
const studyNotesModel = 'gemini-3-flash-preview';
const chatModel = 'gemini-3-flash-preview';
const BATCH_SIZE = 30; // Increased batch size for Flash model

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generates a single batch of questions. This function is called internally by the main generateQuestions orchestrator.
 */
const generateQuestionBatch = async (exam: string, subject: string, topic: string, numQuestions: number, subTopic?: string): Promise<Question[]> => {
  const focus = subTopic && subTopic !== 'Entire Chapter'
    ? `The questions must focus specifically on the sub-topic: "${subTopic}".`
    : `The questions should cover various aspects of the entire chapter.`;
  
  const prompt = `
    You are an expert content creator for Indian competitive exams.
    **Instructions:**
    1.  Generate **exactly** ${numQuestions} diverse, high-quality, and unique questions (MCQ, Fill in the Blanks, True/False) for the chapter "${topic}" under the subject "${subject}" for the "${exam}" exam.
    2.  ${focus}
    3.  Ensure the questions are distinct from each other.
    4.  **Use Notation:** Where necessary, use LaTeX-style syntax within dollar signs for formulas, equations, and units (e.g., $H_2O$, $x^2$, $10^{-19} C$). Do NOT use markdown backticks for math formulas.
    **Output Format:**
    Return a single JSON object with a key "questions" containing an array. Do not include any markdown formatting like \`\`\`json. The 'questions' array **MUST** have exactly ${numQuestions} items.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: qBankModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    questions: {
                        type: Type.ARRAY,
                        minItems: numQuestions,
                        maxItems: numQuestions,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                questionText: { type: Type.STRING },
                                type: { type: Type.STRING, enum: ['MCQ', 'FillInTheBlank', 'TrueFalse', 'ShortAnswer'] },
                                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                correctAnswer: { type: Type.STRING },
                                explanation: { type: Type.STRING },
                                difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
                                topic: { type: Type.STRING },
                            },
                             required: ['id', 'questionText', 'type', 'correctAnswer', 'explanation', 'difficulty', 'topic'],
                        },
                    },
                },
                 required: ['questions'],
            },
        },
    });

    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText);
    return data.questions;
  } catch (error) {
    console.error(`Error generating a batch of ${numQuestions} questions:`, error);
    throw error; // Re-throw the original error to be handled upstream.
  }
};

/**
 * Orchestrates the generation of questions, breaking large requests into smaller batches and executing them in parallel for speed.
 */
export const generateQuestions = async (exam: string, subject: string, topic: string, totalQuestions: number, subTopic?: string): Promise<Question[]> => {
  if (totalQuestions <= 0) {
    return [];
  }

  const numBatches = Math.ceil(totalQuestions / BATCH_SIZE);
  const batchPromises: Promise<Question[]>[] = [];

  for (let i = 0; i < numBatches; i++) {
    const isLastBatch = i === numBatches - 1;
    const questionsInBatch = isLastBatch 
      ? totalQuestions - (i * BATCH_SIZE) 
      : BATCH_SIZE;
    
    if (questionsInBatch > 0) {
        batchPromises.push(generateQuestionBatch(exam, subject, topic, questionsInBatch, subTopic));
    }
  }
  
  try {
    const results = await Promise.all(batchPromises);
    const allQuestions = results.flat();
    
    // The model might generate duplicate IDs across batches. Ensure they are unique.
    return allQuestions.map((q, index) => ({
        ...q,
        id: `${q.topic}-${index}`
    }));
  } catch (error) {
    console.error("Error generating questions in parallel:", error);
    const errorString = JSON.stringify(error);
    if (errorString.includes('429')) {
         throw new Error(`The request was rate-limited by the API. Please try a smaller number of questions or wait a moment before trying again.`);
    }
    throw new Error(`Failed to generate questions. Please try again with fewer questions.`);
  }
};

const priorityTopicsCache = new Map<string, PriorityTopic[]>();

export const getPriorityTopics = async (exam: string, subject: string): Promise<PriorityTopic[]> => {
  const cacheKey = `${exam}-${subject}`;
  if (priorityTopicsCache.has(cacheKey)) {
    return priorityTopicsCache.get(cacheKey)!;
  }

  const chapterList = syllabus[exam]?.[subject] || [];
  if (chapterList.length === 0) {
    return [];
  }
  const prompt = `
    You are an expert analyst for Indian competitive exams.
    **Syllabus for ${subject} - ${exam}:**
    ${chapterList.join(', ')}

    **Instructions:**
    From the provided syllabus list, analyze all chapters for the subject "${subject}" and provide a prioritized list of the top 5 most important chapters. For each, give a priority score (1-5, 5 being highest) and a brief reason for its importance (e.g., "High weightage in past papers", "Fundamental concepts").

    **Output Format:**
    Return a single JSON object with a key "priorityTopics" containing an array of 5 items. Do not include any markdown formatting like \`\`\`json.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: qBankModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    priorityTopics: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                topic: { type: Type.STRING },
                                priority: { type: Type.NUMBER },
                                reason: { type: Type.STRING },
                            },
                            required: ['topic', 'priority', 'reason'],
                        },
                    },
                },
                required: ['priorityTopics'],
            },
        },
    });

    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText);
    priorityTopicsCache.set(cacheKey, data.priorityTopics);
    return data.priorityTopics;
  } catch (error) {
    console.error("Error getting priority topics:", error);
    const errorString = JSON.stringify(error);
    if (errorString.includes('429')) {
        throw new Error(`The request was rate-limited by the API. Please wait a moment before trying again.`);
    }
    throw new Error("Failed to get priority topics from Gemini API.");
  }
};

const subTopicsCache = new Map<string, string[]>();

export const getSubTopics = async (exam: string, subject: string, topic: string): Promise<string[]> => {
    const cacheKey = `${exam}-${subject}-${topic}`;
    if (subTopicsCache.has(cacheKey)) {
        return subTopicsCache.get(cacheKey)!;
    }

    const prompt = `
      You are an expert curriculum designer for Indian competitive exams.
      **Context:**
      - Exam: "${exam}"
      - Subject: "${subject}"
      - Chapter: "${topic}"
  
      **Instructions:**
      List the key, granular sub-topics or main concepts within the chapter "${topic}".
      Focus on creating a list suitable for generating specific questions or study notes. Keep the names concise.
  
      **Output Format:**
      Return a single JSON object with a key "subTopics" containing an array of strings. Do not include any markdown formatting.
    `;
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      subTopics: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                      },
                  },
                  required: ['subTopics'],
              },
          },
      });
      const jsonText = response.text.trim();
      const data = JSON.parse(jsonText);
      subTopicsCache.set(cacheKey, data.subTopics || []);
      return data.subTopics || [];
    } catch (error) {
      console.error("Error getting sub-topics:", error);
      throw new Error("Failed to get sub-topics from Gemini API.");
    }
  };


export const suggestVideo = async (topic: string, exam: string): Promise<string> => {
    const prompt = `Find a single, high-quality, and highly relevant YouTube video URL for a student preparing for the ${exam} exam on the topic: "${topic}". The video should be from a reputable educational channel. Return only the full YouTube URL and nothing else.`;
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error suggesting video:", error);
        throw new Error("Failed to suggest a video.");
    }
};

const questionNotesCache = new Map<string, string>();

export const generateNotesForQuestion = async (question: Question, exam: string, subject: string): Promise<string> => {
    const cacheKey = `${question.id}-${exam}-${subject}`;
    if (questionNotesCache.has(cacheKey)) {
        return questionNotesCache.get(cacheKey)!;
    }

    const prompt = `
        A student is preparing for the "${exam}" exam and is working on the subject "${subject}".
        They are currently attempting the following question on the chapter "${question.topic}":

        **Question:** "${question.questionText}"
        ${question.options ? `**Options:** ${question.options.join(', ')}` : ''}
        **Correct Answer:** ${question.correctAnswer}

        Generate concise and clear study notes in Markdown format that explain the key concepts, formulas, and principles required to understand and solve THIS SPECIFIC question.
        Focus only on the direct knowledge needed for this question. Do not explain the entire chapter.
        Use LaTeX-style syntax within dollar signs for any formulas or values (e.g., $H_2O$, $x^2$).
        Use headings, lists, and bold text. Mark important formulas with **[Memorize this formula]**.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: studyNotesModel,
            contents: prompt,
        });
        const notes = response.text;
        questionNotesCache.set(cacheKey, notes);
        return notes;
    } catch (error) {
        console.error("Error generating notes for question:", error);
        throw new Error("Failed to generate contextual notes.");
    }
};

const topicNotesCache = new Map<string, string>();

export const generateTopicNotes = async (exam: string, subject: string, topic: string, subTopic?: string): Promise<string> => {
    const cacheKey = `${exam}-${subject}-${topic}-${subTopic || 'main'}`;
    if (topicNotesCache.has(cacheKey)) {
        return topicNotesCache.get(cacheKey)!;
    }
    
    const focus = subTopic && subTopic !== 'Entire Chapter' 
        ? `The notes must focus specifically on the sub-topic: "${subTopic}".`
        : `The notes should cover the entire chapter comprehensively.`;

    const prompt = `
      You are an expert educator creating study materials for Indian competitive exams.
      **Task:** Generate comprehensive, well-structured study notes in Markdown format.
      **Exam:** ${exam}
      **Subject:** ${subject}
      **Chapter:** ${topic}
      **Focus:** ${focus}
  
      **Formatting Instructions:**
      - Use headings (#, ##, ###) for main topics and sub-topics.
      - Use bullet points (-) and numbered lists (1.) for clarity.
      - Use bold text (**) for key terms and definitions.
      - **Crucially, use LaTeX-style syntax within dollar signs ($...$) for ALL mathematical formulas, equations, chemical formulas, units, and scientific notations (e.g., $E=mc^2$, $H_2O$, $10^{-19} C$).**
      - Use custom hints to highlight critical information:
        - For a key concept, use: **[Key Concept]** followed by the explanation.
        - For a formula that must be memorized, use: **[Memorize this formula]** followed by the formula.
        - For a helpful tip, use: **[Pro Tip]** followed by the tip.
      - Include relevant examples or simple problems where applicable to illustrate concepts.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: studyNotesModel,
            contents: prompt,
        });
        const notes = response.text;
        topicNotesCache.set(cacheKey, notes);
        return notes;
    } catch (error) {
        console.error("Error generating topic notes:", error);
        throw new Error("Failed to generate study notes from Gemini API.");
    }
};


export const createDoubtSolverChat = (): Chat => {
    const systemInstruction = `You are PrepAI, a super friendly, cheerful, and creative AI tutor for Indian students preparing for competitive exams like IIT JEE, NEET, and board exams. Your goal is to make learning fun and accessible.
    
    **Your Persona:**
    - **Tone:** Always use a positive, encouraging, and slightly informal tone.
    - **Emojis:** Use emojis generously to add personality and visual cues (e.g., 🧠, ✨, 👍, 🚀, 🤔, ✅).
    - **Formatting:** Use markdown (bold, italics, lists) to make explanations clear and engaging. For formulas, equations, and scientific notations, you MUST use LaTeX-style syntax within dollar signs (e.g., $H_2O$, $x^2$). Use markdown code blocks only for computer code snippets.
    - **Engagement:** Ask clarifying questions to better understand the student's doubt.
    
    **CRITICAL RULE: SYLLABUS BOUNDARY**
    You MUST ONLY answer questions related to the syllabus of:
    - **IIT JEE:** Physics, Chemistry, Maths
    - **NEET:** Physics, Chemistry, Biology
    - **Indian Board Exams (CBSE/ICSE):** Classes 10-12 subjects (Physics, Chemistry, Maths, Biology).

    If a student asks a question outside this scope (e.g., about history, geography, general knowledge, politics, or personal opinions), you MUST politely decline to answer the academic part. Instead, you MUST pivot to sharing a fun, unrelated science or math fact.

    **Example of Handling Out-of-Scope Question:**
    *Student:* "Who was the first Prime Minister of India?"
    *You:* "Oops! 😅 That's a great question, but it's a little outside my specialized circuits! I'm laser-focused on helping you ace Physics, Chemistry, Math, and Biology. But hey, speaking of amazing facts, did you know that the human brain generates about 12-25 watts of electricity? That's enough to power a low-wattage LED light bulb! 💡 How cool is that! Now, shall we get back to those tricky calculus problems? 🚀"
    `;

    return ai.chats.create({
        model: chatModel,
        config: {
            systemInstruction: systemInstruction,
        },
    });
};
