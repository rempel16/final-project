import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignup = () => {
    // TODO: заменить на реальный API signup
    login('test-token');
    navigate('/', { replace: true });
  };

  return (
    <div style={{ padding: 24, display: 'grid', gap: 12, maxWidth: 420 }}>
      <h1 style={{ margin: 0 }}>Signup</h1>
      <button onClick={handleSignup}>Create account</button>
      <div>
        <Link to="/login">I already have an account</Link>
      </div>
    </div>
  );
};
