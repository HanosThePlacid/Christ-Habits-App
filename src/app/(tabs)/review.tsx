import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Card, Row, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import {
  pruneAnswers,
  questionSequence,
  WEEKLY_QUESTIONS,
  type Answers,
} from '@/features/review/questions';
import { getReview, saveReview } from '@/features/review/repo';
import { useFocusData } from '@/hooks/use-focus-data';
import { useTheme } from '@/hooks/use-theme';
import { today, weekStart } from '@/lib/date';

/** One question per screen so it feels like a conversation, not a form. */
export default function ReviewScreen() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const week = weekStart(today());
  const load = useCallback(() => getReview(db, week), [db, week]);
  const { data: saved } = useFocusData(load);

  const [answers, setAnswers] = useState<Answers | null>(null);
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState('');

  if (saved === undefined) return <Screen>{null}</Screen>;
  const current = answers ?? saved ?? {};
  const sequence = questionSequence(WEEKLY_QUESTIONS, current);
  const finished = index >= sequence.length;
  const q = sequence[index];

  const answer = async (value: string) => {
    const next = pruneAnswers(WEEKLY_QUESTIONS, { ...current, [q.id]: value });
    setAnswers(next);
    await saveReview(db, week, next);
    setDraft('');
    setIndex(index + 1);
  };

  const goTo = (i: number) => {
    setIndex(i);
    const target = sequence[i];
    setDraft(target ? (current[target.id] ?? '') : '');
  };

  return (
    <Screen>
      <ThemedText type="subtitle">Weekly reflection</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Week of {week} · {Math.min(index + 1, sequence.length)} / {sequence.length}
      </ThemedText>

      {finished ? (
        <Card>
          <ThemedText type="smallBold">Saved. Thank you for being honest.</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            You can revisit and change answers any time this week.
          </ThemedText>
          <Button label="Start over" variant="secondary" onPress={() => goTo(0)} />
        </Card>
      ) : (
        <Card>
          <ThemedText type="smallBold">{q.text}</ThemedText>
          {q.hint ? (
            <ThemedText type="small" themeColor="textSecondary">
              {q.hint}
            </ThemedText>
          ) : null}
          {q.kind === 'choice' ? (
            <Row>
              {q.options?.map((o) => (
                <Button
                  key={o}
                  label={o}
                  variant="secondary"
                  selected={current[q.id] === o}
                  onPress={() => answer(o)}
                />
              ))}
            </Row>
          ) : (
            <>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                multiline
                placeholder="Be honest — only you see this."
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.border }]}
              />
              <Row>
                <Button label="Next" onPress={() => answer(draft.trim())} />
                <Button label="Skip" variant="secondary" onPress={() => goTo(index + 1)} />
              </Row>
            </>
          )}
          {index > 0 ? (
            <Button label="Back" variant="secondary" onPress={() => goTo(index - 1)} />
          ) : null}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
