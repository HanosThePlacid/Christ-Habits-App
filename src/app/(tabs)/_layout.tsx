import { Redirect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useCallback } from 'react';

import { getSetting, ONBOARDED } from '@/features/settings/repo';
import { useFocusData } from '@/hooks/use-focus-data';
import { useTheme } from '@/hooks/use-theme';

export default function TabsLayout() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const load = useCallback(async () => ({ onboarded: !!(await getSetting(db, ONBOARDED)) }), [db]);
  const { data } = useFocusData(load);

  if (!data) return null;
  if (!data.onboarded) return <Redirect href="/onboarding" />;
  return (
    <NativeTabs
      backgroundColor={theme.background}
      indicatorColor={theme.backgroundElement}
      labelStyle={{ selected: { color: theme.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'sun.max', selected: 'sun.max.fill' }} md="today" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="habits">
        <NativeTabs.Trigger.Label>Habits</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="checklist" md="checklist" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="log">
        <NativeTabs.Trigger.Label>Obedience</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'flame', selected: 'flame.fill' }}
          md="local_fire_department"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="review">
        <NativeTabs.Trigger.Label>Weekly</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
