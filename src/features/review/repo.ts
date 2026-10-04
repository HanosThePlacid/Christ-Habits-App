import type { SQLiteDatabase } from 'expo-sqlite';

import type { Answers } from '@/features/review/questions';

export async function getReview(db: SQLiteDatabase, week: string): Promise<Answers | null> {
  const row = await db.getFirstAsync<{ answers: string }>(
    'SELECT answers FROM weekly_reviews WHERE week = ?',
    week,
  );
  return row ? JSON.parse(row.answers) : null;
}

export async function saveReview(db: SQLiteDatabase, week: string, answers: Answers) {
  await db.runAsync(
    `INSERT INTO weekly_reviews (week, answers) VALUES (?, ?)
     ON CONFLICT (week) DO UPDATE SET answers = excluded.answers`,
    week,
    JSON.stringify(answers),
  );
}
