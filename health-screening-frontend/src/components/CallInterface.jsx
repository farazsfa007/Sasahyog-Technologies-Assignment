import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, PhoneCall, PhoneOff, Volume2 } from "lucide-react";

export default function CallInterface({ socket, onEndCall }) {
  const [callActive, setCallActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [userTranscript, setUserTranscript] = useState("");

  const recognitionRef = useRef(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US"; // Supports 'hi-IN' or auto-switching

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserTranscript(transcript);
        setIsListening(false);
        // Send user voice transcript to backend via Socket.IO
        socket.emit("user-message", { text: transcript });
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, [socket]);

  // Setup Socket Events for AI turns
  useEffect(() => {
    socket.on("ai-response", ({ text }) => {
      setAiMessage(text);
      speakText(text);
    });

    return () => {
      socket.off("ai-response");
    };
  }, [socket]);

  // Browser TTS Voice Playback
  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    setIsSpeaking(true);

    utterance.onend = () => {
      setIsSpeaking(false);
      // Auto listen for user response after AI finishes talking
      startListening();
    };

    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn("Speech recognition already active");
      }
    }
  };

  const handleStartCall = () => {
    setCallActive(true);
    socket.emit("start-call");
  };

  const handleEndCall = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();
    setCallActive(false);
    onEndCall();
  };

  return (
    <div className="card" style={{ textAlign: "center" }}>
      <h2>AI Clinical Intake Screening</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
        Conducting an interactive spoken health triage session.
      </p>

      {!callActive ? (
        <button className="btn btn-primary" onClick={handleStartCall}>
          <PhoneCall size={18} /> Start Call
        </button>
      ) : (
        <div>
          <div style={{ margin: "24px 0", minHeight: "120px", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span className="badge">{isSpeaking ? "AI Speaking" : isListening ? "Listening..." : "Idle"}</span>
            </div>

            {aiMessage && (
              <div style={{ background: "#f1f5f9", padding: "16px", borderRadius: "8px", maxWidth: "90%" }}>
                <Volume2 size={16} style={{ verticalAlign: "middle", marginRight: "6px" }} />
                <strong>AI:</strong> {aiMessage}
              </div>
            )}

            {userTranscript && (
              <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                <strong>You:</strong> "{userTranscript}"
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
            <button
              className="btn btn-primary"
              onClick={startListening}
              disabled={isSpeaking || isListening}
            >
              {isListening ? <Mic size={18} /> : <MicOff size={18} />} Push to Talk
            </button>
            <button className="btn btn-danger" onClick={handleEndCall}>
              <PhoneOff size={18} /> End Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
}