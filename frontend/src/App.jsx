import { useSelector } from "react-redux";
import IntakePanel from "./components/IntakePanel";
import ComplaintForm from "./components/ComplaintForm";
import RiskAssessment from "./components/RiskAssessment";
import ComplaintLog from "./components/ComplaintLog";

export default function App() {
  const logCount = useSelector((s) => s.complaint.log.length);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">AIVOA</span>
          <div>
            <h1>Customer Complaint Management System</h1>
            <div className="subtitle">Pharmaceutical QMS — API / FDF complaint intake, powered by LangGraph + Groq</div>
          </div>
        </div>
        <div className="record-count">{logCount} record{logCount === 1 ? "" : "s"} logged</div>
      </header>

      <IntakePanel />

      <div className="grid-two" style={{ marginTop: 20 }}>
        <ComplaintForm />
        <RiskAssessment />
      </div>

      <ComplaintLog />
    </div>
  );
}
