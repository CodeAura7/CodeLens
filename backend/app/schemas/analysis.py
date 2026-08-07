from datetime import datetime
from pydantic import BaseModel, Field


class UploadRequest(BaseModel):
    filename: str
    language: str
    content: str = Field(min_length=1)


class AnalysisRequest(BaseModel):
    filename: str
    language: str
    content: str = Field(min_length=1)


class HistoryEntry(BaseModel):
    id: int
    filename: str
    language: str
    summary: str
    analysis: str
    created_at: datetime

    model_config = {"from_attributes": True}
