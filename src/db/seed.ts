import type { SQLiteDatabase } from 'expo-sqlite';

import type { Anchor, Habit } from '@/features/habits/types';

/**
 * Starter data: the 7 habits from the habit interview (GODLY/Vlad Savchuk/habits-summary.md),
 * plus the anchors they stack onto. Garden time touches three habits at once, so it gets a reminder.
 */
export const SEED_ANCHORS: Anchor[] = [
  {
    id: 'morning',
    name: 'Morning, before phone',
    time: '06:30',
    days: [],
    reminderText: 'Before the phone: silence, presence, gratitude, who you are in Christ.',
    sort: 0,
  },
  { id: 'gaming', name: 'Gaming session', time: null, days: [], reminderText: null, sort: 1 },
  { id: 'walk', name: '3 km walk / jog', time: null, days: [], reminderText: null, sort: 2 },
  {
    id: 'garden',
    name: 'Garden time (5–6 pm)',
    time: '17:00',
    days: [],
    reminderText: 'Garden time — wait on the Lord. Word, tongues, listen.',
    sort: 3,
  },
  {
    id: 'hospital-confirm',
    name: 'Monday: confirm hospital ministry',
    time: '09:00',
    days: [2],
    reminderText: 'Confirm hospital ministry for this week.',
    sort: 4,
  },
];

type SeedHabit = Omit<Habit, 'sort'>;

const base = {
  kind: 'build',
  status: 'active',
  anchorId: null,
  cue: null,
  floor: null,
  target: null,
  frictionFix: null,
  reward: null,
  prompt: null,
  steps: [],
  private: false,
} as const satisfies Partial<SeedHabit>;

export const SEED_HABITS: SeedHabit[] = [
  {
    ...base,
    id: 'scripture',
    name: 'Daily Scripture intake',
    identity: 'I am someone who lives on every word from the mouth of God.',
    category: 'word',
    trackingType: 'daily',
    anchorId: 'garden',
    cue: 'Before opening any game, queue the Bible audiobook. On walks, Bible audio plays.',
    floor: '1 chapter or 5 minutes of audio',
    target: '7 chapters',
    frictionFix: 'Default-queue the audiobook so skipping it is an active decision.',
  },
  {
    ...base,
    id: 'tongues',
    name: 'Pray in tongues',
    identity: 'I am someone who prays in the Spirit without ceasing.',
    category: 'prayer',
    trackingType: 'daily',
    anchorId: 'garden',
    cue: 'Garden time, walks, while playing accordion or singing.',
    floor: '2 minutes',
    target: 'Background prayer through the day',
    frictionFix: 'Protect the anchors — when they drop, this drops.',
  },
  {
    ...base,
    id: 'obey',
    name: 'Obey the Holy Spirit',
    identity: 'I am someone who obeys the first nudge.',
    category: 'spirit',
    trackingType: 'event',
    cue: 'When the nudge comes, I stop — no debate.',
    reward: 'Right after obeying, register: "That was Him, that worked."',
    steps: ['Stop — no debate', 'Do what He said', 'Say: "That was Him, that worked."'],
  },
  {
    ...base,
    id: 'offense',
    name: 'Guard against offense',
    identity: 'I am someone who forgives quickly and keeps my heart clean.',
    category: 'heart',
    trackingType: 'event',
    steps: [
      'Notice the offense',
      'Go to the Lord',
      'Ask Him for help',
      'Forgive — say it out loud',
    ],
  },
  {
    ...base,
    id: 'wisdom',
    name: 'Wisdom over legality',
    identity: 'I am someone who chooses what is wise, not just what is allowed.',
    category: 'wisdom',
    trackingType: 'decision',
    prompt: "What's the small step forward on my responsibility right now — would this replace it?",
    steps: ['Before speaking: am I about to listen, or about to wait-to-talk?'],
  },
  {
    ...base,
    id: 'purity',
    name: 'Guard my eyes',
    identity: 'I am someone whose body is a temple of the Holy Spirit.',
    category: 'purity',
    trackingType: 'weekly',
    kind: 'break',
    private: true,
    steps: [
      'Invisible: block access at device level',
      'Unattractive: remember the real cost',
      'Difficult: blocker held by someone else; phone stays outside the room',
      'Unsatisfying: accountability partner',
    ],
  },
  {
    ...base,
    id: 'serve',
    name: 'Serve others',
    identity: 'I am someone who keeps my promises — if I say I will be there, I will be there.',
    category: 'service',
    trackingType: 'weekly',
    anchorId: 'hospital-confirm',
    cue: 'Grandmother, sister’s kids, hospital ministry, street ministry.',
    frictionFix: 'Confirm hospital ministry every Monday.',
  },
  {
    ...base,
    id: 'fasting',
    name: 'Fast regularly',
    identity: 'I am someone who hungers for God more than food.',
    category: 'fasting',
    trackingType: 'weekly',
    status: 'parked',
  },
];

export async function seed(db: SQLiteDatabase) {
  for (const a of SEED_ANCHORS) {
    await db.runAsync(
      'INSERT INTO anchors (id, name, time, days, reminder_text, sort) VALUES (?, ?, ?, ?, ?, ?)',
      a.id,
      a.name,
      a.time,
      JSON.stringify(a.days),
      a.reminderText,
      a.sort,
    );
  }
  for (const [i, h] of SEED_HABITS.entries()) {
    await db.runAsync(
      `INSERT INTO habits (id, name, identity, category, tracking_type, kind, status, anchor_id,
        cue, floor, target, friction_fix, reward, prompt, steps, private, sort)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      h.id,
      h.name,
      h.identity,
      h.category,
      h.trackingType,
      h.kind,
      h.status,
      h.anchorId,
      h.cue,
      h.floor,
      h.target,
      h.frictionFix,
      h.reward,
      h.prompt,
      JSON.stringify(h.steps),
      h.private ? 1 : 0,
      i,
    );
  }
}
