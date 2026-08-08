from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.analysis import AnalysisRequest, HistoryEntry
from app.services.analysis_service import build_analysis_payload, save_history
from app.models.history import History
from app.models.user import User
from app.utils.security import decode_access_token

router = APIRouter(prefix="", tags=["analysis"])
security = HTTPBearer()


@router.post("/upload")
def upload(payload: AnalysisRequest, credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload_data = decode_access_token(credentials.credentials)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from exc

    user_id = int(payload_data.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not payload.filename.lower().endswith(tuple([".py", ".js", ".ts", ".java", ".cpp", ".c", ".cs", ".go", ".php"])):
        raise HTTPException(status_code=400, detail="Unsupported file type")
    if len(payload.content.encode("utf-8")) > 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 1MB")
    if not payload.content.strip():
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        result = build_analysis_payload(payload)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="Unable to analyze the file right now. Please verify the Gemini API key and try again.",
        ) from exc

    save_history(db, user.id, payload, result)
    return {"message": "Analysis completed", "result": result}


@router.post("/analyze")
def analyze(payload: AnalysisRequest, credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload_data = decode_access_token(credentials.credentials)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from exc

    user_id = int(payload_data.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not payload.filename.lower().endswith(tuple([".py", ".js", ".ts", ".java", ".cpp", ".c", ".cs", ".go", ".php"])):
        raise HTTPException(status_code=400, detail="Unsupported file type")
    if len(payload.content.encode("utf-8")) > 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 1MB")
    if not payload.content.strip():
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        result = build_analysis_payload(payload)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="Unable to analyze the file right now. Please verify the Gemini API key and try again.",
        ) from exc

    save_history(db, user.id, payload, result)
    return {"message": "Analysis completed", "result": result}


@router.get("/history", response_model=list[HistoryEntry])
def history_list(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload_data = decode_access_token(credentials.credentials)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from exc

    user_id = int(payload_data.get("sub"))
    records = db.query(History).filter(History.user_id == user_id).order_by(History.id.desc()).all()
    return records


@router.get("/history/{history_id}", response_model=HistoryEntry)
def history_detail(history_id: int, credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload_data = decode_access_token(credentials.credentials)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from exc

    user_id = int(payload_data.get("sub"))
    record = db.query(History).filter(History.id == history_id, History.user_id == user_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="History not found")
    return record


@router.delete("/history/{history_id}")
def delete_history(history_id: int, credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload_data = decode_access_token(credentials.credentials)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from exc

    user_id = int(payload_data.get("sub"))
    record = db.query(History).filter(History.id == history_id, History.user_id == user_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="History not found")
    db.delete(record)
    db.commit()
    return {"message": "History item deleted"}
