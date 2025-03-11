import React from "react";
import { TabBar } from "@/components/loader/TabBar";
import useUser from "@/hooks/auth/useUser";
import { Tabs, usePathname } from "expo-router";
import { Image } from "react-native";
import { RouteProp } from "@react-navigation/native";

export default function TabsLayout() {
  const pathname = usePathname();

  // Check if we're on the chat/chattwo screen
  const hideTabBar = pathname === "/chat/chattwo";

  return (
    <Tabs
      tabBar={(props: any) => (hideTabBar ? null : <TabBar {...props} />)}
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
            } else if (route.name === "profile/index") {
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
          // Hide the tab bar for specific screens
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
