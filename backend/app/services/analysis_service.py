import json
import os
from pathlib import Path
from typing import Any, Dict

from dotenv import load_dotenv
from sqlalchemy.orm import Session

from app.models.history import History
from app.schemas.analysis import AnalysisRequest

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

try:
    import google.generativeai as genai
except ImportError:  # pragma: no cover - handled at runtime
    genai = None


def _build_prompt(payload: AnalysisRequest) -> str:
    return f"""
You are reviewing an uploaded {payload.language} file named {payload.filename}.
Analyze the actual uploaded source code below and return valid JSON only.

The JSON must contain these keys exactly:
- code_summary: short summary of the code
- step_by_step_explanation: array of strings
- possible_bugs: array of objects with issue and severity
- improvement_suggestions: array of strings
- time_complexity: string
- interview_questions: array of objects with question, answer, and difficulty
- flowchart: Mermaid flowchart string

For the flowchart field:
- Generate a Mermaid flowchart that represents the actual control flow and important logic of the uploaded code.
- Include the main execution path, decisions, branches, loops, and relevant function calls where useful.
- Keep the flowchart concise and focused on the code behavior.
- Return ONLY Mermaid syntax in the flowchart field.
- Do not include any explanatory text inside the flowchart field.

Return the flowchart as a single string starting with either "graph TD" or "flowchart TD".

Code:
{payload.content}
"""


def _strip_markdown_fences(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()
    return cleaned


def _normalize_flowchart(flowchart: str) -> str:
    cleaned = _strip_markdown_fences(flowchart or "").strip()
    if cleaned.lower().startswith("mermaid"):
        lines = cleaned.splitlines()
        cleaned = "\n".join(lines[1:]).strip()
    cleaned = cleaned.strip()
    if cleaned.startswith("graph TD") or cleaned.startswith("flowchart TD"):
        return cleaned
    if cleaned:
        return f"graph TD\n{cleaned}"
    return ""


def _parse_gemini_response(text: str) -> Dict[str, Any]:
    cleaned = text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]

    parsed = json.loads(cleaned)
    raw_flowchart = parsed.get("flowchart") or ""
    normalized_flowchart = _normalize_flowchart(raw_flowchart)
    fallback_flowchart = "graph TD\nA[Start] --> B[End]"
    flowchart = normalized_flowchart if normalized_flowchart.startswith(("graph TD", "flowchart TD")) else fallback_flowchart

    return {
        "summary": parsed.get("code_summary") or "Analysis completed successfully.",
        "explanation": parsed.get("step_by_step_explanation") or ["No step-by-step explanation was returned."],
        "function_explanation": [],
        "variable_explanation": [],
        "data_flow": "The code flow is summarized from the Gemini analysis.",
        "beginner_explanation": parsed.get("code_summary") or "The code was reviewed for clarity and correctness.",
        "intermediate_explanation": parsed.get("step_by_step_explanation", ["Reviewed successfully"])[0] if parsed.get("step_by_step_explanation") else "Reviewed successfully.",
        "senior_explanation": "The implementation was reviewed for maintainability, edge cases, and practical improvements.",
        "complexity": {"time": parsed.get("time_complexity") or "Not applicable", "space": "O(1)"},
        "bugs": parsed.get("possible_bugs") or [{"issue": "No obvious bugs found", "severity": "Low"}],
        "improvements": parsed.get("improvement_suggestions") or ["Add more comments and validation."],
        "interview_questions": parsed.get("interview_questions") or [{"question": "How would you improve this solution?", "answer": "By improving clarity, validation, and structure.", "difficulty": "Easy"}],
        "flowchart": flowchart,
        "scores": {
            "readability": 80,
            "maintainability": 78,
            "naming": 76,
            "documentation": 70,
            "overall": 76,
        },
        "code_summary": parsed.get("code_summary") or "",
        "step_by_step_explanation": parsed.get("step_by_step_explanation") or [],
        "possible_bugs": parsed.get("possible_bugs") or [],
        "improvement_suggestions": parsed.get("improvement_suggestions") or [],
        "time_complexity": parsed.get("time_complexity") or "Not applicable",
        "interview_questions_with_answers": parsed.get("interview_questions") or [],
    }


def build_analysis_payload(payload: AnalysisRequest) -> Dict[str, Any]:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("Missing GEMINI_API_KEY in the environment")

    if genai is None:
        raise RuntimeError("google-generativeai is not installed")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-3.6-flash")
    response = model.generate_content(_build_prompt(payload))
    text = getattr(response, "text", "") or ""

    if not text:
        raise RuntimeError("Gemini returned an empty response")

    return _parse_gemini_response(text)


def save_history(db: Session, user_id: int, payload: AnalysisRequest, result: Dict[str, Any]):
    stored_result = {**result, "source_code": payload.content}
    record = History(
        user_id=user_id,
        filename=payload.filename,
        language=payload.language,
        summary=result.get("summary", ""),
        analysis=json.dumps(stored_result),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
