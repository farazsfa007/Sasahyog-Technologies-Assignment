# AI Clinical Health Intake Assistant

A real-time web application where users can have a live voice conversation with an AI agent that conducts a basic health screening call. Following the conversation, the app generates a structured clinical report summarizing the patient's concerns, duration, severity, and any triage flags.

Built for the **Sasahyog Technologies Technical Assessment**.

## 🚀 Live Demo
* **Frontend (Netlify):** [https://silly-sopapillas-ca7599.netlify.app/](https://silly-sopapillas-ca7599.netlify.app/)
* **Backend (Render):** [https://sasahyog-technologies-assignment.onrender.com/](https://sasahyog-technologies-assignment.onrender.com/)
* **GitHub Repository:** [https://github.com/farazsfa007/Sasahyog-Technologies-Assignment](https://github.com/farazsfa007/Sasahyog-Technologies-Assignment)

---

## ✨ Features
* **Live Voice Conversation:** Uses a "Push-to-Talk" turn-taking mechanism for reliable, duplex-style communication.
* **Adaptive AI Interviewer:** Powered by Google Gemini (`gemini-3.6-flash`), the AI asks one screening question at a time and naturally follows up on vague answers.
* **Structured Clinical Report:** Synthesizes the spoken conversation into a clean JSON-structured report (Patient Name, Main Concern, Duration, Severity, Triage Flags).
* **Graceful Failure Handling:** Implemented an automatic retry mechanism to recover from API rate limits and `503 High Demand` errors without dropping the call.
* **Bilingual Support:** Naturally understands and speaks English. (Can adapt to Hindi depending on browser STT configuration).

---

## 🛠️ Tech Stack & Pipeline

**Frontend:** React (Vite), Socket.IO Client, Lucide React (Icons), Web Speech API (Native browser STT/TTS).
**Backend:** Node.js, Express, Socket.IO Server, `@google/genai` (Gemini API).

### Architecture Pipeline ($STT \rightarrow LLM \rightarrow TTS$)
1. **User Speaks:** The browser's native `SpeechRecognition` API captures the user's voice and converts it to text (STT).
2. **Transport:** The transcript is sent over a persistent `Socket.IO` WebSocket connection to the Node.js backend.
3. **LLM Processing:** The backend routes the text to the Google Gemini 3.6 Flash model, which maintains the conversation state (context) and generates the next conversational question.
4. **AI Responds:** The generated text is sent back via WebSockets to the frontend.
5. **Playback:** The browser's `SpeechSynthesis` API reads the AI's text aloud (TTS).

---

## 💻 Local Setup Instructions

### Prerequisites
* Node.js (v18+ recommended)
* A Google Gemini API Key

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/farazsfa007/Sasahyog-Technologies-Assignment.git
cd Sasahyog-Technologies-Assignment
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend
npm install
\`\`\`
Create a `.env` file in the `backend` directory and add your API key:
\`\`\`env
PORT=5000
GEMINI_API_KEY=your_google_gemini_api_key_here
\`\`\`
Start the backend server:
\`\`\`bash
npm run dev
\`\`\`

### 3. Frontend Setup
Open a new terminal window:
\`\`\`bash
cd frontend
npm install
\`\`\`
If you are running the backend locally, ensure your `App.jsx` points to `http://localhost:5000` (or leave it pointing to the Render URL for remote backend testing).
Start the frontend server:
\`\`\`bash
npm run dev
\`\`\`

**Note:** For the Web Speech API (Microphone and TTS) to work locally, access the app via `http://localhost:5173` using Google Chrome or Microsoft Edge.

---

## 🛡️ Failure Handling & State Management

* **API Overload Recovery:** Integrated a custom `fetchWithRetry` utility. If Google's API returns a `503 Service Unavailable` or `429 Too Many Requests`, the server waits 2 seconds and attempts the request again up to 3 times before returning a graceful error to the user.
* **Context Preservation:** The `gemini-3.6-flash` chat session object inherently maintains a rolling history of the conversation, ensuring the AI does not repeat questions and remembers previous symptoms.
* **Incomplete Calls:** If the user clicks "End Call" prematurely, the report generation pipeline handles the empty or short transcript gracefully, noting that the call was disconnected before intake could begin, rather than crashing.

---

## 🔮 What I would improve with more time

If I had more time to expand this beyond the 48-hour scope, I would implement:
1. **Third-Party STT/TTS Providers:** Swap the native browser Web Speech API for Deepgram (for ultra-low latency STT) and ElevenLabs (for highly realistic TTS).
2. **True Full-Duplex Audio / Barge-in:** Implement WebRTC to stream audio buffers continuously rather than using a push-to-talk turn-taking mechanism, allowing the user to interrupt the AI.
3. **Database Integration:** Save the structured JSON reports to a database (MongoDB/PostgreSQL) so users/doctors can view a dashboard of past screening calls.