import { GoogleGenerativeAI } from '@google/generative-ai';

// Personal API Key
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export const generateRuleFromEntry = async (entryText) => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `
    You are the user's "Better Me" - a highly analytical, empathetic version of themselves that extracts life lessons from their venting.
    The user is journaling about an experience, a mistake, or a tough day.
    
    Your task:
    1. Identify the root cause of the mistake or the core lesson.
    2. Formulate a single, actionable "Life Rule" for the user to follow in the future.
    
    Respond ONLY with a JSON object in this format:
    {
      "title": "Short punchy title (e.g. The 24-Hour Rule)",
      "description": "The actionable rule description."
    }
    
    User's Entry:
    "${entryText}"
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    return JSON.parse(responseText);
  } catch (e) {
    console.error("Error generating rule:", e);
    throw e;
  }
};

export const consultBetterMe = async (query, rulesList) => {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  
  const rulesText = rulesList.map((r, i) => `Rule ${i+1}: ${r.title} - ${r.description}`).join('\n');

  const prompt = `
    You are the user's "Better Me" - their higher self. 
    You must advise them on an upcoming decision. 
    You must speak directly to them in a firm but empathetic tone (e.g. "I recommend...", "We know from experience...").
    
    Here is the user's personalized Rule Book built from past mistakes:
    ---
    ${rulesText || "No rules established yet. Give general good advice based on their query."}
    ---
    
    Here is the user's current situation/decision:
    "${query}"
    
    Provide a concise (2-3 sentences), highly actionable piece of advice. Explicitly reference one of their rules if applicable.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    console.error("Error consulting Better Me:", e);
    return "I'm having trouble thinking clearly right now. Try again in a moment.";
  }
};
