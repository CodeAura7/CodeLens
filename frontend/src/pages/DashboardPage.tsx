import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface HistorySummary { id: number; filename: string; language: string; summary: string; created_at: string; }

const supportedExtensions: Record<string, string> = {
  py: 'python',
  js: 'javascript',
  ts: 'typescript',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  cs: 'csharp',
  go: 'go',
  php: 'php',
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistorySummary[]>([]);
  const [filename, setFilename] = useState('sample.py');
  const [language, setLanguage] = useState('python');
  const [content, setContent] = useState('def greet(name):\n    return f"Hello {name}"\n');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get('/history');
      setHistory(res.data.slice(0, 4));
    } catch {
      setHistory([]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const detectedLanguage = supportedExtensions[extension] || 'text';

    setFilename(file.name);
    setLanguage(detectedLanguage);
    setSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setContent(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/analyze', { filename, language, content });
      setMessage('Analysis ready');
      if (res.data.history_id) {
        navigate(`/analyze/${res.data.history_id}`);
      } else {
        navigate('/analyze', { state: { result: res.data.result, filename, language, content } });
      }
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Unable to analyze the file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-dark text-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-black border-bottom border-secondary">
        <div className="container">
          <span className="navbar-brand fw-bold">CodeLens</span>
          <div className="ms-auto d-flex gap-2">
            <Link className="btn btn-outline-light" to="/history">History</Link>
            <Link className="btn btn-outline-light" to="/profile">Profile</Link>
            <button className="btn btn-primary" onClick={() => { logout(); navigate('/'); }}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card bg-black border-secondary rounded-4 p-4">
              <h3 className="fw-bold">Analyze a file</h3>
              <p className="text-secondary">Upload source code and receive a polished analysis experience in seconds.</p>
              <form onSubmit={handleAnalyze}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Upload source file</label>
                    <input className="form-control" type="file" accept=".py,.js,.ts,.java,.cpp,.c,.cs,.go,.php" onChange={handleFileChange} required />
                    {selectedFileName ? <div className="form-text text-info">Loaded: {selectedFileName}</div> : null}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Language</label>
                    <input className="form-control" value={language} onChange={(e) => setLanguage(e.target.value)} required />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="form-label">Selected code</label>
                  <textarea className="form-control" rows={12} value={content} onChange={(e) => setContent(e.target.value)} required />
                </div>
                <div className="mt-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? (
                      <span className="d-flex align-items-center gap-2">
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Analyzing with Gemini...
                      </span>
                    ) : (
                      'Analyze'
                    )}
                  </button>
                  {message ? <span className={message.includes('Unable') ? 'text-warning' : 'text-info'}>{message}</span> : null}
                </div>
              </form>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card bg-black border-secondary rounded-4 p-4 h-100">
              <h5 className="fw-bold">Quick stats</h5>
              <div className="d-flex justify-content-between border-bottom border-secondary py-2">
                <span className="text-secondary">User</span>
                <span>{user?.name || 'Guest'}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom border-secondary py-2">
                <span className="text-secondary">Recent analyses</span>
                <span>{history.length}</span>
              </div>
              <div className="d-flex justify-content-between py-2">
                <span className="text-secondary">Status</span>
                <span className="text-success">Ready</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="fw-bold">Recent analyses</h4>
          <div className="row g-3 mt-1">
            {history.length ? history.map((item) => (
              <div className="col-md-6 col-xl-3" key={item.id}>
                <div className="card bg-black border-secondary rounded-4 h-100 analysis-card" role="button" onClick={() => navigate(`/analyze/${item.id}`)}>
                  <div className="card-body">
                    <h6 className="fw-bold">{item.filename}</h6>
                    <p className="text-secondary small mb-2">{item.language}</p>
                    <p className="small">{item.summary}</p>
                  </div>
                </div>
              </div>
            )) : <div className="col-12"><div className="alert alert-secondary">No analyses yet. Start by analyzing a file.</div></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
