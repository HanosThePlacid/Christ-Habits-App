import type { Blocker, HabitEvent } from './repo';

export interface ObedienceStats {
  obeyed: number;
  resisted: number;
  /** 0–1, null when nothing logged */
  rate: number | null;
  topBlocker: Blocker | null;
}

export function obedienceStats(events: HabitEvent[]): ObedienceStats {
  const nudges = events.filter((e) => e.type === 'nudge');
  const obeyed = nudges.filter((e) => e.outcome === 'obeyed').length;
  const resisted = nudges.filter((e) => e.outcome === 'resisted').length;
  const counts = new Map<Blocker, number>();
  for (const e of nudges) {
    if (e.outcome === 'resisted' && e.blocker)
      counts.set(e.blocker, (counts.get(e.blocker) ?? 0) + 1);
  }
  let topBlocker: Blocker | null = null;
  for (const [b, n] of counts) if (!topBlocker || n > counts.get(topBlocker)!) topBlocker = b;
  const total = obeyed + resisted;
  return { obeyed, resisted, rate: total ? obeyed / total : null, topBlocker };
}
