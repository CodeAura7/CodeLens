import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-vh-100 bg-dark text-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-black border-bottom border-secondary">
        <div className="container">
          <span className="navbar-brand fw-bold">CodeLens</span>
          <div className="ms-auto">
            <Link className="btn btn-outline-light me-2" to="/login">Login</Link>
            <Link className="btn btn-primary" to="/register">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="container py-5">
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <h1 className="display-4 fw-bold">Understand code with clarity and confidence.</h1>
            <p className="lead text-secondary">Upload a source file, get AI-backed explanations, review complexity, bugs, and interview-ready insights in one place.</p>
            <div className="d-flex gap-3">
              <Link className="btn btn-primary btn-lg" to="/register">Start Analyzing</Link>
              <Link className="btn btn-outline-light btn-lg" to="/dashboard">Open Dashboard</Link>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="card bg-secondary-subtle text-dark p-4 shadow-lg rounded-4">
              <h5 className="fw-bold">What CodeLens delivers</h5>
              <ul className="mb-0">
                <li>Readable summaries</li>
                <li>Bug and complexity analysis</li>
                <li>Interview preparation</li>
                <li>History tracking and reusable insights</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-5">
        <div className="row g-4">
          {['AI explanations', 'Secure analysis history', 'Responsive experience'].map((feature) => (
            <div className="col-md-4" key={feature}>
              <div className="card h-100 bg-black border-secondary text-light rounded-4">
                <div className="card-body">
                  <h5>{feature}</h5>
                  <p className="text-secondary">A polished experience for students, developers, and interview candidates alike.</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-top border-secondary py-4 mt-5 text-center text-secondary">
        © 2026 CodeLens. Built for thoughtful code review.
      </footer>
    </div>
  );
}
