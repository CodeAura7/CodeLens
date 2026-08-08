import { useLocation, useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { AnalysisResult } from '../types';

export default function AnalysisPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { result?: AnalysisResult; filename?: string; language?: string; content?: string } | undefined;

  const result = state?.result;

  if (!result) {
    return (
      <div className="min-vh-100 bg-dark text-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h3>No analysis available</h3>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-dark text-light">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 className="fw-bold mb-1">Analysis report</h2>
            <p className="text-secondary mb-0">{state?.filename || 'Code review'}</p>
          </div>
          <button className="btn btn-outline-light" onClick={() => navigate('/dashboard')}>Back</button>
        </div>

        <div className="row g-4">
          <div className="col-lg-5">
            <div className="card bg-black border-secondary rounded-4 p-3 h-100">
              <h5 className="fw-bold mb-3">Uploaded code</h5>
              <div className="text-secondary small mb-2">{state?.filename || 'Uploaded file'}</div>
              <SyntaxHighlighter language={(state?.language || 'text').toLowerCase()} style={oneDark} showLineNumbers wrapLongLines>
                {state?.content || ''}
              </SyntaxHighlighter>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="card bg-black border-secondary rounded-4 p-3">
              <div className="card-body p-0">
                <h5 className="fw-bold mb-3">Gemini review</h5>
                <div className="mb-4 p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary-subtle">
                  <h6 className="fw-bold">Summary</h6>
                  <p className="mb-0">{result.summary}</p>
                </div>

                <h6 className="fw-bold">Step-by-step explanation</h6>
                <ul>{result.explanation.map((item) => <li key={item}>{item}</li>)}</ul>

                <h6 className="fw-bold mt-4">Complexity</h6>
                <p className="mb-1">Time: {result.complexity.time}</p>
                <p className="mb-0">Space: {result.complexity.space}</p>

                <h6 className="fw-bold mt-4">Possible bugs</h6>
                <ul>{result.bugs.map((bug) => <li key={bug.issue}>{bug.issue} <span className="text-secondary">({bug.severity})</span></li>)}</ul>

                <h6 className="fw-bold mt-4">Improvement suggestions</h6>
                <ul>{result.improvements.map((item) => <li key={item}>{item}</li>)}</ul>

                <h6 className="fw-bold mt-4">Interview questions</h6>
                <ul>{result.interview_questions.map((q) => <li key={q.question}><strong>{q.question}</strong><br />{q.answer} <span className="text-secondary">[{q.difficulty}]</span></li>)}</ul>

                <h6 className="fw-bold mt-4">Flowchart</h6>
                <pre className="bg-secondary-subtle text-dark p-3 rounded-3">{result.flowchart}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
