"""
DiaCare AI — Pydantic Data Contracts & Schemas
==============================================
Phase 1: Architecture & Data Exchange Schemas
"""

from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# 1. Extracted Medical Parameters
# ---------------------------------------------------------------------------
class ExtractedParameter(BaseModel):
    parameter_name: str = Field(..., description="Recognized clinical parameter, e.g. HbA1c, Fasting Blood Glucose")
    raw_name_in_document: Optional[str] = Field(None, description="Exact label string as printed on the lab report")
    extracted_value: float = Field(..., description="Numeric measurement parsed from report")
    unit: str = Field(..., description="Measurement unit (e.g. %, mg/dL, mmol/L)")
    reference_range: Optional[str] = Field(None, description="Laboratory-specific reference range printed on report")
    standard_reference: Optional[str] = Field(None, description="Clinical guideline standard range (ADA/ICMR)")
    is_abnormal: bool = Field(False, description="Flag indicating value falls outside reference boundary")
    clinical_interpretation: Optional[str] = Field(None, description="High, Low, Optimal, Impaired")
    layperson_explanation: Optional[str] = Field(None, description="Simple understandable explanation of what this test means")
    report_date: Optional[str] = Field(None, description="Sampling date parsed from report header")
    extraction_confidence: float = Field(1.0, ge=0.0, le=1.0, description="OCR & regex parsing confidence score")
    source_page_location: Optional[str] = Field(None, description="Page number or bounding section")


# ---------------------------------------------------------------------------
# 2. Medical Report Analysis Contract
# ---------------------------------------------------------------------------
class ReportAnalysisResponse(BaseModel):
    report_id: str = Field(..., description="Unique UUID identifier for this report session")
    original_filename: str
    file_type: str
    file_size_bytes: int
    upload_date: datetime = Field(default_factory=datetime.utcnow)
    extracted_parameters: List[ExtractedParameter] = Field(default_factory=list)
    abnormal_count: int = Field(0, description="Total number of parameters flagged outside standard ranges")
    overall_summary: str = Field(..., description="Plain-language clinical synthesis of the uploaded findings")
    suggested_doctor_questions: List[str] = Field(default_factory=list, description="Specific questions the patient can ask their physician")
    limitations: str = Field(..., description="Explicit statement of document quality limitations and non-diagnostic nature")
    processing_status: Literal["completed", "partial", "unclear_image", "failed"] = "completed"


# ---------------------------------------------------------------------------
# 3. RAG Knowledge Citations
# ---------------------------------------------------------------------------
class MedicalCitation(BaseModel):
    organization: str
    document_title: str
    section_name: Optional[str] = None
    source_url: str
    relevance_snippet: Optional[str] = None


# ---------------------------------------------------------------------------
# 4. Chat System Contracts
# ---------------------------------------------------------------------------
class ChatMessage(BaseModel):
    message_id: str
    sender: Literal["user", "assistant", "system"]
    message: str
    citations: List[MedicalCitation] = Field(default_factory=list)
    is_emergency: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User's health question or report query")
    conversation_id: Optional[str] = Field(None, description="Existing conversation UUID (or None to start new)")
    report_id: Optional[str] = Field(None, description="Optional report ID to ground conversation in user's lab values")
    language: Optional[Literal["en", "hi"]] = Field("en", description="'en' for English, 'hi' for Hindi")
    detail_level: Optional[Literal["simple", "detailed", "bullet_points"]] = Field("simple", description="Desired depth of explanation")


class ChatResponse(BaseModel):
    conversation_id: str
    message: str
    sender: Literal["assistant"] = "assistant"
    citations: List[MedicalCitation] = Field(default_factory=list)
    is_emergency: bool = False
    emergency_contacts: Optional[Dict[str, str]] = None
    suggested_followups: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------------------------------
# 5. Conversation Management
# ---------------------------------------------------------------------------
class ConversationSummary(BaseModel):
    conversation_id: str
    title: str
    report_id: Optional[str] = None
    report_filename: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    message_count: int


class ConversationDetail(BaseModel):
    conversation_id: str
    title: str
    report_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessage] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# 6. Authoritative Knowledge Source Metadata
# ---------------------------------------------------------------------------
class MedicalSourceItem(BaseModel):
    organization: str
    document_title: str
    document_version: Optional[str] = None
    source_url: str
    scope: str
    last_verified: Optional[str] = None

