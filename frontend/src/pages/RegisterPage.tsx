import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', { name, email, password });
      const res = await api.post('/auth/login', { email, password });
      login(res.data.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unable to create your account.');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark text-light">
      <div className="card bg-black border-secondary p-4 rounded-4" style={{ width: '100%', maxWidth: 420 }}>
        <h3 className="fw-bold mb-3">Create your account</h3>
        <p className="text-secondary">Join CodeLens to begin reviewing source code.</p>
        <form onSubmit={handleSubmit}>
          {error ? <div className="alert alert-danger">{error}</div> : null}
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary w-100" type="submit">Register</button>
        </form>
        <p className="mt-3 text-secondary">Already have an account? <Link to="/login" className="text-light">Log in</Link></p>
      </div>
    </div>
  );
}
