import { GoogleGenAI, Type } from "@google/genai";
import { AgentRole, Message, JudgeEvaluation } from "../types";
import { AGENTS, GEMINI_MODEL_FAST, GEMINI_MODEL_REASONING } from "../constants";

// Resolve API key from Vite env first, then fall back to process.env when available
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== "undefined" ? process.env?.API_KEY : undefined);

// Only initialize when we actually have a key to avoid crashing the app on load
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const SYSTEM_PROMPT_TEMPLATE = (role: AgentRole, topic: string) => `
You are participating in a structured debate.
TOPIC: "${topic}"
YOUR ROLE: ${AGENTS[role].name} (${role}).
YOUR PERSONA: ${AGENTS[role].persona}

INSTRUCTIONS:
1. Keep your response under 80 words.
2. Be direct and conversational.
3. Respond to the previous point if it exists.
4. If you are starting, make a strong opening statement.
`;

export const generateAgentResponse = async (
  role: AgentRole,
  topic: string,
  history: Message[]
): Promise<string> => {
  if (!ai) {
    console.warn("Gemini API key missing; returning placeholder response.");
    return "I need an API key to debate. Please add VITE_GEMINI_API_KEY to your environment.";
  }

  const modelId = GEMINI_MODEL_FAST;

  // Format history for context
  const conversationContext = history.map(msg => 
    `${AGENTS[msg.role].name}: ${msg.text}`
  ).join('\n');

  const prompt = `
    The debate is underway.
    Current Conversation History:
    ${conversationContext}

    It is now your turn. Generate your argument.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT_TEMPLATE(role, topic),
        temperature: 0.7,
        maxOutputTokens: 200,
      }
    });

    return response.text || "I have no further comments.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I am taking a moment to gather my thoughts... (API Error)";
  }
};

export const generateJudgeEvaluation = async (
  topic: string,
  history: Message[],
  judgePersona: string
): Promise<JudgeEvaluation> => {
  if (!ai) {
    console.warn("Gemini API key missing; returning neutral judge scores.");
    return {
      proScore: 50,
      conScore: 50,
      reasoning: "Provide VITE_GEMINI_API_KEY to enable judge scoring.",
      winningSide: "TIE"
    };
  }

  const modelId = GEMINI_MODEL_REASONING;

  const conversationContext = history.map(msg => 
    `${AGENTS[msg.role].name} (${msg.role}): ${msg.text}`
  ).join('\n');

  const prompt = `
    Analyze the debate so far based on the topic: "${topic}".
    
    Conversation:
    ${conversationContext}

    Evaluate the performance of PRO and CON based on:
    1. Logical consistency
    2. Persuasiveness
    3. Relevance

    Provide scores out of 100 for both sides.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: judgePersona,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            proScore: { type: Type.INTEGER, description: "Score for the PRO side (0-100)" },
            conScore: { type: Type.INTEGER, description: "Score for the CON side (0-100)" },
            reasoning: { type: Type.STRING, description: "A brief 1-sentence explanation of why the score changed or who is winning." },
            winningSide: { type: Type.STRING, enum: ["PRO", "CON", "TIE"], description: "Current winner based on this round." }
          },
          required: ["proScore", "conScore", "reasoning", "winningSide"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No text returned from Judge");
    
    return JSON.parse(jsonText) as JudgeEvaluation;
  } catch (error) {
    console.error("Judge API Error:", error);
    return {
      proScore: 50,
      conScore: 50,
      reasoning: "The judge is currently unavailable to score.",
      winningSide: "TIE"
    };
  }
};