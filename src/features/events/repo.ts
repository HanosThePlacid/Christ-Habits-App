import type { SQLiteDatabase } from 'expo-sqlite';

export type EventType = 'nudge' | 'offense' | 'decision';
export type Outcome = 'obeyed' | 'resisted' | 'forgave' | 'used' | 'skipped';
export type Blocker = 'busy' | 'doubt' | 'fear' | 'other';

export interface HabitEvent {
  id: number;
  type: EventType;
  habitId: string | null;
  outcome: Outcome | null;
  blocker: Blocker | null;
  note: string | null;
  at: string;
}

export async function addEvent(
  db: SQLiteDatabase,
  e: Omit<HabitEvent, 'id' | 'at'>,
): Promise<number> {
  const r = await db.runAsync(
    'INSERT INTO events (type, habit_id, outcome, blocker, note) VALUES (?, ?, ?, ?, ?)',
    e.type,
    e.habitId,
    e.outcome,
    e.blocker,
    e.note,
  );
  return r.lastInsertRowId;
}

export async function listEvents(db: SQLiteDatabase, limit = 50): Promise<HabitEvent[]> {
  return db.getAllAsync<HabitEvent>(
    `SELECT id, type, habit_id AS habitId, outcome, blocker, note, at
     FROM events ORDER BY at DESC, id DESC LIMIT ?`,
    limit,
  );
}

export async function addJournalEntry(db: SQLiteDatabase, type: string, body: string) {
  await db.runAsync('INSERT INTO journal_entries (type, body) VALUES (?, ?)', type, body);
}
