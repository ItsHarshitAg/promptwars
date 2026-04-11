import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign-in failed. Please try again.';
      setError(message);
    }
  };

  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '16px' }}>
      <h1>Welcome to SmartStadium</h1>
      <p>Please log in to continue</p>
      {error && <p style={{ color: '#c62828' }} role="alert">{error}</p>}
      <button 
        onClick={handleLogin}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '16px', borderRadius: '8px', cursor: 'pointer', background: '#4285F4', color: '#fff', border: 'none' }}
        aria-label="Sign in with Google"
      >
        <LoginIcon aria-hidden="true" />
        Sign in with Google
      </button>
    </main>
  );
};
