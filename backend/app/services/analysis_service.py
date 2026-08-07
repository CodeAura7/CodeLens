import json
import os
from typing import Dict, Any

from sqlalchemy.orm import Session

from app.models.history import History
from app.schemas.analysis import AnalysisRequest


def build_analysis_payload(payload: AnalysisRequest) -> Dict[str, Any]:
    content = payload.content
    lines = content.splitlines()
    function_names = [line.strip() for line in lines if line.strip().startswith(("def ", "function ", "public ", "private "))]
    variable_names = [line.strip() for line in lines if "=" in line and not line.strip().startswith(("#", "//", "/*"))]

    summary = f"Reviewed {payload.filename} written in {payload.language}."
    explanation = [
        "The code appears to define core logic and data flow through a few functions and variables.",
        "The structure is readable, but naming and documentation can be improved for maintainability.",
    ]
    complexity = "O(n)" if len(lines) > 0 else "Not applicable"
    bugs = [
        {"issue": "Possible missing edge-case handling", "severity": "Medium"},
        {"issue": "Variable names may need clarity", "severity": "Low"},
    ]
    improvements = [
        "Use clearer naming for variables and functions.",
        "Add comments to explain non-obvious logic.",
        "Break large functions into smaller helpers.",
    ]
    interview_questions = [
        {"question": "How would you improve the readability of this code?", "answer": "Use descriptive names and small functions.", "difficulty": "Easy"},
        {"question": "What would you check first for potential bugs?", "answer": "Review edge cases and input validation.", "difficulty": "Medium"},
    ]
    flowchart = "graph TD\nA[Start] --> B[Process Input]\nB --> C[Apply Logic]\nC --> D[Return Result]"

    return {
        "summary": summary,
        "explanation": explanation,
        "function_explanation": function_names[:3],
        "variable_explanation": variable_names[:5],
        "data_flow": "Data moves from input through processing steps to the final output.",
        "beginner_explanation": "This code likely performs a straightforward transformation of input data.",
        "intermediate_explanation": "The solution is structured around a small set of operations and should be easy to extend.",
        "senior_explanation": "The implementation is acceptable but would benefit from stronger validation and clearer decomposition.",
        "complexity": {"time": complexity, "space": "O(1)"},
        "bugs": bugs,
        "improvements": improvements[:5],
        "interview_questions": interview_questions,
        "flowchart": flowchart,
        "scores": {
            "readability": 82,
            "maintainability": 76,
            "naming": 74,
            "documentation": 68,
            "overall": 75,
        },
    }


def save_history(db: Session, user_id: int, payload: AnalysisRequest, result: Dict[str, Any]):
    record = History(
        user_id=user_id,
        filename=payload.filename,
        language=payload.language,
        summary=result.get("summary", ""),
        analysis=json.dumps(result),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
