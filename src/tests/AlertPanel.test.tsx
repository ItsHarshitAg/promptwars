import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AlertPanel } from '../components/AlertPanel';

vi.mock('../hooks/useAlerts', () => ({
  useAlerts: () => ({
    alerts: [
      { id: '1', message: 'Gate A heavy crowds', zoneId: 'gate-a', timestamp: 123, read: false },
      { id: '2', message: 'Restroom East is full', zoneId: 'restroom-e', timestamp: 456, read: false }
    ],
    dismissAlert: vi.fn()
  })
}));

describe('AlertPanel', () => {
  it('renders alerts', () => {
    render(<AlertPanel />);
    expect(screen.getByText('Gate A heavy crowds')).toBeDefined();
  });

  it('renders multiple alerts', () => {
    render(<AlertPanel />);
    expect(screen.getByText('Gate A heavy crowds')).toBeDefined();
    expect(screen.getByText('Restroom East is full')).toBeDefined();
  });

  it('renders dismiss buttons for each alert', () => {
    render(<AlertPanel />);
    const dismissButtons = screen.getAllByRole('button', { name: /dismiss alert/i });
    expect(dismissButtons).toHaveLength(2);
  });
});
