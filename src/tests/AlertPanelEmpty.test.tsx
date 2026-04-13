import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../hooks/useAlerts', () => ({
  useAlerts: () => ({ alerts: [], dismissAlert: vi.fn() }),
}));

describe('AlertPanel (empty state)', () => {
  it('renders nothing when there are no alerts', async () => {
    const { AlertPanel } = await import('../components/AlertPanel');
    const { container } = render(<AlertPanel />);
    expect(container.innerHTML).toBe('');
  });
});
