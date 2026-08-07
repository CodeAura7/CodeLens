import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-vh-100 bg-dark text-light d-flex align-items-center justify-content-center">
      <div className="text-center">
        <h1 className="display-1 fw-bold">404</h1>
        <p className="text-secondary">The page you are looking for does not exist.</p>
        <Link className="btn btn-primary" to="/">Back home</Link>
      </div>
    </div>
  );
}
