from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Float

from database import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)

    # Log Customer Complaint form fields (AI-extracted, human-editable)
    customer_name = Column(String(255), nullable=True)
    product_name = Column(String(255), nullable=True)
    batch_number = Column(String(100), nullable=True)
    complaint_category = Column(String(100), nullable=True)  # e.g. Quality, Packaging, Efficacy, Adverse Event
    complaint_description = Column(Text, nullable=True)
    date_received = Column(String(50), nullable=True)
    reported_via = Column(String(50), nullable=True)  # email / phone / portal / pdf

    # AI Copilot Risk Assessment fields
    risk_level = Column(String(20), nullable=True)  # Low / Medium / High / Critical
    risk_score = Column(Float, nullable=True)  # 0-100
    risk_justification = Column(Text, nullable=True)
    is_adverse_event = Column(String(10), nullable=True)  # "true"/"false" as string for simplicity

    # Bonus AI features
    completeness_status = Column(String(20), nullable=True)  # Complete / Incomplete
    missing_fields = Column(Text, nullable=True)  # comma-separated
    ai_summary = Column(Text, nullable=True)
    capa_recommendation = Column(Text, nullable=True)
    root_cause_hint = Column(Text, nullable=True)

    raw_input_text = Column(Text, nullable=True)  # original pasted/parsed text, for audit trail

    created_at = Column(DateTime, default=datetime.utcnow)
