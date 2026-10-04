import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Choice, Stepper, TimeStepper, WeekdayChoice } from '@/components/inputs';
import { ThemedText } from '@/components/themed-text';
import { Button, Card, Row, SectionTitle } from '@/components/ui';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { listAnchors, listHabits, updateAnchor, updateHabit } from '@/features/habits/repo';
import type { Habit } from '@/features/habits/types';
import {
  FINISH,
  HABIT_INTROS,
  HOW_IT_WORKS,
  PURPOSE,
  RHYTHMS,
  WELCOME,
  type Verse,
} from '@/features/onboarding/content';
import { initialPlan, planChanges, SCRIPTURE_FLOORS, type Plan } from '@/features/onboarding/plan';
import { ONBOARDED, setSetting } from '@/features/settings/repo';
import { useFocusData } from '@/hooks/use-focus-data';
import { useTheme } from '@/hooks/use-theme';
import { syncReminders } from '@/lib/notifications';
import { formatTime } from '@/lib/time';

type Step =
  | { kind: 'welcome' }
  | { kind: 'purpose' }
  | { kind: 'how' }
  | { kind: 'rhythms' }
  | { kind: 'habit'; habit: Habit }
  | { kind: 'finish' };

/**
 * First-launch introduction: who the app is, why it exists, then each habit one by one
 * with its lasting fruit and a chance to make it your own. Can be replayed from Habits.
 */
export default function Onboarding() {
  const db = useSQLiteContext();
  const load = useCallback(async () => {
    const [habits, anchors] = await Promise.all([
      listHabits(db, { includeArchived: true }),
      listAnchors(db),
    ]);
    return { habits, plan: initialPlan(habits, anchors) };
  }, [db]);
  const { data } = useFocusData(load);
  if (!data) return null;
  return <Flow habits={data.habits} initial={data.plan} />;
}

function Flow({ habits, initial }: { habits: Habit[]; initial: Plan }) {
  const db = useSQLiteContext();
  const theme = useTheme();
  const [plan, setPlan] = useState(initial);
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const steps: Step[] = [
    { kind: 'welcome' },
    { kind: 'purpose' },
    { kind: 'how' },
    { kind: 'rhythms' },
    ...habits.filter((h) => HABIT_INTROS[h.id]).map((habit) => ({ kind: 'habit' as const, habit })),
    { kind: 'finish' },
  ];
  const step = steps[index];
  const last = index === steps.length - 1;
  const update = (patch: Partial<Plan>) => setPlan((p) => ({ ...p, ...patch }));

  const finish = async () => {
    setSaving(true);
    const changes = planChanges(
      plan,
      habits.map((h) => h.id),
    );
    await db.withTransactionAsync(async () => {
      for (const h of changes.habits) await updateHabit(db, h);
      for (const a of changes.anchors) await updateAnchor(db, a);
      await setSetting(db, ONBOARDED, new Date().toISOString());
    });
    syncReminders(await listAnchors(db)).catch(console.warn);
    router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: theme.background }]}>
      <View style={[styles.progressTrack, { backgroundColor: theme.backgroundElement }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: theme.accent, width: `${((index + 1) / steps.length) * 100}%` },
          ]}
        />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <StepBody step={step} plan={plan} update={update} />
      </ScrollView>
      <View style={[styles.footer, { borderColor: theme.border }]}>
        {index > 0 ? (
          <Button label="Back" variant="secondary" onPress={() => setIndex(index - 1)} />
        ) : (
          <View />
        )}
        <ThemedText type="small" themeColor="textSecondary">
          {index + 1} / {steps.length}
        </ThemedText>
        <Button
          label={last ? (saving ? 'Saving…' : 'Begin') : index === 0 ? 'Start' : 'Next'}
          onPress={() => (last ? !saving && finish() : setIndex(index + 1))}
        />
      </View>
    </SafeAreaView>
  );
}

function StepBody({
  step,
  plan,
  update,
}: {
  step: Step;
  plan: Plan;
  update: (p: Partial<Plan>) => void;
}) {
  switch (step.kind) {
    case 'welcome':
      return (
        <>
          <ThemedText type="title">{WELCOME.title}</ThemedText>
          <Paragraphs lines={WELCOME.lines} />
        </>
      );
    case 'purpose':
      return (
        <>
          <ThemedText type="subtitle">{PURPOSE.title}</ThemedText>
          <Paragraphs lines={PURPOSE.lines} />
          <VerseCard verse={PURPOSE.verse} />
        </>
      );
    case 'how':
      return (
        <>
          <ThemedText type="subtitle">{HOW_IT_WORKS.title}</ThemedText>
          {HOW_IT_WORKS.points.map((p) => (
            <Card key={p.heading}>
              <ThemedText type="smallBold">{p.heading}</ThemedText>
              <ThemedText type="small">{p.body}</ThemedText>
            </Card>
          ))}
        </>
      );
    case 'rhythms':
      return (
        <>
          <ThemedText type="subtitle">{RHYTHMS.title}</ThemedText>
          <ThemedText themeColor="textSecondary">{RHYTHMS.intro}</ThemedText>
          <Field label={RHYTHMS.morning.label} hint={RHYTHMS.morning.hint}>
            <TimeStepper value={plan.morningTime} onChange={(t) => update({ morningTime: t })} />
          </Field>
          <Field label={RHYTHMS.peace.label} hint={RHYTHMS.peace.hint}>
            <TimeStepper value={plan.peaceTime} onChange={(t) => update({ peaceTime: t })} />
          </Field>
        </>
      );
    case 'habit':
      return <HabitStep habit={step.habit} plan={plan} update={update} />;
    case 'finish':
      return (
        <>
          <ThemedText type="subtitle">{FINISH.title}</ThemedText>
          <Paragraphs lines={FINISH.lines} />
          <Card>
            <ThemedText type="small">Morning prayer · {formatTime(plan.morningTime)}</ThemedText>
            <ThemedText type="small">Time of peace · {formatTime(plan.peaceTime)}</ThemedText>
            <ThemedText type="small">
              Bible: {plan.scriptureFloor} → {plan.scriptureTarget} chapters
            </ThemedText>
          </Card>
        </>
      );
  }
}

function HabitStep({
  habit,
  plan,
  update,
}: {
  habit: Habit;
  plan: Plan;
  update: (p: Partial<Plan>) => void;
}) {
  const intro = HABIT_INTROS[habit.id];
  const included = plan.include[habit.id] ?? true;
  const setIncluded = (v: boolean) => update({ include: { ...plan.include, [habit.id]: v } });

  return (
    <>
      <ThemedText type="subtitle">{habit.name}</ThemedText>
      <ThemedText>{intro.what}</ThemedText>
      <Card>
        <ThemedText type="small" themeColor="textSecondary">
          Who you are
        </ThemedText>
        <ThemedText type="smallBold">{habit.identity}</ThemedText>
      </Card>

      <SectionTitle>Lasting fruit</SectionTitle>
      {intro.benefits.map((b) => (
        <ThemedText key={b}>• {b}</ThemedText>
      ))}
      {intro.verses.map((v) => (
        <VerseCard key={v.ref} verse={v} />
      ))}

      <SectionTitle>Make it yours</SectionTitle>
      <Choice
        options={['yes', 'no'] as const}
        value={included ? 'yes' : 'no'}
        onChange={(v) => setIncluded(v === 'yes')}
        label={(v) => (v === 'yes' ? 'Include this habit' : 'Not now')}
      />
      {included ? <Personalize habit={habit} plan={plan} update={update} /> : null}
    </>
  );
}

function Personalize({
  habit,
  plan,
  update,
}: {
  habit: Habit;
  plan: Plan;
  update: (p: Partial<Plan>) => void;
}) {
  switch (habit.id) {
    case 'scripture':
      return (
        <>
          <Field label="Daily goal (target)" hint="What a full day in the Word looks like for you.">
            <Stepper
              value={plan.scriptureTarget}
              onChange={(n) => update({ scriptureTarget: n })}
              min={1}
              max={30}
              format={(n) => `${n} ch`}
            />
          </Field>
          <Field label="Floor (your worst day)" hint="Still counts. Keeps the streak alive.">
            <Choice
              options={SCRIPTURE_FLOORS}
              value={plan.scriptureFloor}
              onChange={(f) => update({ scriptureFloor: f })}
            />
          </Field>
        </>
      );
    case 'tongues':
      return (
        <>
          <Field label="Floor" hint="Start small — it grows into a background prayer.">
            <Stepper
              value={plan.tonguesMinutes}
              onChange={(n) => update({ tonguesMinutes: n })}
              min={1}
              max={60}
              format={(n) => `${n} min`}
            />
          </Field>
          <Field label="When">
            <Choice
              options={['morning', 'garden'] as const}
              value={plan.tonguesAnchor}
              onChange={(a) => update({ tonguesAnchor: a })}
              label={(a) =>
                a === 'morning'
                  ? `Morning prayer (${formatTime(plan.morningTime)})`
                  : `Time of peace (${formatTime(plan.peaceTime)})`
              }
            />
          </Field>
        </>
      );
    case 'serve':
      return (
        <Field label="Weekly reminder to confirm commitments" hint="E.g. hospital ministry.">
          <WeekdayChoice value={plan.serveDay} onChange={(d) => update({ serveDay: d })} />
          <TimeStepper value={plan.serveTime} onChange={(t) => update({ serveTime: t })} />
        </Field>
      );
    case 'fasting':
      return (
        <Field label="Status">
          <Choice
            options={['parked', 'active'] as const}
            value={plan.fastingActive ? 'active' : 'parked'}
            onChange={(v) => update({ fastingActive: v === 'active' })}
            label={(v) => (v === 'active' ? 'Start now' : 'Later — ask me weekly')}
          />
        </Field>
      );
    default:
      return habit.steps.length ? (
        <Card>
          {habit.steps.map((s, i) => (
            <ThemedText key={s} type="small">
              {i + 1}. {s}
            </ThemedText>
          ))}
        </Card>
      ) : null;
  }
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <Card>
      <ThemedText type="smallBold">{label}</ThemedText>
      {hint ? (
        <ThemedText type="small" themeColor="textSecondary">
          {hint}
        </ThemedText>
      ) : null}
      <Row>{children}</Row>
    </Card>
  );
}

function VerseCard({ verse }: { verse: Verse }) {
  return (
    <Card>
      <ThemedText style={styles.verse}>“{verse.text}”</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {verse.ref} (KJV)
      </ThemedText>
    </Card>
  );
}

function Paragraphs({ lines }: { lines: string[] }) {
  return lines.map((l) => <ThemedText key={l}>{l}</ThemedText>);
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  progressTrack: { height: 4, width: '100%' },
  progressFill: { height: 4 },
  verse: { fontStyle: 'italic' },
});
