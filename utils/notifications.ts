import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Task } from './storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
};

export const scheduleDailyNotifications = async (tasks?: Task[]): Promise<void> => {
  if (Platform.OS === 'web') {
    return;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();

  let morningBody = 'Time to check your daily tasks and be creative!';
  let afternoonBody = "How's your progress? Keep going!";
  let eveningBody = 'Review your tasks and finish strong!';

  if (tasks) {
    const priorityTasks = tasks.filter(t => t.priority && !t.completed);
    if (priorityTasks.length > 0) {
      const priorityNames = priorityTasks.slice(0, 2).map(t => t.text).join(', ');
      const priorityMessage = priorityTasks.length > 2
        ? `🚩 Priority: ${priorityNames} + ${priorityTasks.length - 2} more`
        : `🚩 Priority: ${priorityNames}`;

      morningBody = `${priorityMessage}\n${morningBody}`;
      afternoonBody = `${priorityMessage}\n${afternoonBody}`;
      eveningBody = `${priorityMessage}\n${eveningBody}`;
    }
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌅 Good Morning!',
      body: morningBody,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 7,
      minute: 0,
    },
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '☀️ Afternoon Check-in',
      body: afternoonBody,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 15,
      minute: 0,
    },
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌆 Evening Reminder',
      body: eveningBody,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 19,
      minute: 0,
    },
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌙 Log Your Mood',
      body: 'How are you feeling today? Take a moment to log your mood.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 21,
      minute: 0,
    },
  });
};
