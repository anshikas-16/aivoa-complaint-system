from typing import Optional
from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    text: str


class AnalyzeResponse(BaseModel):
    customer_name: Optional[str] = None
    product_name: Optional[str] = None
    batch_number: Optional[str] = None
    complaint_category: Optional[str] = None
    complaint_description: Optional[str] = None
    date_received: Optional[str] = None
    reported_via: Optional[str] = None

    risk_level: Optional[str] = None
    risk_score: Optional[float] = None
    risk_justification: Optional[str] = None
    is_adverse_event: Optional[str] = None

    completeness_status: Optional[str] = None
    missing_fields: Optional[str] = None
    ai_summary: Optional[str] = None
    capa_recommendation: Optional[str] = None
    root_cause_hint: Optional[str] = None

    raw_input_text: Optional[str] = None


class ComplaintCreate(AnalyzeResponse):
    pass


class ComplaintOut(ComplaintCreate):
    id: int

    class Config:
        from_attributes = True
