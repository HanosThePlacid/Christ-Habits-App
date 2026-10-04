import type { Anchor, Habit, HabitStatus } from '@/features/habits/types';

/** Choices made during the introduction, applied to habits and anchors when it finishes. */
export interface Plan {
  morningTime: string;
  peaceTime: string;
  scriptureFloor: string;
  /** chapters per day */
  scriptureTarget: number;
  tonguesMinutes: number;
  tonguesAnchor: 'morning' | 'garden';
  /** 1 = Sunday … 7 = Saturday */
  serveDay: number;
  serveTime: string;
  fastingActive: boolean;
  /** habit id -> keep it */
  include: Record<string, boolean>;
}

export const SCRIPTURE_FLOORS = [
  '1 chapter',
  '5 minutes of audio',
  '1 chapter or 5 minutes of audio',
];

const firstNumber = (s: string | null, fallback: number) => {
  const n = s ? parseInt(s, 10) : NaN;
  return Number.isFinite(n) ? n : fallback;
};

/** Start from what is saved, so replaying the introduction keeps earlier choices. */
export function initialPlan(habits: Habit[], anchors: Anchor[]): Plan {
  const habit = (id: string) => habits.find((h) => h.id === id);
  const anchor = (id: string) => anchors.find((a) => a.id === id);
  const tongues = habit('tongues');
  const hospital = anchor('hospital-confirm');
  return {
    morningTime: anchor('morning')?.time ?? '06:30',
    peaceTime: anchor('garden')?.time ?? '17:00',
    scriptureFloor: habit('scripture')?.floor ?? SCRIPTURE_FLOORS[2],
    scriptureTarget: firstNumber(habit('scripture')?.target ?? null, 7),
    tonguesMinutes: firstNumber(tongues?.floor ?? null, 2),
    tonguesAnchor: tongues?.anchorId === 'morning' ? 'morning' : 'garden',
    serveDay: hospital?.days[0] ?? 2,
    serveTime: hospital?.time ?? '09:00',
    fastingActive: habit('fasting')?.status === 'active',
    include: Object.fromEntries(habits.map((h) => [h.id, h.status !== 'archived'])),
  };
}

export interface HabitPatch {
  id: string;
  status: HabitStatus;
  floor?: string;
  target?: string;
  anchorId?: string;
}

export interface AnchorPatch {
  id: string;
  name?: string;
  time: string;
  days?: number[];
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function planChanges(plan: Plan, habitIds: string[]) {
  const status = (id: string): HabitStatus => {
    if (!plan.include[id]) return 'archived';
    if (id === 'fasting' && !plan.fastingActive) return 'parked';
    return 'active';
  };

  const habits: HabitPatch[] = habitIds.map((id) => {
    const patch: HabitPatch = { id, status: status(id) };
    if (id === 'scripture') {
      patch.floor = plan.scriptureFloor;
      patch.target = plural(plan.scriptureTarget, 'chapter');
    }
    if (id === 'tongues') {
      patch.floor = plural(plan.tonguesMinutes, 'minute');
      patch.anchorId = plan.tonguesAnchor;
    }
    return patch;
  });

  const anchors: AnchorPatch[] = [
    { id: 'morning', name: 'Morning prayer', time: plan.morningTime },
    { id: 'garden', name: 'Time of peace', time: plan.peaceTime },
    { id: 'hospital-confirm', time: plan.serveTime, days: [plan.serveDay] },
  ];

  return { habits, anchors };
}
