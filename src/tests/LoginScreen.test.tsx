import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoginScreen } from '../screens/LoginScreen';
import { BrowserRouter } from 'react-router-dom';

vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  getAuth: vi.fn(() => ({})),
  GoogleAuthProvider: vi.fn()
}));

vi.mock('../firebase/config', () => ({
  auth: {},
  googleProvider: {}
}));

describe('LoginScreen', () => {
  it('renders login text and button', () => {
    render(
      <BrowserRouter>
        <LoginScreen />
      </BrowserRouter>
    );

    expect(screen.getByText('Welcome to SmartStadium')).toBeDefined();
    const button = screen.getByRole('button', { name: 'Sign in with Google' });
    expect(button).toBeDefined();
  });

  it('renders the description text', () => {
    render(
      <BrowserRouter>
        <LoginScreen />
      </BrowserRouter>
    );

    expect(screen.getByText('Please log in to continue')).toBeDefined();
  });
});
