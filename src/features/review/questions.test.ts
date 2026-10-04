import { pruneAnswers, questionSequence, WEEKLY_QUESTIONS } from './questions';

const ids = (a: Record<string, string>) => questionSequence(WEEKLY_QUESTIONS, a).map((q) => q.id);

describe('weekly reflection branching', () => {
  it('hides follow-ups until triggered', () => {
    expect(ids({})).not.toContain('wisdom-skipped');
  });

  it('shows follow-up right after the triggering answer', () => {
    const seq = ids({ wisdom: 'No' });
    expect(seq.indexOf('wisdom-skipped')).toBe(seq.indexOf('wisdom') + 1);
  });

  it('prunes follow-up answers when the parent answer changes', () => {
    const pruned = pruneAnswers(WEEKLY_QUESTIONS, { wisdom: 'Yes', 'wisdom-skipped': 'games' });
    expect(pruned).toEqual({ wisdom: 'Yes' });
  });
});
