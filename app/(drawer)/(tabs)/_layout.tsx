import React from "react";
import { TabBar } from "@/components/loader/TabBar";
import { router, Tabs, usePathname } from "expo-router";
import { Image } from "react-native";
import { RouteProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";

export default function TabsLayout() {
  const pathname = usePathname();
  const hideTabBar = pathname === "/chat/chattwo";

  const checkHostStatus = async () => {
    const accessToken = await AsyncStorage.getItem("access_token");

    try {
      const response = await axios.get(`${SERVER_URI}/host`, {
        headers: {
          "Content-Type": "application/json",
          access_token: accessToken,
        },
      });

      return response.data.host;
    } catch (error: any) {
      if (error.response?.status === 413) {
        await AsyncStorage.removeItem("access_token");
        await AsyncStorage.removeItem("refresh_token");
        router.replace("/(routes)/login");
      }
      console.log("Error checking host profile:", error);
      return false;
    }
  };

  return (
    <Tabs
      tabBar={(props: any) =>
        hideTabBar ? null : (
          <TabBar {...props} checkHostStatus={checkHostStatus} />
        )
      }
      screenOptions={({ route }: { route: RouteProp<any> }) => {
        return {
          tabBarIcon: ({ color }: { color: string }) => {
            let iconName;
            if (route.name === "index") {
              iconName = require("@/assets/icons/homeicon.png");
            } else if (route.name === "host/index") {
              iconName = require("@/assets/icons/hosticon.png");
            } else if (route.name === "booknow/index") {
              iconName = require("@/assets/icons/booknowicon.png");
            } else if (route.name === "chat/index") {
              iconName = require("@/assets/icons/chaticon.png");
            } else if (route.name === "petparents/index") {
              iconName = require("@/assets/icons/profileicon.png");
            }
            return (
              <Image
                style={{ width: 24, height: 24, tintColor: color }}
                source={iconName}
              />
            );
          },
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: hideTabBar ? { display: "none" } : undefined,
        };
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="host/index" options={{ title: "Host" }} />
      <Tabs.Screen name="booknow/index" options={{ title: "BookNow" }} />
      <Tabs.Screen name="chat/index" options={{ title: "Chat" }} />
      <Tabs.Screen name="petparents/index" options={{ title: "Pet Profile" }} />
    </Tabs>
  );
}
