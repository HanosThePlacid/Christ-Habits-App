import type { SQLiteDatabase } from 'expo-sqlite';

import type { Anchor, Habit, HabitLog, LogLevel } from '@/features/habits/types';
import type { AnchorPatch, HabitPatch } from '@/features/onboarding/plan';
import type { ISODate } from '@/lib/date';

interface AnchorRow {
  id: string;
  name: string;
  time: string | null;
  days: string;
  reminder_text: string | null;
  sort: number;
}

interface HabitRow {
  id: string;
  name: string;
  identity: string;
  category: string;
  tracking_type: Habit['trackingType'];
  kind: Habit['kind'];
  status: Habit['status'];
  anchor_id: string | null;
  cue: string | null;
  floor: string | null;
  target: string | null;
  friction_fix: string | null;
  reward: string | null;
  prompt: string | null;
  steps: string;
  private: number;
  sort: number;
}

const toAnchor = (r: AnchorRow): Anchor => ({
  id: r.id,
  name: r.name,
  time: r.time,
  days: JSON.parse(r.days),
  reminderText: r.reminder_text,
  sort: r.sort,
});

const toHabit = (r: HabitRow): Habit => ({
  id: r.id,
  name: r.name,
  identity: r.identity,
  category: r.category,
  trackingType: r.tracking_type,
  kind: r.kind,
  status: r.status,
  anchorId: r.anchor_id,
  cue: r.cue,
  floor: r.floor,
  target: r.target,
  frictionFix: r.friction_fix,
  reward: r.reward,
  prompt: r.prompt,
  steps: JSON.parse(r.steps),
  private: r.private === 1,
  sort: r.sort,
});

export async function listAnchors(db: SQLiteDatabase): Promise<Anchor[]> {
  const rows = await db.getAllAsync<AnchorRow>('SELECT * FROM anchors ORDER BY sort');
  return rows.map(toAnchor);
}

export async function listHabits(
  db: SQLiteDatabase,
  { includeArchived = false } = {},
): Promise<Habit[]> {
  const rows = await db.getAllAsync<HabitRow>(
    includeArchived
      ? 'SELECT * FROM habits ORDER BY sort'
      : "SELECT * FROM habits WHERE status != 'archived' ORDER BY sort",
  );
  return rows.map(toHabit);
}

export async function updateHabit(db: SQLiteDatabase, patch: HabitPatch) {
  await db.runAsync(
    `UPDATE habits SET status = ?, floor = COALESCE(?, floor), target = COALESCE(?, target),
       anchor_id = COALESCE(?, anchor_id)
     WHERE id = ?`,
    patch.status,
    patch.floor ?? null,
    patch.target ?? null,
    patch.anchorId ?? null,
    patch.id,
  );
}

export async function updateAnchor(db: SQLiteDatabase, patch: AnchorPatch) {
  await db.runAsync(
    `UPDATE anchors SET time = ?, name = COALESCE(?, name), days = COALESCE(?, days) WHERE id = ?`,
    patch.time,
    patch.name ?? null,
    patch.days ? JSON.stringify(patch.days) : null,
    patch.id,
  );
}

export async function getHabit(db: SQLiteDatabase, id: string): Promise<Habit | null> {
  const row = await db.getFirstAsync<HabitRow>('SELECT * FROM habits WHERE id = ?', id);
  return row ? toHabit(row) : null;
}

export async function listLogs(db: SQLiteDatabase, since: ISODate): Promise<HabitLog[]> {
  return db.getAllAsync<HabitLog>(
    'SELECT habit_id AS habitId, date, level, note FROM habit_logs WHERE date >= ?',
    since,
  );
}

export async function listLogsForHabit(db: SQLiteDatabase, habitId: string): Promise<HabitLog[]> {
  return db.getAllAsync<HabitLog>(
    'SELECT habit_id AS habitId, date, level, note FROM habit_logs WHERE habit_id = ?',
    habitId,
  );
}

/** Set today's level for a habit; `null` clears it. */
export async function setLog(
  db: SQLiteDatabase,
  habitId: string,
  date: ISODate,
  level: LogLevel | null,
) {
  if (level === null) {
    await db.runAsync('DELETE FROM habit_logs WHERE habit_id = ? AND date = ?', habitId, date);
  } else {
    await db.runAsync(
      `INSERT INTO habit_logs (habit_id, date, level) VALUES (?, ?, ?)
       ON CONFLICT (habit_id, date) DO UPDATE SET level = excluded.level`,
      habitId,
      date,
      level,
    );
  }
}
