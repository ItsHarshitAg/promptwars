import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { useAuth } from './hooks/useAuth';
import { AppNav } from './components/AppNav';
import { ErrorBoundary } from './components/ErrorBoundary';

const NavigationScreen = lazy(() => import('./screens/NavigationScreen'));
const ConciergeScreen = lazy(() => import('./screens/ConciergeScreen'));

/** Redirects unauthenticated users to /login; shows spinner while resolving. */
function ProtectedRoute({ children }: { children: ReactNode }) {
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
    <ErrorBoundary>
      <a href="#main-content" className="sr-only" style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}
         onFocus={(e) => { e.currentTarget.style.position = 'fixed'; e.currentTarget.style.left = '8px'; e.currentTarget.style.top = '8px'; e.currentTarget.style.width = 'auto'; e.currentTarget.style.height = 'auto'; e.currentTarget.style.overflow = 'visible'; e.currentTarget.style.zIndex = '10000'; e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.padding = '8px 16px'; e.currentTarget.style.borderRadius = '8px'; e.currentTarget.style.border = '2px solid #185FA5'; e.currentTarget.style.fontSize = '14px'; e.currentTarget.style.color = 'var(--text-h)'; }}
         onBlur={(e) => { e.currentTarget.style.position = 'absolute'; e.currentTarget.style.left = '-9999px'; e.currentTarget.style.width = '1px'; e.currentTarget.style.height = '1px'; e.currentTarget.style.overflow = 'hidden'; }}
      >
        Skip to main content
      </a>
      <div style={{ fontFamily: 'system-ui, sans-serif' }}>
        {/* Shared navbar — shown on /map and /chat; HomeScreen renders AppNav itself */}
        {!isHome && !isLogin && user && <AppNav />}

        <main id="main-content">
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
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;

