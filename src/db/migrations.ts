import type { SQLiteDatabase } from 'expo-sqlite';

import { seed } from './seed';

/**
 * Each entry upgrades the schema by one version. Never edit a shipped migration —
 * append a new one. Version is tracked with `PRAGMA user_version`.
 */
const MIGRATIONS: ((db: SQLiteDatabase) => Promise<void>)[] = [
  // v1: core habit tracking
  async (db) => {
    await db.execAsync(`
      CREATE TABLE anchors (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        time TEXT,
        days TEXT NOT NULL DEFAULT '[]',
        reminder_text TEXT,
        sort INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE habits (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        identity TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL DEFAULT 'custom',
        tracking_type TEXT NOT NULL,
        kind TEXT NOT NULL DEFAULT 'build',
        status TEXT NOT NULL DEFAULT 'active',
        anchor_id TEXT REFERENCES anchors(id) ON DELETE SET NULL,
        cue TEXT,
        floor TEXT,
        target TEXT,
        friction_fix TEXT,
        reward TEXT,
        prompt TEXT,
        steps TEXT NOT NULL DEFAULT '[]',
        private INTEGER NOT NULL DEFAULT 0,
        sort INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE habit_logs (
        habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
        date TEXT NOT NULL,
        level TEXT NOT NULL,
        note TEXT,
        PRIMARY KEY (habit_id, date)
      );
      CREATE TABLE events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        habit_id TEXT REFERENCES habits(id) ON DELETE SET NULL,
        outcome TEXT,
        blocker TEXT,
        note TEXT,
        at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
      );
      CREATE INDEX events_type_at ON events(type, at);
      CREATE TABLE weekly_reviews (
        week TEXT PRIMARY KEY NOT NULL,
        answers TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
      );
      CREATE TABLE journal_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        body TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
      );
    `);
    await seed(db);
  },
  // v2: key/value settings (first-launch introduction flag)
  async (db) => {
    await db.execAsync(`
      CREATE TABLE settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);
  },
];

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;
  while (version < MIGRATIONS.length) {
    await db.withTransactionAsync(() => MIGRATIONS[version](db));
    version += 1;
    await db.execAsync(`PRAGMA user_version = ${version}`);
  }
}
