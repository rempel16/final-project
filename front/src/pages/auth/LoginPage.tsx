import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = () => {
    // TODO: заменить на реальный API login
    login('test-token');
    navigate('/', { replace: true });
  };

  return (
    <div style={{ padding: 24, display: 'grid', gap: 12, maxWidth: 420 }}>
      <h1 style={{ margin: 0 }}>Login</h1>
      <button onClick={handleLogin}>Login</button>
      <div>
        <Link to="/signup">Create account</Link>
      </div>
    </div>
  );
};
