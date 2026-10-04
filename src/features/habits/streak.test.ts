import { computeStreak, consistency } from './streak';

const T = '2026-09-28';

describe('computeStreak (never miss twice)', () => {
  it('is zero with no logs', () => {
    expect(computeStreak([], T)).toEqual({ streak: 0, atRisk: false, best: 0 });
  });

  it('counts consecutive days including today', () => {
    expect(computeStreak(['2026-09-26', '2026-09-27', '2026-09-28'], T).streak).toBe(3);
  });

  it('does not treat unlogged today as a miss', () => {
    const r = computeStreak(['2026-09-26', '2026-09-27'], T);
    expect(r.streak).toBe(2);
    expect(r.atRisk).toBe(false);
  });

  it('survives a single missed day', () => {
    const r = computeStreak(['2026-09-25', '2026-09-26', '2026-09-28'], T);
    expect(r.streak).toBe(3);
  });

  it('flags at risk when yesterday was missed and today not yet done', () => {
    const r = computeStreak(['2026-09-25', '2026-09-26'], T);
    expect(r.streak).toBe(2);
    expect(r.atRisk).toBe(true);
  });

  it('breaks after two missed days in a row', () => {
    const r = computeStreak(['2026-09-20', '2026-09-21', '2026-09-22', '2026-09-25'], T);
    expect(r.streak).toBe(0);
    expect(r.best).toBe(3);
  });

  it('restarts after a break', () => {
    const r = computeStreak(['2026-09-20', '2026-09-27', '2026-09-28'], T);
    expect(r.streak).toBe(2);
  });
});

describe('consistency', () => {
  it('is the share of the last 7 days passed', () => {
    expect(consistency(['2026-09-28', '2026-09-27', '2026-09-20'], T)).toBeCloseTo(2 / 7);
  });
});
