import type { HabitEvent } from './repo';
import { obedienceStats } from './stats';

const ev = (outcome: HabitEvent['outcome'], blocker: HabitEvent['blocker'] = null): HabitEvent => ({
  id: 0,
  type: 'nudge',
  habitId: 'obey',
  outcome,
  blocker,
  note: null,
  at: '2026-09-28 10:00:00',
});

describe('obedienceStats', () => {
  it('handles no events', () => {
    expect(obedienceStats([])).toEqual({ obeyed: 0, resisted: 0, rate: null, topBlocker: null });
  });

  it('computes rate and most common blocker', () => {
    const s = obedienceStats([
      ev('obeyed'),
      ev('obeyed'),
      ev('resisted', 'fear'),
      ev('resisted', 'busy'),
      ev('resisted', 'fear'),
    ]);
    expect(s.rate).toBeCloseTo(0.4);
    expect(s.topBlocker).toBe('fear');
  });
});
