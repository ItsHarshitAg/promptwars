import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { HomeScreen } from '../screens/HomeScreen';

vi.mock('firebase/auth', () => ({
  signOut: vi.fn(),
  getAuth: vi.fn(() => ({})),
}));

vi.mock('../firebase/config', () => ({
  auth: {},
  db: {},
}));

vi.mock('../hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'light', toggle: vi.fn() }),
}));

vi.mock('../hooks/useCrowd', () => ({
  useCrowd: () => ({
    zones: [
      { id: 'gate-a', name: 'Gate A', capacity: 500, current: 120, density: 0.24, waitMinutes: 3 },
      { id: 'gate-b', name: 'Gate B', capacity: 500, current: 430, density: 0.86, waitMinutes: 26 },
      { id: 'food-north', name: 'Food Court North', capacity: 200, current: 170, density: 0.85, waitMinutes: 25 },
      { id: 'restroom-e', name: 'Restroom East', capacity: 80, current: 75, density: 0.94, waitMinutes: 34 },
      { id: 'restroom-w', name: 'Restroom West', capacity: 80, current: 10, density: 0.125, waitMinutes: 0 },
    ],
    heatmapData: [
      { id: 'gate-a', name: 'Gate A', capacity: 500, current: 120, density: 0.24, waitMinutes: 3, color: '#639922' },
      { id: 'gate-b', name: 'Gate B', capacity: 500, current: 430, density: 0.86, waitMinutes: 26, color: '#E24B4A' },
    ],
    loading: false,
    error: null,
    lastUpdated: new Date(),
  }),
}));

vi.mock('../hooks/useZoneHistory', () => ({
  useZoneHistory: () => ({}),
}));

function renderHome() {
  return render(
    <BrowserRouter>
      <HomeScreen />
    </BrowserRouter>
  );
}

describe('HomeScreen', () => {
  it('renders stat cards', () => {
    renderHome();
    expect(screen.getByText('Busiest Zone')).toBeDefined();
    expect(screen.getByText('Active Alerts')).toBeDefined();
    expect(screen.getByText('Avg Wait Time')).toBeDefined();
  });

  it('renders heatmap section heading', () => {
    renderHome();
    expect(screen.getByText('Live heatmap')).toBeDefined();
  });

  it('renders zone buttons with accessible labels', () => {
    renderHome();
    const buttons = screen.getAllByRole('button', { name: /view on map/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders alert strip for high-density zone', () => {
    renderHome();
    const alerts = screen.getAllByText(/heavily crowded/i);
    expect(alerts.length).toBeGreaterThanOrEqual(1);
  });

  it('renders smart recommendations section', () => {
    renderHome();
    expect(screen.getByText('Smart recommendations')).toBeDefined();
  });

  it('renders last updated footer', () => {
    renderHome();
    expect(screen.getByText(/last updated/i)).toBeDefined();
  });

  it('has progressbar roles on density bars', () => {
    renderHome();
    const bars = screen.getAllByRole('progressbar');
    expect(bars.length).toBeGreaterThanOrEqual(1);
    expect(bars[0].getAttribute('aria-valuemin')).toBe('0');
    expect(bars[0].getAttribute('aria-valuemax')).toBe('100');
  });
});
