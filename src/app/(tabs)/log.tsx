import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button, Card, Screen, SectionTitle } from '@/components/ui';
import { listEvents, type HabitEvent } from '@/features/events/repo';
import { obedienceStats } from '@/features/events/stats';
import { useFocusData } from '@/hooks/use-focus-data';

function describe(e: HabitEvent): string {
  if (e.type === 'nudge')
    return e.outcome === 'obeyed'
      ? 'Obeyed a nudge'
      : `Resisted a nudge${e.blocker ? ` (${e.blocker})` : ''}`;
  if (e.type === 'offense')
    return e.outcome === 'forgave' ? 'Offense — forgiven' : 'Offense — in progress';
  return e.outcome === 'used' ? 'Asked the wisdom question' : 'Skipped the wisdom question';
}

export default function LogScreen() {
  const db = useSQLiteContext();
  const load = useCallback(() => listEvents(db, 200), [db]);
  const { data: events } = useFocusData(load);
  if (!events) return <Screen>{null}</Screen>;

  const stats = obedienceStats(events);

  return (
    <Screen>
      <ThemedText type="subtitle">Obedience</ThemedText>
      <Card>
        <ThemedText type="title">
          {stats.rate === null ? '—' : `${Math.round(stats.rate * 100)}%`}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {stats.obeyed} obeyed · {stats.resisted} resisted
          {stats.topBlocker ? ` · most common blocker: ${stats.topBlocker}` : ''}
        </ThemedText>
        {stats.obeyed > 0 ? (
          <ThemedText type="small" themeColor="success">
            {stats.obeyed} times you obeyed — and it worked out every time.
          </ThemedText>
        ) : null}
      </Card>
      <Button label="Spirit nudged me" onPress={() => router.push('/nudge')} />

      {events.length > 0 ? <SectionTitle>Recent</SectionTitle> : null}
      {events.map((e) => (
        <Card key={e.id}>
          <ThemedText type="smallBold">{describe(e)}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {e.at}
          </ThemedText>
          {e.note ? <ThemedText type="small">{e.note}</ThemedText> : null}
        </Card>
      ))}
    </Screen>
  );
}
