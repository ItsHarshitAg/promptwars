import { describe, it, expect, vi, beforeEach } from 'vitest';
import { askConcierge } from '../utils/concierge';
import type { Zone } from '../types';

const ZONE_FIXTURE: Zone[] = [
  { id: 'gate-a', name: 'Gate A', capacity: 500, current: 120, density: 0.24, waitMinutes: 3 },
];

describe('askConcierge', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns reply from API on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ reply: 'Gate A is clear.' }),
    });
    const result = await askConcierge('Where should I go?', ZONE_FIXTURE);
    expect(result).toBe('Gate A is clear.');
  });

  it('throws on non-OK response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    await expect(askConcierge('test', ZONE_FIXTURE)).rejects.toThrow('Concierge API error: 500');
  });

  it('returns placeholder for empty/whitespace input', async () => {
    const result = await askConcierge('   ', ZONE_FIXTURE);
    expect(result).toBe('Please enter a message.');
  });

  it('sends sanitised message in request body', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ reply: 'ok' }),
    });
    await askConcierge('<script>alert(1)</script>hi', ZONE_FIXTURE);
    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(body.message).not.toContain('<script>');
    expect(body.message).toContain('hi');
  });

  it('sends zone context as JSON', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ reply: 'ok' }),
    });
    await askConcierge('test', ZONE_FIXTURE);
    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(body.context).toContain('gate-a');
  });
});
