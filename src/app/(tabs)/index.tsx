import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';

import { HabitCheck } from '@/components/habit-check';
import { ThemedText } from '@/components/themed-text';
import { Button, Card, Row, Screen, SectionTitle } from '@/components/ui';
import { addEvent } from '@/features/events/repo';
import { listAnchors, listHabits, listLogs, setLog } from '@/features/habits/repo';
import { computeStreak } from '@/features/habits/streak';
import type { Habit, LogLevel } from '@/features/habits/types';
import { useFocusData } from '@/hooks/use-focus-data';
import { addDays, today } from '@/lib/date';
import { formatTime } from '@/lib/time';

export default function TodayScreen() {
  const db = useSQLiteContext();
  const date = today();

  const load = useCallback(async () => {
    const [anchors, habits, logs] = await Promise.all([
      listAnchors(db),
      listHabits(db),
      listLogs(db, addDays(date, -400)),
    ]);
    return { anchors, habits, logs };
  }, [db, date]);
  const { data, reload } = useFocusData(load);

  if (!data) return <Screen>{null}</Screen>;

  const active = data.habits.filter((h) => h.status === 'active');
  const daily = active.filter((h) => h.trackingType === 'daily');
  const decisions = active.filter((h) => h.trackingType === 'decision');
  const events = active.filter((h) => h.trackingType === 'event' && h.id !== 'obey');

  const datesFor = (id: string) => data.logs.filter((l) => l.habitId === id).map((l) => l.date);
  const levelFor = (id: string) =>
    data.logs.find((l) => l.habitId === id && l.date === date)?.level ?? null;

  const onLog = async (habit: Habit, level: LogLevel | null) => {
    await setLog(db, habit.id, date, level);
    reload();
  };

  const onDecision = async (habit: Habit, outcome: 'used' | 'skipped') => {
    await addEvent(db, { type: 'decision', habitId: habit.id, outcome, blocker: null, note: null });
  };

  // Group daily habits under the anchor they are stacked on.
  const groups = [
    ...data.anchors.map((a) => ({
      title: a.time ? `${a.name} · ${formatTime(a.time)}` : a.name,
      habits: daily.filter((h) => h.anchorId === a.id),
    })),
    { title: 'Anytime', habits: daily.filter((h) => !h.anchorId) },
  ].filter((g) => g.habits.length > 0);

  return (
    <Screen>
      <ThemedText type="subtitle">Today</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Every rep is a vote for who you are in Christ.
      </ThemedText>

      <Row>
        <Button label="Spirit nudged me" onPress={() => router.push('/nudge')} />
        {events.map((h) => (
          <Button
            key={h.id}
            label={h.name}
            variant="secondary"
            onPress={() => router.push({ pathname: '/protocol/[id]', params: { id: h.id } })}
          />
        ))}
      </Row>

      {groups.map((g) => (
        <Card key={g.title} style={{ padding: 0, backgroundColor: 'transparent' }}>
          <SectionTitle>{g.title}</SectionTitle>
          {g.habits.map((h) => (
            <HabitCheck
              key={h.id}
              habit={h}
              level={levelFor(h.id)}
              streak={computeStreak(datesFor(h.id), date)}
              onChange={(l) => onLog(h, l)}
            />
          ))}
        </Card>
      ))}

      {decisions.length > 0 ? <SectionTitle>At the decision point</SectionTitle> : null}
      {decisions.map((h) => (
        <Card key={h.id}>
          <ThemedText type="smallBold">{h.prompt}</ThemedText>
          {h.steps.map((s) => (
            <ThemedText key={s} type="small" themeColor="textSecondary">
              {s}
            </ThemedText>
          ))}
          <Row>
            <Button label="I asked it" variant="secondary" onPress={() => onDecision(h, 'used')} />
            <Button
              label="I skipped it"
              variant="secondary"
              onPress={() => onDecision(h, 'skipped')}
            />
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
