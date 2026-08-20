import { AlertTriangle, FileText, RotateCcw } from "lucide-react";

export default function ReportView({ report, onReset }) {
  if (!report) return null;

  return (
    <div className="card" style={{ marginTop: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          <FileText size={20} color="var(--primary)" /> Clinical Intake Report
        </h3>
        <button className="btn btn-primary" onClick={onReset} style={{ padding: "6px 12px", fontSize: "13px" }}>
          <RotateCcw size={14} /> New Call
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
        <tbody>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ padding: "8px 0", fontWeight: 600, width: "30%" }}>Patient Name:</td>
            <td style={{ padding: "8px 0" }}>{report.patientName}</td>
          </tr>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ padding: "8px 0", fontWeight: 600 }}>Main Concern:</td>
            <td style={{ padding: "8px 0" }}>{report.mainConcern}</td>
          </tr>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ padding: "8px 0", fontWeight: 600 }}>Duration:</td>
            <td style={{ padding: "8px 0" }}>{report.duration}</td>
          </tr>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ padding: "8px 0", fontWeight: 600 }}>Severity:</td>
            <td style={{ padding: "8px 0" }}>{report.severity}</td>
          </tr>
        </tbody>
      </table>

      {report.associatedSymptoms && report.associatedSymptoms.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <strong>Associated Symptoms:</strong>
          <ul style={{ margin: "6px 0 0 20px" }}>
            {report.associatedSymptoms.map((symptom, idx) => (
              <li key={idx}>{symptom}</li>
            ))}
          </ul>
        </div>
      )}

      {report.triageFlags && report.triageFlags.length > 0 && (
        <div style={{ marginBottom: "16px", background: "#fffbeb", padding: "12px", borderRadius: "8px", border: "1px solid #fef3c7" }}>
          <strong style={{ display: "flex", alignItems: "center", gap: "6px", color: "#b45309" }}>
            <AlertTriangle size={16} /> Triage & Follow-up Flags:
          </strong>
          <ul style={{ margin: "6px 0 0 20px", color: "#78350f" }}>
            {report.triageFlags.map((flag, idx) => (
              <li key={idx}>{flag}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
        <strong>Clinical Summary:</strong>
        <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: "14px" }}>{report.summary}</p>
      </div>
    </div>
  );
}