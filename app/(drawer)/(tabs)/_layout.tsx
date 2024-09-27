import { TabBar } from "@/components/loader/TabBar";
import useUser from "@/hooks/auth/useUser";
import { Tabs } from "expo-router";
import React from "react";
import { Image } from "react-native";

export default function TabsLayout() {

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={({ route }) => {
        return {
          tabBarIcon: ({ color }) => {
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
                style={{ width: 5, height: 5, tintColor: color }}
                source={iconName}
              />
            );
          },
          headerShown: false,
          tabBarShowLabel: false,
        };
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="host/index" options={{ title: "Host" }} />
      <Tabs.Screen name="booknow/index" options={{ title: "BookNow" }} />
      <Tabs.Screen name="chat/index" options={{ title: "Chat" }} />
      <Tabs.Screen name="profile/index" options={{ title: "Profile" }} />
    </Tabs>
  );
}
