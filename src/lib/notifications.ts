import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

import type { Anchor } from '@/features/habits/types';

type NotificationsModule = typeof import('expo-notifications');

/** Weekday numbering used by expo-notifications WEEKLY triggers. */
const SUNDAY = 1;

/** Fixed reminders that are not tied to an anchor. */
const SYSTEM_REMINDERS = [
  {
    title: 'Evening check-in',
    body: 'Log today: Scripture, tongues.',
    hour: 21,
    minute: 0,
    weekday: null,
  },
  {
    title: 'Weekly reflection',
    body: 'Time for an honest look at this week.',
    hour: 19,
    minute: 0,
    weekday: SUNDAY,
  },
] as const;

/**
 * Reminders need a development/preview build: on Android, merely importing
 * expo-notifications inside Expo Go throws. So the module is required lazily and
 * skipped in Expo Go and on web.
 */
export const remindersSupported = Platform.OS !== 'web' && !isRunningInExpoGo();

function loadNotifications(): NotificationsModule {
  // `require` (not `import()`) so Metro only evaluates the module when this runs.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Notifications: NotificationsModule = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  return Notifications;
}

async function ensurePermission(Notifications: NotificationsModule): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

async function schedule(
  Notifications: NotificationsModule,
  title: string,
  body: string,
  hour: number,
  minute: number,
  weekday: number | null,
) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger:
      weekday === null
        ? {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
            channelId: 'reminders',
          }
        : {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday,
            hour,
            minute,
            channelId: 'reminders',
          },
  });
}

/**
 * Reminders attach to anchors, not individual habits: one garden-time nudge covers
 * Scripture, tongues and listening. Rescheduled from scratch whenever anchors change.
 */
export async function syncReminders(anchors: Anchor[]) {
  if (!remindersSupported) return;
  const Notifications = loadNotifications();
  if (!(await ensurePermission(Notifications))) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const a of anchors) {
    if (!a.time || !a.reminderText) continue;
    const [hour, minute] = a.time.split(':').map(Number);
    const days = a.days.length ? a.days : [null];
    for (const weekday of days) {
      await schedule(Notifications, a.name, a.reminderText, hour, minute, weekday);
    }
  }
  for (const r of SYSTEM_REMINDERS) {
    await schedule(Notifications, r.title, r.body, r.hour, r.minute, r.weekday);
  }
}
