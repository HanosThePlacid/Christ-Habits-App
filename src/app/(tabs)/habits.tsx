import { Link, router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';
import { Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Card, Screen, SectionTitle } from '@/components/ui';
import { listHabits, listLogs } from '@/features/habits/repo';
import { computeStreak, consistency } from '@/features/habits/streak';
import type { Habit, TrackingType } from '@/features/habits/types';
import { useFocusData } from '@/hooks/use-focus-data';
import { addDays, today } from '@/lib/date';

const SECTIONS: { type: TrackingType; title: string }[] = [
  { type: 'daily', title: 'Daily' },
  { type: 'event', title: 'When it happens' },
  { type: 'decision', title: 'At the decision point' },
  { type: 'weekly', title: 'Weekly reflection' },
];

export default function HabitsScreen() {
  const db = useSQLiteContext();
  const date = today();
  const load = useCallback(
    async () => ({ habits: await listHabits(db), logs: await listLogs(db, addDays(date, -400)) }),
    [db, date],
  );
  const { data } = useFocusData(load);
  if (!data) return <Screen>{null}</Screen>;

  const summary = (h: Habit) => {
    if (h.status === 'parked') return 'Parked';
    if (h.trackingType !== 'daily') return h.kind === 'break' ? 'Breaking' : '';
    const dates = data.logs.filter((l) => l.habitId === h.id).map((l) => l.date);
    const s = computeStreak(dates, date);
    return `${s.streak} day streak · ${Math.round(consistency(dates, date) * 100)}% this week`;
  };

  return (
    <Screen>
      <ThemedText type="subtitle">Habits</ThemedText>
      {SECTIONS.map(({ type, title }) => {
        const habits = data.habits.filter((h) => h.trackingType === type);
        if (!habits.length) return null;
        return [
          <SectionTitle key={type}>{title}</SectionTitle>,
          ...habits.map((h) => (
            <Link key={h.id} href={{ pathname: '/habit/[id]', params: { id: h.id } }} asChild>
              <Pressable>
                <Card>
                  <ThemedText type="smallBold">{h.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {summary(h)}
                  </ThemedText>
                </Card>
              </Pressable>
            </Link>
          )),
        ];
      })}
      <Button
        label="Replay introduction & personalize"
        variant="secondary"
        onPress={() => router.push('/onboarding')}
      />
    </Screen>
  );
}
