import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

export const LoginScreen = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign-in failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'var(--surface)',
          border: '0.5px solid var(--border-color)',
          borderRadius: 16,
          padding: 'clamp(24px, 6vw, 40px) clamp(20px, 8vw, 36px) 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span
            aria-hidden="true"
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#27A148',
              display: 'inline-block',
              boxShadow: '0 0 0 3px rgba(39,161,72,0.2)',
            }}
          />
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.4px', color: 'var(--text-h)' }}>
            SmartStadium
          </span>
        </div>

        {/* Tagline */}
        <p style={{ margin: '0 0 32px', fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
          Live crowd intelligence for Narendra Modi Stadium
        </p>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
          {['📍 Live heatmap', '🤖 AI concierge', '⚡ Real-time alerts'].map(f => (
            <span
              key={f}
              style={{
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 99,
                background: 'var(--surface-alt)',
                color: 'var(--muted)',
                border: '0.5px solid var(--border-color)',
              }}
            >
              {f}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: '100%', height: '0.5px', background: 'var(--border-color)', marginBottom: 28 }} />

        {/* Sign-in button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          aria-label="Sign in with Google"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            width: '100%',
            height: 44,
            borderRadius: 8,
            border: '0.5px solid var(--border-color)',
            background: 'var(--surface)',
            color: 'var(--text-h)',
            fontSize: 15,
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {/* Google G logo */}
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.1 0 5.9 1.1 8.1 2.9l6-6C34.5 3.1 29.5 1 24 1 14.9 1 7.2 6.5 3.9 14.4l7 5.4C12.6 13.1 17.9 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7c4.3-4 6.8-9.9 6.8-16.9z"/>
            <path fill="#FBBC05" d="M10.9 28.5c-.5-1.5-.8-3.1-.8-4.8s.3-3.3.8-4.8l-7-5.4C2.5 16.5 1.5 20.1 1.5 24s1 7.5 2.4 10.5l7-5.5z"/>
            <path fill="#34A853" d="M24 46.5c5.4 0 9.9-1.8 13.2-4.8l-7.4-5.7c-1.8 1.2-4.1 1.9-5.8 1.9-6.1 0-11.3-3.6-13-8.8l-7 5.5C7.2 41.5 14.9 46.5 24 46.5z"/>
          </svg>
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>

        {/* Error */}
        {error && (
          <p role="alert" style={{ marginTop: 16, marginBottom: 0, color: 'var(--danger)', fontSize: 13, textAlign: 'center' }}>
            {error}
          </p>
        )}

        {/* Footer note */}
        <p style={{ marginTop: 24, marginBottom: 0, fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>
          By signing in you agree to the venue's terms of service
        </p>
      </div>
    </div>
  );
};

