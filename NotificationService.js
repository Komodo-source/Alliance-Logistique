import React, { useEffect, useState } from "react";
import { View, Button, Text } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import * as FileManager from './screens/util/file-manager' ;

// Configure how notifications are shown when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function NotificationService() {
  const [expoPushToken, setExpoPushToken] = useState("");
  var id = null;

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        // Send token to backend
        fetch("https://backend-logistique-api-latest.onrender.com/save_token.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: id,   // replace with logged-in user id
            token: token
          })
        });
      }
    });
  }, []);

  useEffect(async() => {
    id = await FileManager.read_file("auto.json")["id"];
  }, [id])

  return (
    <View style={{ marginTop: 50, padding: 20 }}>
      <Text>Your Expo Push Token:</Text>
      <Text selectable>{expoPushToken}</Text>
      <Button
        title="Test Notification"
        onPress={() => {
          fetch("https://backend-logistique-api-latest.onrender.com/send_notification.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: id, payload_num: 1}) // trigger from backend
          });
        }}
      />
    </View>
  );
}


async function registerForPushNotificationsAsync() {
  let token;

  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Failed to get push token!");
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo push token:", token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
}
