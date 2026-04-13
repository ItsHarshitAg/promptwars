import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { useAuth } from './hooks/useAuth';
import { AppNav } from './components/AppNav';

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
  const location = useLocation();
  const user = useAuth();

  const isHome = location.pathname === '/';
  const isLogin = location.pathname === '/login';

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Shared navbar — shown on /map and /chat; HomeScreen renders AppNav itself */}
      {!isHome && !isLogin && user && <AppNav />}

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

