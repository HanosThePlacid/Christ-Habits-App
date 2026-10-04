import { Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Card, Screen, SectionTitle } from '@/components/ui';
import { getHabit } from '@/features/habits/repo';
import { useFocusData } from '@/hooks/use-focus-data';

/** Shows the habit through the Atomic Habits lens: identity, cue, floor, friction, reward. */
export default function HabitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const load = useCallback(() => getHabit(db, id), [db, id]);
  const { data: habit } = useFocusData(load);
  if (!habit) return <Screen tabs={false}>{null}</Screen>;

  const fields: [string, string | null][] = [
    ['Identity', habit.identity],
    ['Cue / habit stack', habit.cue],
    ['Floor (2-minute version)', habit.floor],
    ['Target', habit.target],
    ['Friction fix', habit.frictionFix],
    ['Reward', habit.reward],
    ['Decision question', habit.prompt],
  ];

  return (
    <Screen tabs={false}>
      <Stack.Screen options={{ title: habit.name }} />
      {fields
        .filter(([, v]) => v)
        .map(([label, v]) => (
          <Card key={label}>
            <ThemedText type="small" themeColor="textSecondary">
              {label}
            </ThemedText>
            <ThemedText>{v}</ThemedText>
          </Card>
        ))}
      {habit.steps.length > 0 ? (
        <>
          <SectionTitle>{habit.kind === 'break' ? 'Inversion checklist' : 'Steps'}</SectionTitle>
          {habit.steps.map((s, i) => (
            <ThemedText key={s}>
              {i + 1}. {s}
            </ThemedText>
          ))}
        </>
      ) : null}
    </Screen>
  );
}
