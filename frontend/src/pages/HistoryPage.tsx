import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

interface HistoryItem { id: number; filename: string; language: string; summary: string; analysis: string; created_at: string; }

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get('/history');
      setHistory(res.data);
    } catch {
      setHistory([]);
    }
  };

  const removeItem = async (id: number) => {
    try {
      await api.delete(`/history/${id}`);
      loadHistory();
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-vh-100 bg-dark text-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-black border-bottom border-secondary">
        <div className="container">
          <span className="navbar-brand fw-bold">CodeLens</span>
          <div className="ms-auto d-flex gap-2">
            <Link className="btn btn-outline-light" to="/dashboard">Dashboard</Link>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Back</button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        <h3 className="fw-bold">Analysis history</h3>
        <div className="row g-3 mt-1">
          {history.length ? history.map((item) => (
            <div className="col-md-6" key={item.id}>
              <div className="card bg-black border-secondary rounded-4 h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="fw-bold">{item.filename}</h6>
                      <p className="text-secondary small mb-2">{item.language}</p>
                    </div>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => removeItem(item.id)}>Delete</button>
                  </div>
                  <p className="small">{item.summary}</p>
                  <p className="text-secondary small">{new Date(item.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )) : <div className="col-12"><div className="alert alert-secondary">No saved analysis history yet.</div></div>}
        </div>
      </div>
    </div>
  );
}
