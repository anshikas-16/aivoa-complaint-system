import { useSelector } from "react-redux";

export default function RiskAssessment() {
  const { copilot, status, error } = useSelector((s) => s.complaint);
  const hasResult = copilot.risk_level != null;

  return (
    <div className="panel">
      <div className="panel-title">
        <span className="num">3</span> AI Copilot Risk Assessment
      </div>

      {status === "error" && <div className="error-banner">{error}</div>}

      {!hasResult && status !== "error" && (
        <div className="empty-copilot">
          Run AI analysis on a complaint to see risk classification,
          completeness check, and CAPA recommendation here.
        </div>
      )}

      {hasResult && (
        <>
          <div className={`risk-stamp risk-${copilot.risk_level}`}>
            <div className="risk-stamp-top">
              <span className="risk-level-text">{copilot.risk_level} RISK</span>
              <span className="risk-score">score {Math.round(copilot.risk_score ?? 0)}/100</span>
            </div>
            <p className="risk-justification">{copilot.risk_justification}</p>
            {copilot.is_adverse_event === "true" && (
              <div className="adverse-flag">⚠ POTENTIAL ADVERSE EVENT</div>
            )}
          </div>

          <span className={`completeness-badge ${copilot.completeness_status}`}>
            {copilot.completeness_status === "Incomplete"
              ? `Incomplete — missing: ${copilot.missing_fields}`
              : "Complete record"}
          </span>

          <div className="copilot-sub">
            <h4>Summary</h4>
            <p>{copilot.ai_summary}</p>

            <h4>Root Cause Hint</h4>
            <p>{copilot.root_cause_hint}</p>

            <h4>CAPA Recommendation</h4>
            <p>{copilot.capa_recommendation}</p>
          </div>
        </>
      )}
    </div>
  );
}
