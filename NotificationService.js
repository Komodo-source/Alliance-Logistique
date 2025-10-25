import React, { useEffect, useState } from "react";
import { View, Button, Text } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

// Configure how notifications are shown when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function NotificationService({ userId }) {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [loading, setLoading] = useState(true);


async function registerForPushNotificationsAsync() {
  let token;

  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notificatkfoions.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Failed to get push notification permissions!");
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo push token:", token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
}


  // Register for push notifications and save token
  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => {
        if (token) {
          setExpoPushToken(token);
          console.log("Token registered:", token);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Save token to backend when userId or token changes
  useEffect(() => {
    if (userId && expoPushToken) {
      saveTokenToBackend(userId, expoPushToken);
    }
  }, [userId, expoPushToken]);

  // Listen for notifications when app is foregrounded
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      }
    );

    return () => subscription.remove();
  }, []);

  const saveTokenToBackend = async (user_id, token) => {
    try {
      const response = await fetch(
        "https://backend-logistique-api-latest.onrender.com/save_token.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id, token }),
        }
      );
      const data = await response.json();
      console.log("Token saved to backend:", data);
    } catch (error) {
      console.error("Failed to save token:", error);
    }
  };

  const testNotification = async () => {
    if (!userId) {
      alert("User ID not available");
      return;
    }

    try {
      const response = await fetch(
        "https://backend-logistique-api-latest.onrender.com/send_notification.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            payload_num: 1,
          }),
        }
      );
      const data = await response.json();
      console.log("Notification sent:", data);
    } catch (error) {
      console.error("Failed to send notification:", error);
      alert("Failed to send notification");
    }
  };

  return (
    <View style={{ marginTop: 50, padding: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>
        Expo Push Token:
      </Text>
      <Text
        selectable
        style={{
          padding: 10,
          backgroundColor: "#f0f0f0",
          marginBottom: 20,
          borderRadius: 5,
        }}
      >
        {loading ? "Loading..." : expoPushToken || "No token"}
      </Text>
      <Text style={{ marginBottom: 10, color: "#666" }}>
        User ID: {userId || "Not provided"}
      </Text>
      <Button
        title="Test Notification"
        onPress={testNotification}
        disabled={!userId || loading}
      />
    </View>
  );
}
