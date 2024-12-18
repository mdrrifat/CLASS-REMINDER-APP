import notifee, { AndroidImportance } from '@notifee/react-native';
import moment from 'moment';

export async function registerForPushNotificationsAsync() {
  // No explicit registration required for Notifee
}

export async function scheduleNotification(classDetails, time, title, body) {
  await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title: title,
    body: body,
    android: {
      channelId: 'default',
      smallIcon: 'ic_launcher', // Ensure you have a small icon in your drawable folder
      pressAction: {
        id: 'default',
      },
    },
  });

  const trigger = {
    type: notifee.TriggerType.TIMESTAMP,
    timestamp: time,
  };

  await notifee.createTriggerNotification(
    {
      title: title,
      body: body,
      android: {
        channelId: 'default',
        smallIcon: 'ic_launcher',
        pressAction: {
          id: 'default',
        },
      },
    },
    trigger
  );
}
