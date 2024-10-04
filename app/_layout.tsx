import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import "react-native-reanimated";
import { Stack } from "expo-router";
import SignUp from "./(routes)/signup";
import Welcome from "./(routes)/welcome";
import { ToastProvider } from "react-native-toast-notifications";
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_700Bold,
  Nunito_600SemiBold,
} from "@expo-google-fonts/nunito";
import TabsLayout from "./(drawer)/(tabs)/_layout";
import React from "react";
import { Provider } from "react-redux";
import store from "../store/store";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_700Bold,
    Nunito_600SemiBold,
    OtomanopeeOne: require("../assets/fonts/OtomanopeeOne-Regular.ttf"),
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {

  return (
    <Provider store={store}>
      <ToastProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(routes)/loader/index" />
          <Stack.Screen name="(routes)/welcome/index" />
          <Stack.Screen name="(routes)/signup/index" />
          <Stack.Screen name="(routes)/verify/index" />
          <Stack.Screen name="(routes)/login/index" />
          <Stack.Screen name="(routes)/forgotpassword/index" />
        </Stack>
      </ToastProvider>
    </Provider>
  );
}
