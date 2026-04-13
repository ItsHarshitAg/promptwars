import React, { Suspense, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { auth } from './firebase/config';
import { signOut } from 'firebase/auth';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import HomeIcon from '@mui/icons-material/Home';
import MapIcon from '@mui/icons-material/Map';
import ChatIcon from '@mui/icons-material/Chat';
import LogoutIcon from '@mui/icons-material/Logout';

const NavigationScreen = React.lazy(() => import('./screens/NavigationScreen'));
const ConciergeScreen = React.lazy(() => import('./screens/ConciergeScreen'));

/** Redirects unauthenticated users to /login; shows spinner while resolving. */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuth();
  if (user === undefined) {
    return (
      <div aria-live="polite" role="status" style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
        Loading…
      </div>
    );
  }
  if (user === null) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggle: toggleTheme } = useTheme();
  const user = useAuth();

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch {
      // sign-out is best-effort
    }
  }, [navigate]);

  const isHome = location.pathname === '/';
  const isLogin = location.pathname === '/login';

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Global header — shown on /map and /chat only (HomeScreen has its own navbar) */}
      {!isHome && !isLogin && (
        <header style={{ padding: '0 16px', height: 56, background: '#1a1a2e', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>SmartStadium</span>
          <nav aria-label="Main navigation" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <a href="/" aria-label="Home dashboard" style={{ color: '#fff', margin: '0 6px', textDecoration: 'none', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
              <HomeIcon aria-hidden="true" fontSize="small" />Home
            </a>
            <a href="/map" aria-label="Navigation map" style={{ color: '#fff', margin: '0 6px', textDecoration: 'none', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapIcon aria-hidden="true" fontSize="small" />Nav
            </a>
            <a href="/chat" aria-label="AI Concierge chat" style={{ color: '#fff', margin: '0 6px', textDecoration: 'none', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
              <ChatIcon aria-hidden="true" fontSize="small" />Chat
            </a>
            {user && (
              <button
                onClick={handleLogout}
                aria-label="Log out"
                style={{ marginLeft: 8, cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <LogoutIcon aria-hidden="true" fontSize="small" />Logout
              </button>
            )}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{ marginLeft: 4, cursor: 'pointer', background: 'transparent', border: 'none', fontSize: 18, padding: '2px 4px' }}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </nav>
        </header>
      )}

      <Suspense fallback={<div aria-live="polite" role="status" style={{ padding: '16px', textAlign: 'center' }}>Loading screen…</div>}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginScreen />} />
          {/* Protected */}
          <Route path="/" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><NavigationScreen /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ConciergeScreen /></ProtectedRoute>} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;

