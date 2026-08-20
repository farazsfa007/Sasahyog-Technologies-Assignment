import { useState, useEffect } from "react";
import io from "socket.io-client";
import CallInterface from "./components/CallInterface";
import ReportView from "./components/ReportView";
import "./App.css";

const socket = io("http://localhost:5000");

export default function App() {
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    socket.on("generating-report", () => setLoadingReport(true));
    socket.on("report-ready", ({ report }) => {
      setReport(report);
      setLoadingReport(false);
    });

    return () => {
      socket.off("generating-report");
      socket.off("report-ready");
    };
  }, []);

  const handleEndCall = () => {
    socket.emit("end-call");
  };

  const handleReset = () => {
    setReport(null);
  };

  return (
    <div className="container">
      <header style={{ marginBottom: "24px", textAlign: "center" }}>
        <h1 style={{ margin: "0 0 8px 0" }}>Sasahyog Health Intake AI</h1>
        <p style={{ color: "var(--text-muted)", margin: 0 }}>Voice-based clinical triage & report generator</p>
      </header>

      {!report && <CallInterface socket={socket} onEndCall={handleEndCall} />}

      {loadingReport && (
        <div className="card" style={{ textAlign: "center", marginTop: "24px" }}>
          <p>Generating structured clinical intake report...</p>
        </div>
      )}

      {report && <ReportView report={report} onReset={handleReset} />}
    </div>
  );
}