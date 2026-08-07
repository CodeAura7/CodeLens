import { useLocation, useNavigate } from 'react-router-dom';
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold">Analysis report</h2>
            <p className="text-secondary mb-0">{state?.filename || 'Code review'}</p>
          </div>
          <button className="btn btn-outline-light" onClick={() => navigate('/dashboard')}>Back</button>
        </div>
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="card bg-black border-secondary rounded-4 p-3">
              <h5 className="fw-bold">Uploaded code</h5>
              <pre className="bg-secondary-subtle text-dark p-3 rounded-3" style={{ whiteSpace: 'pre-wrap' }}>{state?.content || ''}</pre>
            </div>
          </div>
          <div className="col-lg-7">
            <div className="card bg-black border-secondary rounded-4 p-3">
              <ul className="nav nav-tabs nav-tabs-dark">
                {['Summary', 'Explanation', 'Complexity', 'Bugs', 'Improvements', 'Interview Questions', 'Flowchart'].map((tab) => (
                  <li className="nav-item" key={tab}><a className="nav-link text-light" href="#">{tab}</a></li>
                ))}
              </ul>
              <div className="mt-3">
                <h5 className="fw-bold">Summary</h5>
                <p>{result.summary}</p>
                <h5 className="fw-bold mt-4">Explanation</h5>
                <ul>{result.explanation.map((item) => <li key={item}>{item}</li>)}</ul>
                <h5 className="fw-bold mt-4">Complexity</h5>
                <p>Time: {result.complexity.time}</p>
                <p>Space: {result.complexity.space}</p>
                <h5 className="fw-bold mt-4">Bugs</h5>
                <ul>{result.bugs.map((bug) => <li key={bug.issue}>{bug.issue} ({bug.severity})</li>)}</ul>
                <h5 className="fw-bold mt-4">Improvements</h5>
                <ul>{result.improvements.map((item) => <li key={item}>{item}</li>)}</ul>
                <h5 className="fw-bold mt-4">Interview Questions</h5>
                <ul>{result.interview_questions.map((q) => <li key={q.question}><strong>{q.question}</strong><br />{q.answer} <span className="text-secondary">[{q.difficulty}]</span></li>)}</ul>
                <h5 className="fw-bold mt-4">Flowchart</h5>
                <pre className="bg-secondary-subtle text-dark p-3 rounded-3">{result.flowchart}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
