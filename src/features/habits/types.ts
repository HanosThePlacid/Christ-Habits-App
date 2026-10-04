/**
 * Habit model follows the Atomic Habits rulebook:
 * identity (who this votes for), anchor/cue (make it obvious),
 * floor = 2-minute version (make it easy), reward (make it satisfying).
 */
export type TrackingType =
  /** checkbox every day (floor or target) */
  | 'daily'
  /** answered in the weekly reflection */
  | 'weekly'
  /** protocol opened when a trigger happens (e.g. offense) */
  | 'event'
  /** question asked at a decision point (e.g. "would this replace my next step?") */
  | 'decision';

export type HabitKind = 'build' | 'break';
export type HabitStatus = 'active' | 'parked' | 'archived';
export type LogLevel = 'floor' | 'target';

export interface Anchor {
  id: string;
  name: string;
  /** `HH:MM` local time for the reminder, null = no reminder */
  time: string | null;
  /** weekdays 1=Sunday … 7=Saturday (matches expo-notifications WEEKLY); empty = every day */
  days: number[];
  reminderText: string | null;
  sort: number;
}

export interface Habit {
  id: string;
  name: string;
  identity: string;
  category: string;
  trackingType: TrackingType;
  kind: HabitKind;
  status: HabitStatus;
  anchorId: string | null;
  /** habit stack: "After [X], I will [Y]" */
  cue: string | null;
  floor: string | null;
  target: string | null;
  frictionFix: string | null;
  reward: string | null;
  /** decision habits: the question to ask */
  prompt: string | null;
  /** event habits: ordered protocol steps; break habits: inversion checklist */
  steps: string[];
  /** private habits hide details on Today and in notifications */
  private: boolean;
  sort: number;
}

export interface HabitLog {
  habitId: string;
  date: string;
  level: LogLevel;
  note: string | null;
}
