from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi import Form

from schemas import AnalyzeRequest, AnalyzeResponse
from agents.graph import run_complaint_workflow
from utils.document_parser import extract_text_from_upload

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/analyze-text", response_model=AnalyzeResponse)
def analyze_text(payload: AnalyzeRequest):
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="text must not be empty")
    result = run_complaint_workflow(payload.text)
    return result


@router.post("/analyze-file", response_model=AnalyzeResponse)
async def analyze_file(file: UploadFile = File(...)):
    content = await file.read()
    text = extract_text_from_upload(file.filename, content)
    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract any text from this file. Try pasting the text instead.",
        )
    result = run_complaint_workflow(text)
    return result
