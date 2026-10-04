import { SEED_ANCHORS, SEED_HABITS } from '@/db/seed';

import { initialPlan, planChanges } from './plan';

const habits = SEED_HABITS.map((h, i) => ({ ...h, sort: i }));

describe('onboarding plan', () => {
  it('starts from the saved habits and anchors', () => {
    const plan = initialPlan(habits, SEED_ANCHORS);
    expect(plan.scriptureTarget).toBe(7);
    expect(plan.tonguesMinutes).toBe(2);
    expect(plan.peaceTime).toBe('17:00');
    expect(plan.serveDay).toBe(2);
    expect(plan.fastingActive).toBe(false);
    expect(plan.include.purity).toBe(true);
  });

  it('turns choices into habit and anchor updates', () => {
    const plan = {
      ...initialPlan(habits, SEED_ANCHORS),
      scriptureTarget: 3,
      tonguesMinutes: 1,
      tonguesAnchor: 'morning' as const,
      include: { ...initialPlan(habits, SEED_ANCHORS).include, wisdom: false },
    };
    const { habits: patches, anchors } = planChanges(
      plan,
      habits.map((h) => h.id),
    );
    const byId = Object.fromEntries(patches.map((p) => [p.id, p]));
    expect(byId.scripture.target).toBe('3 chapters');
    expect(byId.tongues).toMatchObject({ floor: '1 minute', anchorId: 'morning' });
    expect(byId.wisdom.status).toBe('archived');
    expect(byId.fasting.status).toBe('parked');
    expect(anchors.find((a) => a.id === 'garden')?.name).toBe('Time of peace');
  });

  it('round-trips: replaying the intro starts from the saved choices', () => {
    const plan = { ...initialPlan(habits, SEED_ANCHORS), scriptureTarget: 4, fastingActive: true };
    const { habits: patches } = planChanges(
      plan,
      habits.map((h) => h.id),
    );
    const saved = habits.map((h) => ({ ...h, ...patches.find((p) => p.id === h.id) }));
    const again = initialPlan(saved, SEED_ANCHORS);
    expect(again.scriptureTarget).toBe(4);
    expect(again.fastingActive).toBe(true);
  });
});
