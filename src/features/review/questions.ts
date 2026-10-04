/**
 * Weekly "pester" reflection (GODLY/Vlad Savchuk/reminder-system-draft.md).
 * Not a pass/fail form — one honest question at a time, with follow-ups that
 * branch on the answer. Answers are saved per week.
 */
export interface Question {
  id: string;
  text: string;
  /** choice questions show buttons; text questions show a free-text box */
  kind: 'choice' | 'text';
  options?: string[];
  /** follow-up questions shown only when the answer matches the key */
  followUps?: Record<string, Question[]>;
  /** optional hint shown under the question */
  hint?: string;
}

export const WEEKLY_QUESTIONS: Question[] = [
  {
    id: 'wisdom',
    text: 'Was I wise this week?',
    hint: 'Ask it even if nothing went "wrong".',
    kind: 'choice',
    options: ['Yes', 'Mostly', 'No'],
    followUps: {
      Mostly: [
        {
          id: 'wisdom-skipped',
          text: 'Where did I skip the question "would this replace my next step?" — games, YouTube, talking too much?',
          kind: 'text',
        },
      ],
      No: [
        {
          id: 'wisdom-skipped',
          text: 'Where did I skip the question "would this replace my next step?" — games, YouTube, talking too much?',
          kind: 'text',
        },
      ],
    },
  },
  {
    id: 'wisdom-worked',
    text: 'Any moment the wisdom question actually worked?',
    kind: 'text',
  },
  {
    id: 'obedience',
    text: "Did I obey the Spirit's nudges this week?",
    kind: 'choice',
    options: ['Every time', 'Some', 'Resisted'],
    followUps: {
      Some: [
        {
          id: 'obedience-why',
          text: 'Where did I resist, and why — busy, doubt, fear?',
          kind: 'text',
        },
      ],
      Resisted: [
        {
          id: 'obedience-why',
          text: 'Where did I resist, and why — busy, doubt, fear?',
          kind: 'text',
        },
      ],
    },
  },
  {
    id: 'offense',
    text: 'Did I take offense this week?',
    kind: 'choice',
    options: ['No', 'Yes — forgiven', 'Yes — still holding it'],
    followUps: {
      'Yes — still holding it': [
        {
          id: 'offense-next',
          text: 'Who, and what is the next step to forgive? Take it to the Lord now.',
          kind: 'text',
        },
      ],
    },
  },
  {
    id: 'purity',
    text: 'Honest check: did I guard my eyes?',
    kind: 'choice',
    options: ['Yes', 'Slipped'],
    followUps: {
      Slipped: [
        {
          id: 'purity-cue',
          text: 'What was the cue? Which friction was missing? (No condemnation — adjust the system.)',
          kind: 'text',
        },
      ],
    },
  },
  {
    id: 'serve',
    text: 'Did I serve this week — and was hospital ministry confirmed on time?',
    kind: 'choice',
    options: ['Served + confirmed', 'Served, confirmed late', 'Did not serve'],
    followUps: {
      'Did not serve': [
        {
          id: 'serve-pattern',
          text: 'Time, energy or mood? Any pattern worth noting?',
          kind: 'text',
        },
      ],
    },
  },
  {
    id: 'fasting',
    text: 'Fasting: did I fast this week, or do I want to start?',
    kind: 'choice',
    options: ['Fasted', 'Still parked', 'Ready to start'],
  },
  {
    id: 'heard',
    text: 'What did the Lord speak to me this week?',
    kind: 'text',
  },
];

export type Answers = Record<string, string>;

/** Flatten the question tree into the sequence the user sees, given answers so far. */
export function questionSequence(questions: Question[], answers: Answers): Question[] {
  const out: Question[] = [];
  for (const q of questions) {
    out.push(q);
    const a = answers[q.id];
    const follow = a !== undefined ? q.followUps?.[a] : undefined;
    if (follow) out.push(...questionSequence(follow, answers));
  }
  return out;
}

/** Drop answers to follow-ups that no longer apply after an earlier answer changed. */
export function pruneAnswers(questions: Question[], answers: Answers): Answers {
  const visible = new Set(questionSequence(questions, answers).map((q) => q.id));
  return Object.fromEntries(Object.entries(answers).filter(([id]) => visible.has(id)));
}
