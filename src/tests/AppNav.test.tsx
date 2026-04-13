import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AppNav } from '../components/AppNav';

vi.mock('firebase/auth', () => ({
  signOut: vi.fn(),
  getAuth: vi.fn(() => ({})),
}));

vi.mock('../firebase/config', () => ({
  auth: {},
}));

vi.mock('../hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'light', toggle: vi.fn() }),
}));

function renderNav() {
  return render(
    <BrowserRouter>
      <AppNav />
    </BrowserRouter>
  );
}

describe('AppNav', () => {
  it('renders the SmartStadium brand name', () => {
    renderNav();
    expect(screen.getByText('SmartStadium')).toBeDefined();
  });

  it('renders all navigation items', () => {
    renderNav();
    expect(screen.getByRole('button', { name: /go to dashboard/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /go to navigate/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /go to ai chat/i })).toBeDefined();
  });

  it('renders the theme toggle button', () => {
    renderNav();
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeDefined();
  });

  it('renders the logout button', () => {
    renderNav();
    expect(screen.getByRole('button', { name: /log out/i })).toBeDefined();
  });

  it('has correct aria-label on the nav element', () => {
    renderNav();
    expect(screen.getByRole('navigation', { name: /primary navigation/i })).toBeDefined();
  });
});
