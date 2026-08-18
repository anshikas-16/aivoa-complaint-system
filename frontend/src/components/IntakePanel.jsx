import { useDispatch, useSelector } from "react-redux";
import { setRawText, analyzeText, analyzeFile } from "../store/complaintSlice";

const SAMPLE_COMPLAINT = `From: procurement@meridianpharma.com
Subject: Quality complaint - Amoxicillin API batch AMX-2607-B

Hi team,

We received batch AMX-2607-B of Amoxicillin Trihydrate API on Aug 12, 2026 and
noticed the powder has a slight yellow discoloration compared to the reference
standard (should be white to off-white). This is from Meridian Pharma
Distributors, contact person Rohan Kapoor.

We have not released this batch to manufacturing yet. Please advise on
whether this affects potency and if a replacement or COA re-verification is
needed. No patient exposure has occurred.

Thanks,
Rohan Kapoor
Meridian Pharma Distributors`;

export default function IntakePanel() {
  const dispatch = useDispatch();
  const { rawText, status } = useSelector((s) => s.complaint);
  const isAnalyzing = status === "analyzing";

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) dispatch(analyzeFile(file));
    e.target.value = "";
  };

  return (
    <div className="panel">
      <div className="panel-title">
        <span className="num">1</span> Complaint Intake
        <button
          type="button"
          className="sample-link"
          onClick={() => dispatch(setRawText(SAMPLE_COMPLAINT))}
        >
          load sample
        </button>
      </div>

      <textarea
        className="intake"
        placeholder="Paste the customer complaint text (email, call transcript, portal submission)..."
        value={rawText}
        onChange={(e) => dispatch(setRawText(e.target.value))}
      />

      <div className="intake-actions">
        <button
          type="button"
          className="btn-primary"
          disabled={!rawText.trim() || isAnalyzing}
          onClick={() => dispatch(analyzeText(rawText))}
        >
          {isAnalyzing ? "Analyzing..." : "Run AI Analysis"}
        </button>

        <label className="file-btn">
          <input type="file" accept=".pdf,.txt" onChange={handleFileChange} />
          Upload PDF / .txt
        </label>
      </div>
      <p className="helper-text">
        LangGraph pipeline: extract fields → check completeness → assess risk → summarize + recommend CAPA.
      </p>
    </div>
  );
}
