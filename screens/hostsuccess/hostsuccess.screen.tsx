"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URI } from "@/utils/uri";
import React from "react";

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;

  // Check if device is physical (not simulator/emulator)
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If permission not granted, request it
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Alert.alert("Failed to get push token for push notification!");
      return;
    }

    try {
      // For production builds
      if (!__DEV__) {
        try {
          // Try to get device push token first (for standalone apps)
          token = (await Notifications.getDevicePushTokenAsync()).data;
          console.log("Device push token obtained:", token);
        } catch (error) {
          console.log(
            "Error getting device push token, falling back to Expo token:",
            error
          );
        }
      }

      // Fallback to Expo push token if device token fails or in development
      if (!token) {
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId: "f839693f-10e9-4880-aabd-d57006db94a3",
          })
        ).data;
        console.log("Expo push token obtained:", token);
      }
    } catch (error) {
      console.error("Error getting push token:", error);
    }
  } else {
    console.log("Must use physical device for Push Notifications");
  }

  // For Android, set notification channel
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#20B2AA",
      sound: "notification.mp3", // Make sure this matches your sound file name
    });
  }

  return token;
}

const HostSuccessScreen = () => {
  const [isTokenRegistered, setIsTokenRegistered] = useState(false);

  useEffect(() => {
    const setupPushNotifications = async () => {
      try {
        // Register for push notifications
        const token = await registerForPushNotificationsAsync();

        if (token) {
          console.log("Attempting to register token with server:", token);
          const accessToken = await AsyncStorage.getItem("access_token");

          if (!accessToken) {
            console.error("No access token found");
            return;
          }

          // Register token with server
          const response = await axios.put(
            `${SERVER_URI}/update-host-push-token`,
            { pushToken: token },
            { headers: { access_token: accessToken } }
          );

          if (response.data.success) {
            console.log("Push token registered successfully:", token);
            setIsTokenRegistered(true);

            // Save token locally for reference
            await AsyncStorage.setItem("push_token", token);
          } else {
            console.error(
              "Server rejected push token registration:",
              response.data
            );
          }
        }
      } catch (error) {
        console.error("Error registering push token:", error);

        // Retry once after a delay if failed
        setTimeout(() => {
          if (!isTokenRegistered) {
            setupPushNotifications();
          }
        }, 5000);
      }
    };

    // Set up notification listener
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      }
    );

    setupPushNotifications();

    // Clean up
    return () => {
      subscription.remove();
    };
  }, [isTokenRegistered]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Image
        style={styles.backgroundimage}
        source={require("@/assets/images/hostsuccessbackground.png")}
      />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Image
          source={require("@/assets/images/whitedoyo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.checkmarkContainer}>
          <Image
            source={require("@/assets/images/checkmark.png")}
            style={styles.checkmark}
          />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.awesomeContainer}>
            <Text style={styles.awesomeText}>Awesome!</Text>
          </View>
          <Text style={styles.descriptionText}>
            Your Host Profile{"\n"}is successfully created!
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.viewProfileButton}
            onPress={() => router.push("/hostprofile")}
          >
            <Text style={styles.viewProfileText}>View your Host Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.homePageButton}
            onPress={() => router.push("/")}
          >
            <Text style={styles.homePageText}>Go to Homepage</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HostSuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundimage: {
    position: "absolute",
    top: 0,
    left: 0,
    borderRadius: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    marginTop: 15,
  },
  backButton: {
    padding: 5,
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 50,
  },
  logo: {
    width: 100,
    height: 40,
    marginLeft: 20,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: 20,
  },
  checkmarkContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  checkmark: {
    width: 200,
    height: 200,
    objectFit: "cover",
  },
  textContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  awesomeContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 4,
    marginBottom: 20,
    borderColor: "#000",
    borderWidth: 2,
    shadowColor: "#F96247",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  awesomeText: {
    color: "#000",
    fontSize: 18,
    fontFamily: "OtomanopeeOne",
  },
  descriptionText: {
    color: "#000",
    fontSize: 18,
    textAlign: "center",
    lineHeight: 25,
    marginTop: 20,
    fontFamily: "Nunito_600SemiBold",
  },
  buttonContainer: {
    marginTop: 68,
    width: "100%",
  },
  viewProfileButton: {
    backgroundColor: "#00D1C1",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  viewProfileText: {
    color: "#000",
    fontFamily: "Nunito_700Bold",
    fontSize: 18,
    fontWeight: "bold",
  },
  homePageButton: {
    borderColor: "#00D1C1",
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
  },
  homePageText: {
    color: "#00D1C1",
    fontSize: 18,
    fontWeight: "bold",
  },
});
