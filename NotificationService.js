import React, { useEffect, useState } from "react";
import { View, Button, Text } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import * as FileManager from './screens/util/file-manager.js'
import { debbug_log } from "./screens/util/debbug.js";

// Configure how notifications are shown when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Exported function to generate local notification
export const generateLocalNotification = async (title, body) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
    },
    trigger: null,
  });
};

// Exported function to register for push notifications
export async function registerForPushNotificationsAsync() {
  let token;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Failed to get push notification permissions!");
    return null;
  }

  token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log("Expo push token:", token);

  return token;
}

// Exported function to save token to backend
export const saveTokenToBackend = async (token) => {
  try {
    const data = await FileManager.read_file("auto.json");
    const { session_id, type } = data;

    const response = await fetch(
      "https://backend-logistique-api-latest.onrender.com/registerTokenNotification.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id, token, type }),
      }
    );
    const result = await response.json();
    console.log("Token saved to backend:", result);
    return result;
  } catch (error) {
    console.error("Failed to save token:", error);
    throw error;
  }
};

// Exported function to send test notification
export const sendTestNotification = async (payloadInt) => {
  try {
    const data = await FileManager.read_file("auto.json");
    const { session_id, type } = data;

    if (!session_id) {
      throw new Error("User ID not available");
    }

    const response = await fetch(
      "https://backend-logistique-api-latest.onrender.com/sendNotification.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: session_id,
          payload_num: payloadInt,
          type: type
        }),
      }
    );
    const result = await response.json();
    console.log("Notification sent:", result);
    return result;
  } catch (error) {
    console.error("Failed to send notification:", error);
    throw error;
  }
};

// Exported function to setup notification listener (stays active when app is open)
export const setupNotificationListener = (callback) => {
  const subscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log("Notification received (app open):", notification);
      if (callback) {
        callback(notification);
      }
    }
  );
  // Don't remove - let it stay active to always wait for notifications
  return subscription;
};

// Exported function to handle notification taps (when app was closed/background)
export const setupNotificationResponseListener = (callback) => {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log("Notification tapped:", response);
      if (callback) {
        callback(response);
      }
    }
  );
  // Don't remove - let it stay active
  return subscription;
};

// Component for automatic setup (optional to use)
const NotificationService = ({ navigation }) => {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [session_id, setSessionID] = useState("");
  const [type, setType] = useState("");

  const getUserData = async () => {
    const data = await FileManager.read_file("auto.json");
    setSessionID(data.session_id);
    setType(data.type);
    debbug_log("type: " + data.type, "cyan");
    debbug_log("session_id: " + data.session_id, "cyan");
  };

  // Register for push notifications and save token
  useEffect(() => {
    getUserData();
    registerForPushNotificationsAsync()
      .then(token => {
        if (token) {
          setExpoPushToken(token);
          console.log("Token registered:", token);
        } else {
          console.log("No token received");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Save token to backend when session_id or token changes
  useEffect(() => {
    if (session_id && expoPushToken) {
      saveTokenToBackend(expoPushToken);
    }
  }, [session_id, expoPushToken]);

  // Listen for notifications when app is foregrounded
  useEffect(() => {
    const subscription = setupNotificationListener();
    return () => subscription.remove();
  }, []);

  return null; // This component doesn't render anything
};

export default NotificationService;
