import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import { useColorScheme } from 'react-native';

import { migrateDbIfNeeded } from '@/db/migrations';
import { listAnchors } from '@/features/habits/repo';
import { syncReminders } from '@/lib/notifications';

async function initDb(db: SQLiteDatabase) {
  await migrateDbIfNeeded(db);
  // Reminders are best-effort — a denied permission must not block the app.
  syncReminders(await listAnchors(db)).catch(console.warn);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SQLiteProvider databaseName="christ-habits.db" onInit={initDb}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="habit/[id]" options={{ title: 'Habit' }} />
          <Stack.Screen name="nudge" options={{ title: 'Spirit nudge', presentation: 'modal' }} />
          <Stack.Screen
            name="protocol/[id]"
            options={{ title: 'Protocol', presentation: 'modal' }}
          />
        </Stack>
      </SQLiteProvider>
    </ThemeProvider>
  );
}
