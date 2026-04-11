import React, { Suspense, useCallback } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { auth } from './firebase/config';
import { signOut } from 'firebase/auth';
import HomeIcon from '@mui/icons-material/Home';
import MapIcon from '@mui/icons-material/Map';
import ChatIcon from '@mui/icons-material/Chat';
import LogoutIcon from '@mui/icons-material/Logout';

const NavigationScreen = React.lazy(() => import('./screens/NavigationScreen'));
const ConciergeScreen = React.lazy(() => import('./screens/ConciergeScreen'));

function App() {
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch {
      // sign-out is best-effort
    }
  }, [navigate]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ padding: '16px', background: '#1a1a2e', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>SmartStadium</h2>
        <nav aria-label="Main navigation">
          <Link to="/" aria-label="Home dashboard" style={{ color: '#fff', margin: '0 8px', textDecoration: 'none', verticalAlign: 'middle' }}>
            <HomeIcon aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 4 }} fontSize="small" />
            Home
          </Link>
          <Link to="/map" aria-label="Navigation map" style={{ color: '#fff', margin: '0 8px', textDecoration: 'none', verticalAlign: 'middle' }}>
            <MapIcon aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 4 }} fontSize="small" />
            Nav
          </Link>
          <Link to="/chat" aria-label="AI Concierge chat" style={{ color: '#fff', margin: '0 8px', textDecoration: 'none', verticalAlign: 'middle' }}>
            <ChatIcon aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 4 }} fontSize="small" />
            Chat
          </Link>
          <button 
            onClick={handleLogout} 
            aria-label="Log out"
            style={{ marginLeft: '8px', cursor: 'pointer', background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '4px 8px', borderRadius: '4px', verticalAlign: 'middle' }}
          >
            <LogoutIcon aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 4 }} fontSize="small" />
            Logout
          </button>
        </nav>
      </header>
      <Suspense fallback={<div aria-live="polite" role="status" style={{ padding: '16px', textAlign: 'center' }}>Loading screen...</div>}>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/" element={<HomeScreen />} />
          <Route path="/map" element={<NavigationScreen />} />
          <Route path="/chat" element={<ConciergeScreen />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
