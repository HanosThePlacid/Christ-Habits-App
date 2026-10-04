import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Row } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { formatTime, shiftTime, WEEKDAYS } from '@/lib/time';

export function Stepper({
  value,
  onChange,
  min,
  max,
  format = String,
}: {
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  format?: (n: number) => string;
}) {
  return (
    <View style={styles.stepper}>
      <Button label="−" variant="secondary" onPress={() => onChange(Math.max(min, value - 1))} />
      <ThemedText type="subtitle" style={styles.value}>
        {format(value)}
      </ThemedText>
      <Button label="+" variant="secondary" onPress={() => onChange(Math.min(max, value + 1))} />
    </View>
  );
}

/** Time picker in 15-minute steps — no native picker needed. */
export function TimeStepper({ value, onChange }: { value: string; onChange: (t: string) => void }) {
  return (
    <View style={styles.stepper}>
      <Button label="−1h" variant="secondary" onPress={() => onChange(shiftTime(value, -60))} />
      <Button label="−15" variant="secondary" onPress={() => onChange(shiftTime(value, -15))} />
      <ThemedText type="smallBold" style={styles.value}>
        {formatTime(value)}
      </ThemedText>
      <Button label="+15" variant="secondary" onPress={() => onChange(shiftTime(value, 15))} />
      <Button label="+1h" variant="secondary" onPress={() => onChange(shiftTime(value, 60))} />
    </View>
  );
}

export function Choice<T extends string | number>({
  options,
  value,
  onChange,
  label = String,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  label?: (v: T) => string;
}) {
  return (
    <Row>
      {options.map((o) => (
        <Button
          key={String(o)}
          label={label(o)}
          variant="secondary"
          selected={o === value}
          onPress={() => onChange(o)}
        />
      ))}
    </Row>
  );
}

export function WeekdayChoice({
  value,
  onChange,
}: {
  value: number;
  onChange: (d: number) => void;
}) {
  return (
    <Choice
      options={[1, 2, 3, 4, 5, 6, 7]}
      value={value}
      onChange={onChange}
      label={(d) => WEEKDAYS[d - 1]}
    />
  );
}

const styles = StyleSheet.create({
  stepper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flexWrap: 'wrap' },
  value: { minWidth: 72, textAlign: 'center' },
});
