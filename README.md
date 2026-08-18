# AIVOA — AI-Powered Customer Complaint Management System

Round 1 take-home: AI Product Engineer (Interns). Pharmaceutical (API/FDF) customer
complaint intake, built with the mandated stack:
**React + Redux · FastAPI · LangGraph · Groq (gemma2-9b-it) · Google Inter font**

---

## Quick start (two terminals)

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# edit .env and paste your Groq key from https://console.groq.com
uvicorn main:app --port 8000
```

Runs on `http://127.0.0.1:8000`. SQLite by default (zero setup) — swap
`DATABASE_URL` in `.env` for Postgres/MySQL if you want that for submission.
Interactive API docs at `http://127.0.0.1:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`. Click **"load sample"** in the intake panel
to try it instantly, or paste your own complaint text / upload a PDF.

---

## How it works

```
Complaint text/PDF
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│  LangGraph workflow  (backend/agents/graph.py)                │
│                                                                 │
│  extract_fields → check_completeness → assess_risk            │
│                                              │                 │
│                                              ▼                 │
│                                   summarize_and_recommend      │
└─────────────────────────────────────────────────────────────┘
      │
      ▼
Populates "Log Customer Complaint" form + "AI Copilot Risk Assessment" panel
      │
      ▼
Human reviews/edits → Save → stored in DB → shown in Complaint Log table
```

Each node is one Groq call (`backend/agents/groq_client.py`), forced to return
structured JSON via `response_format={"type": "json_object"}`, with automatic
fallback from `gemma2-9b-it` to `llama-3.3-70b-versatile` if the first model errors.

**Bonus AI features implemented** (all "free" — same LLM calls, extra fields):
completeness checker, root cause hint, CAPA recommendation, AI summary,
adverse-event flag.

---

## Project structure

```
backend/
  main.py                 FastAPI app entrypoint, CORS, router registration
  database.py              SQLAlchemy engine/session (SQLite by default)
  models.py                 Complaint table
  schemas.py                 Pydantic request/response models
  agents/
    graph.py                  LangGraph workflow — the core AI Agent Framework piece
    groq_client.py              Groq wrapper w/ JSON-mode + model fallback
  routers/
    ai.py                        POST /api/ai/analyze-text, /analyze-file
    complaints.py                  CRUD for saved complaint records
  utils/
    document_parser.py              Minimal PDF/text extraction (pypdf)

frontend/
  src/
    App.jsx                  Layout: intake → form + risk panel → log table
    store/                     Redux Toolkit slice + store (async thunks call the API)
    components/
      IntakePanel.jsx            Paste text / upload PDF, "Run AI Analysis"
      ComplaintForm.jsx           Editable "Log Customer Complaint" fields
      RiskAssessment.jsx           "AI Copilot Risk Assessment" — severity-stamped card
      ComplaintLog.jsx              Table of saved records
    index.css                  Design tokens — clinical QMS look, Inter + JetBrains Mono
```

---

## For your demo video walkthrough

The assignment wants you to explain the full path: frontend input → API →
backend → LangGraph → form population. Suggested walkthrough order:

1. **Frontend trigger**: `IntakePanel.jsx` — paste/upload calls `analyzeText`/`analyzeFile`
   thunks in `complaintSlice.js`.
2. **API call**: `src/api/api.js` → `POST /api/ai/analyze-text` (or `/analyze-file`).
3. **Backend route**: `routers/ai.py` receives it, calls `run_complaint_workflow()`.
4. **LangGraph workflow**: `agents/graph.py` — walk through the 4 nodes and show
   `build_graph()` wiring them with `add_edge`. This is your "AI Agent Framework:
   LangGraph" requirement — point at it explicitly.
5. **Groq call**: `agents/groq_client.py` — JSON-mode extraction, model fallback.
6. **Response flows back**: Redux `applyAnalysis` reducer populates `form` and
   `copilot` state → `ComplaintForm.jsx` and `RiskAssessment.jsx` re-render.
7. **Save**: `ComplaintForm`'s Save button → `POST /api/complaints` → SQLAlchemy
   writes to DB → `ComplaintLog.jsx` refetches and shows it in the table.

## What's intentionally minimal (per the brief)

- OCR/PDF parsing is basic text extraction only — the brief explicitly says
  production-grade parsing isn't required.
- No auth — out of scope for a take-home demo.
- SQLite instead of a running Postgres/MySQL instance, since the brief lists
  "MySQL/Postgres SQL" and SQLAlchemy makes swapping trivial (one env var) —
  mention this trade-off if asked in the interview.
