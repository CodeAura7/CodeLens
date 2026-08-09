import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import mermaid from 'mermaid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { AnalysisResult } from '../types';
import api from '../services/api';

interface HistoryAnalysisState {
  result?: AnalysisResult;
  filename?: string;
  language?: string;
  content?: string;
}

export default function AnalysisPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const state = location.state as HistoryAnalysisState | undefined;
  const [result, setResult] = useState<AnalysisResult | null>(state?.result ?? null);
  const [filename, setFilename] = useState(state?.filename ?? '');
  const [language, setLanguage] = useState(state?.language ?? '');
  const [content, setContent] = useState(state?.content ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [flowchartError, setFlowchartError] = useState('');
  const flowchartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!result && params.id) {
      const loadHistory = async () => {
        setLoading(true);
        setError('');
        try {
          const res = await api.get(`/history/${params.id}`);
          const data = res.data as { filename: string; language: string; analysis: string };
          const parsedAnalysis = JSON.parse(data.analysis) as AnalysisResult & { source_code?: string };
          setResult(parsedAnalysis);
          setFilename(data.filename);
          setLanguage(data.language);
          setContent(parsedAnalysis.source_code ?? '');
        } catch (err: any) {
          setError(err.response?.data?.detail || 'Failed to load analysis report.');
        } finally {
          setLoading(false);
        }
      };

      loadHistory();
    }
  }, [params.id, result]);

  useEffect(() => {
    if (!result?.flowchart || !flowchartRef.current) {
      return;
    }

    const diagramText = result.flowchart.trim();
    const renderId = `mermaid-${params.id ?? 'analysis'}-${Date.now()}`;
    setFlowchartError('');
    flowchartRef.current.innerHTML = '';

    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: false,
      },
      themeVariables: {
        primaryColor: '#0f172a',
        secondaryColor: '#111827',
        tertiaryColor: '#1f2937',
        primaryTextColor: '#f8fafc',
        lineColor: '#9ca3af',
        nodeTextColor: '#f8fafc',
        textColor: '#f8fafc',
        clusterBkg: '#111827',
      },
    });

    mermaid.render(renderId, diagramText)
      .then((renderResult) => {
        if (flowchartRef.current) {
          flowchartRef.current.innerHTML = renderResult.svg;
        }
      })
      .catch((err: unknown) => {
        console.error('Mermaid render failed', err);
        setFlowchartError('The flowchart could not be rendered. Showing raw Mermaid text instead.');
        if (flowchartRef.current) {
          flowchartRef.current.innerHTML = '';
        }
      });
  }, [params.id, result]);

  if (loading) {
    return (
      <div className="min-vh-100 bg-dark text-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-light" role="status"></div>
          <p className="mt-3">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-vh-100 bg-dark text-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h3>{error || 'No analysis available'}</h3>
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
            <p className="text-secondary mb-0">{filename || 'Code review'}</p>
          </div>
          <button className="btn btn-outline-light" onClick={() => navigate('/dashboard')}>Back</button>
        </div>

        <div className="row g-4">
          <div className="col-lg-5">
            <div className="card bg-black border-secondary rounded-4 p-3 h-100">
              <h5 className="fw-bold mb-3">Uploaded code</h5>
              <div className="text-secondary small mb-2">{filename || 'Uploaded file'}</div>
              <SyntaxHighlighter language={(language || 'text').toLowerCase()} style={oneDark} showLineNumbers wrapLongLines>
                {content || ''}
              </SyntaxHighlighter>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="card bg-black border-secondary rounded-4 p-3 analysis-report-content">
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
                {flowchartError ? (
                  <div className="text-warning mb-3">{flowchartError}</div>
                ) : null}
                <div className="flowchart-container p-3 rounded-3">
                  <div className="flowchart-graph" ref={flowchartRef} />
                </div>
                {flowchartError ? (
                  <pre className="flowchart-container flowchart-raw mt-3 p-3 rounded-3">{result.flowchart}</pre>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
