import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Card, Screen } from '@/components/ui';
import { addEvent } from '@/features/events/repo';
import { getHabit } from '@/features/habits/repo';
import { useFocusData } from '@/hooks/use-focus-data';

/** Event-triggered habit: walk the protocol step by step, then log it (e.g. offense → forgive). */
export default function ProtocolScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const load = useCallback(() => getHabit(db, id), [db, id]);
  const { data: habit } = useFocusData(load);
  const [done, setDone] = useState<Set<number>>(new Set());
  if (!habit) return <Screen tabs={false}>{null}</Screen>;

  const toggle = (i: number) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const finish = async () => {
    const complete = done.size === habit.steps.length;
    await addEvent(db, {
      type: 'offense',
      habitId: habit.id,
      outcome: complete ? 'forgave' : null,
      blocker: null,
      note: null,
    });
    router.back();
  };

  return (
    <Screen tabs={false}>
      <Stack.Screen options={{ title: habit.name }} />
      {habit.steps.map((s, i) => (
        <Pressable
          key={s}
          onPress={() => toggle(i)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: done.has(i) }}>
          <Card>
            <ThemedText type="smallBold" themeColor={done.has(i) ? 'success' : 'text'}>
              {done.has(i) ? '✓ ' : `${i + 1}. `}
              {s}
            </ThemedText>
          </Card>
        </Pressable>
      ))}
      <Button label="Log it" onPress={finish} />
    </Screen>
  );
}
