const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
You are a compassionate, professional AI clinical intake assistant conducting a preliminary health screening call in English or Hindi.
Your goal is to gather:
1. Patient's Name
2. Main health concern/symptom
3. Duration (how long it has been happening)
4. Severity (scale 1-10 or mild/moderate/severe)
5. Any accompanying symptoms or relevant history

Guidelines:
- Ask only ONE short, conversational question at a time.
- Be adaptive: if an answer is vague, ask a natural follow-up before moving on.
- Mirror the language the user speaks (English or Hindi).
- Keep replies concise (1-2 sentences) so spoken audio remains natural.
- Greet the user warmly when the session begins.
`;

// Helper to start or continue a screening session
function createConversationSession() {
  return ai.chats.create({
    model: "gemini-3.6-flash",
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });
}

// Utility function to handle 503 High Demand errors with a simple retry
async function fetchWithRetry(apiCall, maxRetries = 3, delayMs = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      const status = error?.status || error?.response?.status;
      // If it's a 503 (Service Unavailable) or 429 (Too Many Requests)
      if ((status === 503 || status === 429) && i < maxRetries - 1) {
        console.warn(`API busy (Error ${status}). Retrying in ${delayMs / 1000} seconds... (Attempt ${i + 1} of ${maxRetries})`);
        await new Promise(res => setTimeout(res, delayMs));
      } else {
        throw error; // If it's a different error or we ran out of retries, throw it
      }
    }
  }
}

// Generate structured intake report at the end of the call
async function generateReport(transcriptHistory) {
  if (!transcriptHistory || transcriptHistory.length === 0) {
    return {
      patientName: "Not Provided",
      mainConcern: "No discussion recorded",
      duration: "N/A",
      severity: "N/A",
      associatedSymptoms: [],
      triageFlags: ["Call ended before intake could begin"],
      summary: "Call disconnected immediately."
    };
  }

  const prompt = `
Based on the following health screening conversation transcript, generate a structured clinical summary in JSON format:
Transcript:
${JSON.stringify(transcriptHistory, null, 2)}

Respond with strictly valid JSON matching this schema:
{
  "patientName": "string or 'Not specified'",
  "mainConcern": "string or 'Not specified'",
  "duration": "string or 'Not specified'",
  "severity": "string or 'Not specified'",
  "associatedSymptoms": ["string"],
  "triageFlags": ["string (e.g., Red flags, urgent follow-up needed, or standard routine care)"],
  "summary": "2-3 sentence clinical narrative overview."
}
`;

  try {
    // Wrapping the generateContent call in our retry utility
    const response = await fetchWithRetry(() => 
      ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      })
    );

    return JSON.parse(response.text);
  } catch (err) {
    console.error("Failed to generate or parse report:", err);
    return {
      patientName: "Unknown",
      mainConcern: "Error processing report due to high API demand.",
      duration: "N/A",
      severity: "N/A",
      associatedSymptoms: [],
      triageFlags: ["System Error"],
      summary: "The AI servers are currently experiencing high demand. Please try generating the report again later.",
    };
  }
}

module.exports = { createConversationSession, fetchWithRetry, generateReport };