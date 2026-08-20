require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { createConversationSession, generateReport } = require("./geminiService");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Map to store active conversation sessions per socket connection
const activeSessions = new Map();

io.on("connection", (socket) => {
  console.log(`[Socket Connected]: ${socket.id}`);

  // 1. Initialize Call
  socket.on("start-call", async () => {
    try {
      const chat = createConversationSession();
      const transcript = [];
      activeSessions.set(socket.id, { chat, transcript });

      // Trigger initial AI greeting
      const initialResponse = await chat.sendMessage({ message: "Hello. Start the intake call with a brief greeting and ask my name." });
      const replyText = initialResponse.text;

      transcript.push({ speaker: "AI", text: replyText });
      socket.emit("ai-response", { text: replyText });
    } catch (err) {
      console.error("Error starting call:", err);
      socket.emit("error", "Unable to start conversation session.");
    }
  });

  // 2. Handle User Spoken Turn
  socket.on("user-message", async ({ text }) => {
    const session = activeSessions.get(socket.id);
    if (!session || !text.trim()) return;

    try {
      session.transcript.push({ speaker: "User", text });
      
      const response = await session.chat.sendMessage({ message: text });
      const replyText = response.text;

      session.transcript.push({ speaker: "AI", text: replyText });
      socket.emit("ai-response", { text: replyText });
    } catch (err) {
      console.error("Error during user turn:", err);
      socket.emit("ai-response", { 
        text: "I am having trouble hearing you. Could you please repeat that?" 
      });
    }
  });

  // 3. End Call and Generate Report
  socket.on("end-call", async () => {
    const session = activeSessions.get(socket.id);
    if (!session) {
      socket.emit("call-ended", { report: null });
      return;
    }

    try {
      socket.emit("generating-report");
      const report = await generateReport(session.transcript);
      socket.emit("report-ready", { report, transcript: session.transcript });
    } catch (err) {
      console.error("Error creating report:", err);
      socket.emit("error", "Failed to generate report.");
    } finally {
      activeSessions.delete(socket.id);
    }
  });

  socket.on("disconnect", () => {
    activeSessions.delete(socket.id);
    console.log(`[Socket Disconnected]: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});