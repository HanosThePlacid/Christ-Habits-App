import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Row, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { addEvent, addJournalEntry, type Blocker } from '@/features/events/repo';
import { useTheme } from '@/hooks/use-theme';

const BLOCKERS: Blocker[] = ['busy', 'doubt', 'fear', 'other'];

/**
 * One-tap log of a Holy Spirit nudge. Obeying is followed right away by
 * "That was Him, that worked" — reinforcement before doubt creeps back in.
 */
export default function NudgeScreen() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const [outcome, setOutcome] = useState<'obeyed' | 'resisted' | null>(null);
  const [blocker, setBlocker] = useState<Blocker | null>(null);
  const [note, setNote] = useState('');

  const save = async () => {
    if (!outcome) return;
    await addEvent(db, {
      type: 'nudge',
      habitId: 'obey',
      outcome,
      blocker: outcome === 'resisted' ? blocker : null,
      note: note.trim() || null,
    });
    if (outcome === 'obeyed' && note.trim()) await addJournalEntry(db, 'testimony', note.trim());
    router.back();
  };

  return (
    <Screen tabs={false}>
      <ThemedText type="subtitle">The Spirit nudged me</ThemedText>
      <Row>
        <Button
          label="I obeyed"
          variant="secondary"
          selected={outcome === 'obeyed'}
          onPress={() => setOutcome('obeyed')}
        />
        <Button
          label="I resisted"
          variant="secondary"
          selected={outcome === 'resisted'}
          onPress={() => setOutcome('resisted')}
        />
      </Row>

      {outcome === 'obeyed' ? (
        <ThemedText type="smallBold" themeColor="success">
          That was Him — and it worked. What happened?
        </ThemedText>
      ) : null}

      {outcome === 'resisted' ? (
        <>
          <ThemedText type="smallBold">What held me back?</ThemedText>
          <Row>
            {BLOCKERS.map((b) => (
              <Button
                key={b}
                label={b}
                variant="secondary"
                selected={blocker === b}
                onPress={() => setBlocker(b)}
              />
            ))}
          </Row>
          <ThemedText type="small" themeColor="textSecondary">
            Next time: decide in advance — when the nudge comes, I stop. No debate.
          </ThemedText>
        </>
      ) : null}

      {outcome ? (
        <>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder={outcome === 'obeyed' ? 'Testimony (saved to journal)' : 'Note (optional)'}
            placeholderTextColor={theme.textSecondary}
            multiline
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          />
          <Button label="Save" onPress={save} />
        </>
      ) : null}
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
