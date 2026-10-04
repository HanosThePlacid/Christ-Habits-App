import { addDays, type ISODate } from '@/lib/date';

export interface StreakResult {
  /** days passed (floor or target) in the current run */
  streak: number;
  /** yesterday was missed — today must not be missed ("never miss twice") */
  atRisk: boolean;
  /** best run ever */
  best: number;
}

/**
 * "Never miss twice": a single missed day is an accident and does not end the streak;
 * two missed days in a row do. Missed days are not counted in the streak length.
 * Today is never counted as a miss — the day isn't over yet.
 */
export function computeStreak(passedDates: Iterable<ISODate>, todayDate: ISODate): StreakResult {
  const passed = new Set(passedDates);
  if (passed.size === 0) return { streak: 0, atRisk: false, best: 0 };

  const earliest = [...passed].sort()[0];

  // Walk forward from the first log to today, tracking runs.
  let run = 0;
  let best = 0;
  let consecutiveMisses = 0;
  for (let d = earliest; d <= todayDate; d = addDays(d, 1)) {
    if (passed.has(d)) {
      run += 1;
      consecutiveMisses = 0;
    } else if (d !== todayDate) {
      consecutiveMisses += 1;
      if (consecutiveMisses >= 2) run = 0;
    }
    best = Math.max(best, run);
  }

  const yesterday = addDays(todayDate, -1);
  const atRisk = run > 0 && !passed.has(yesterday) && !passed.has(todayDate);
  return { streak: run, atRisk, best };
}

/** Share of the last `days` days (ending today) that were passed, 0–1. */
export function consistency(passedDates: Iterable<ISODate>, todayDate: ISODate, days = 7): number {
  const passed = new Set(passedDates);
  let hits = 0;
  for (let i = 0; i < days; i++) {
    if (passed.has(addDays(todayDate, -i))) hits += 1;
  }
  return hits / days;
}
