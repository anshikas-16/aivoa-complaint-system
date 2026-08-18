"""
LangGraph workflow for the AI Copilot.

Pipeline (each node is one Groq call):
  raw_text
    -> extract_fields        (fills the Log Customer Complaint form)
    -> check_completeness     (flags missing mandatory fields)
    -> assess_risk             (Low/Medium/High/Critical + adverse-event flag)
    -> summarize_and_recommend (summary, root cause hint, CAPA recommendation)
    -> END

Explain this graph in your demo video walkthrough -- it's the centerpiece
of the "AI Agent Framework: LangGraph" requirement.
"""

from typing import TypedDict, Optional
from langgraph.graph import StateGraph, END

from agents.groq_client import call_llm_json


class ComplaintState(TypedDict, total=False):
    raw_text: str

    customer_name: Optional[str]
    product_name: Optional[str]
    batch_number: Optional[str]
    complaint_category: Optional[str]
    complaint_description: Optional[str]
    date_received: Optional[str]
    reported_via: Optional[str]

    completeness_status: Optional[str]
    missing_fields: Optional[str]

    risk_level: Optional[str]
    risk_score: Optional[float]
    risk_justification: Optional[str]
    is_adverse_event: Optional[str]

    ai_summary: Optional[str]
    root_cause_hint: Optional[str]
    capa_recommendation: Optional[str]


# ---------------------------------------------------------------------------
# Node 1: Extract structured fields from free-text complaint
# ---------------------------------------------------------------------------
def extract_fields(state: ComplaintState) -> ComplaintState:
    system = (
        "You are a Quality Management System (QMS) intake assistant for a "
        "pharmaceutical (API/FDF) manufacturer. Extract structured fields "
        "from a raw customer complaint (email, call transcript, or form text). "
        "Respond ONLY with a JSON object using exactly these keys: "
        "customer_name, product_name, batch_number, complaint_category "
        "(one of: Quality, Packaging, Efficacy, Adverse Event, Delivery, Documentation, Other), "
        "complaint_description (concise 1-2 sentence restatement), "
        "date_received (ISO date if present else null), "
        "reported_via (one of: Email, Phone, Portal, PDF, Other). "
        "Use null for any field not present in the text. Do not invent data."
    )
    result = call_llm_json(system, state["raw_text"])
    state.update({k: result.get(k) for k in [
        "customer_name", "product_name", "batch_number", "complaint_category",
        "complaint_description", "date_received", "reported_via",
    ]})
    return state


# ---------------------------------------------------------------------------
# Node 2: Completeness Checker (bonus feature)
# ---------------------------------------------------------------------------
def check_completeness(state: ComplaintState) -> ComplaintState:
    required = ["customer_name", "product_name", "batch_number", "complaint_description"]
    missing = [f for f in required if not state.get(f)]
    state["completeness_status"] = "Incomplete" if missing else "Complete"
    state["missing_fields"] = ", ".join(missing) if missing else ""
    return state


# ---------------------------------------------------------------------------
# Node 3: AI Risk Classification (core "AI Copilot Risk Assessment")
# ---------------------------------------------------------------------------
def assess_risk(state: ComplaintState) -> ComplaintState:
    system = (
        "You are a pharmaceutical QA risk assessor. Given a customer complaint, "
        "classify its risk to patient safety and product quality. "
        "Respond ONLY with a JSON object with keys: "
        "risk_level (one of: Low, Medium, High, Critical), "
        "risk_score (number 0-100, higher = more severe), "
        "risk_justification (1-2 sentences explaining the classification), "
        "is_adverse_event (\"true\" or \"false\" string -- true if this describes "
        "a patient health/safety incident, not just a packaging or delivery issue)."
    )
    user = (
        f"Complaint description: {state.get('complaint_description') or state['raw_text']}\n"
        f"Category: {state.get('complaint_category')}\n"
        f"Product: {state.get('product_name')}"
    )
    result = call_llm_json(system, user)
    state["risk_level"] = result.get("risk_level")
    state["risk_score"] = result.get("risk_score")
    state["risk_justification"] = result.get("risk_justification")
    state["is_adverse_event"] = str(result.get("is_adverse_event", "false")).lower()
    return state


# ---------------------------------------------------------------------------
# Node 4: Summary + Root Cause Hint + CAPA Recommendation (bonus features)
# ---------------------------------------------------------------------------
def summarize_and_recommend(state: ComplaintState) -> ComplaintState:
    system = (
        "You are a QA copilot assisting a complaint reviewer. Given the complaint "
        "details and its risk assessment, respond ONLY with a JSON object with keys: "
        "ai_summary (2-3 sentence executive summary for a QA manager), "
        "root_cause_hint (1-2 sentence plausible root cause direction to investigate -- "
        "clearly speculative, for triage only), "
        "capa_recommendation (1-2 sentence suggested Corrective and Preventive Action)."
    )
    user = (
        f"Description: {state.get('complaint_description') or state['raw_text']}\n"
        f"Category: {state.get('complaint_category')}\n"
        f"Risk level: {state.get('risk_level')} (score {state.get('risk_score')})\n"
        f"Risk justification: {state.get('risk_justification')}"
    )
    result = call_llm_json(system, user)
    state["ai_summary"] = result.get("ai_summary")
    state["root_cause_hint"] = result.get("root_cause_hint")
    state["capa_recommendation"] = result.get("capa_recommendation")
    return state


def build_graph():
    graph = StateGraph(ComplaintState)
    graph.add_node("extract_fields", extract_fields)
    graph.add_node("check_completeness", check_completeness)
    graph.add_node("assess_risk", assess_risk)
    graph.add_node("summarize_and_recommend", summarize_and_recommend)

    graph.set_entry_point("extract_fields")
    graph.add_edge("extract_fields", "check_completeness")
    graph.add_edge("check_completeness", "assess_risk")
    graph.add_edge("assess_risk", "summarize_and_recommend")
    graph.add_edge("summarize_and_recommend", END)

    return graph.compile()


_compiled_graph = None


def run_complaint_workflow(raw_text: str) -> dict:
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_graph()
    final_state = _compiled_graph.invoke({"raw_text": raw_text})
    final_state["raw_input_text"] = raw_text
    return final_state
