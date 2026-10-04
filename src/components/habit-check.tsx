import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Card, Row } from '@/components/ui';
import type { StreakResult } from '@/features/habits/streak';
import type { Habit, LogLevel } from '@/features/habits/types';

interface Props {
  habit: Habit;
  level: LogLevel | null;
  streak: StreakResult;
  onChange: (level: LogLevel | null) => void;
}

/** Daily check-in: the floor (2-minute version) counts as a pass, the target is the goal. */
export function HabitCheck({ habit, level, streak, onChange }: Props) {
  const toggle = (l: LogLevel) => onChange(level === l ? null : l);
  return (
    <Card>
      <View style={styles.header}>
        <ThemedText type="smallBold" style={styles.name}>
          {habit.name}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {streak.streak > 0 ? `${streak.streak} day${streak.streak === 1 ? '' : 's'}` : ''}
        </ThemedText>
      </View>
      {streak.atRisk && !level ? (
        <ThemedText type="small" themeColor="warning">
          Missed yesterday — never miss twice. The floor counts.
        </ThemedText>
      ) : null}
      <Row>
        <Button
          label={`Floor: ${habit.floor ?? 'done'}`}
          variant="secondary"
          selected={level === 'floor'}
          onPress={() => toggle('floor')}
        />
        {habit.target ? (
          <Button
            label={`Target: ${habit.target}`}
            variant="secondary"
            selected={level === 'target'}
            onPress={() => toggle('target')}
          />
        ) : null}
      </Row>
      {level ? (
        <ThemedText type="small" themeColor="success">
          Vote cast: {habit.identity}
        </ThemedText>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { flexShrink: 1 },
});
