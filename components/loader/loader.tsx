import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "react-native";

export default function Loader() {
  return (
    <LinearGradient
      colors={["#E5ECF9", "#F6F7F9"]}
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Text>Loading</Text>
    </LinearGradient>
  );
}
