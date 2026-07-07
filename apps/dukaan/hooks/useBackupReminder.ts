import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import Constants from "expo-constants";

export type BackupFrequency = "off" | "daily" | "weekly" | "monthly";

const STORAGE_KEY = "store_backup_frequency";

let Notifications: any = null;
const isExpoGo = Constants.appOwnership === "expo";

if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (e) {
    console.warn("Failed to load expo-notifications", e);
  }
}

export function useBackupReminder() {
  const [frequency, setFrequencyState] = useState<BackupFrequency>("off");

  useEffect(() => {
    async function load() {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFrequencyState(stored as BackupFrequency);
      }
    }
    load();
  }, []);

  const setFrequency = useCallback(async (newFreq: BackupFrequency) => {
    // Save preference immediately
    setFrequencyState(newFreq);
    await AsyncStorage.setItem(STORAGE_KEY, newFreq);

    if (!Notifications) {
      if (newFreq !== "off") {
        Alert.alert(
          "Expo Go Mode",
          "Reminder notifications will not trigger while testing in Expo Go, but your preference has been saved for the standalone app."
        );
      }
      return;
    }

    // 1. Cancel all existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (newFreq === "off") return;

    // 3. Request permissions
    const permissions = (await Notifications.getPermissionsAsync()) as any;
    let finalGranted = permissions.status === "granted" || permissions.granted;
    if (!finalGranted && permissions.canAskAgain) {
      const requested = (await Notifications.requestPermissionsAsync()) as any;
      finalGranted = requested.status === "granted" || requested.granted;
    }

    if (!finalGranted) {
      Alert.alert(
        "Permission Required",
        "Please enable notifications in your phone settings to receive backup reminders."
      );
      setFrequencyState("off");
      await AsyncStorage.setItem(STORAGE_KEY, "off");
      return;
    }

    // 4. Schedule new notification
    let seconds = 0;
    if (newFreq === "daily") seconds = 86400; // 24 hours
    else if (newFreq === "weekly") seconds = 604800; // 7 days
    else if (newFreq === "monthly") seconds = 2592000; // 30 days

    if (seconds > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time to Backup! 💾",
          body: "Don't forget to backup your Shop-Register-Pro data to Google Drive to keep it safe.",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds,
          repeats: true,
        },
      });
    }
  }, []);

  return { frequency, setFrequency };
}
