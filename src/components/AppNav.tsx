import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { useTheme } from '../hooks/useTheme';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/' },
  { label: 'Navigate', path: '/map' },
  { label: 'AI Chat', path: '/chat' },
  { label: 'Alerts', path: '/' },
] as const;

export function AppNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggle: toggleTheme } = useTheme();

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch {
      // best-effort
    }
  }, [navigate]);

  return (
    <nav aria-label="Primary navigation" className="hs-nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: '#27A148', display: 'inline-block' }} />
        <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px', color: 'var(--text-h)' }}>SmartStadium</span>
      </div>
      <div className="hs-nav-right">
        {NAV_ITEMS.map(item => {
          const isActive =
            item.label === 'Dashboard' || item.label === 'Alerts'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              aria-label={`Go to ${item.label}`}
              aria-current={isActive ? 'page' : undefined}
              className="hs-nav-btn"
              style={{
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                background: isActive ? 'var(--surface-alt)' : 'transparent',
                color: isActive ? 'var(--text-h)' : 'var(--muted)',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {item.label}
            </button>
          );
        })}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '4px 8px', color: 'var(--muted)', marginLeft: 4 }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button
          onClick={handleLogout}
          aria-label="Log out"
          style={{
            fontSize: 13,
            padding: '6px 12px',
            borderRadius: 6,
            border: '0.5px solid var(--border-color)',
            cursor: 'pointer',
            background: 'transparent',
            color: 'var(--muted)',
            marginLeft: 4,
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
