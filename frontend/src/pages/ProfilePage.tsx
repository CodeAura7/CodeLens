import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="min-vh-100 bg-dark text-light d-flex align-items-center justify-content-center">
      <div className="card bg-black border-secondary rounded-4 p-4" style={{ width: '100%', maxWidth: 480 }}>
        <h3 className="fw-bold">Profile</h3>
        <p className="text-secondary">Your account details are protected by JWT authentication.</p>
        <div className="mt-3">
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
        </div>
      </div>
    </div>
  );
}
