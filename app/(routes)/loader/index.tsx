import { StyleSheet, Text, View } from "react-native";
import LoaderScreen from "@/screens/loader/loader.screen";
import React, { useEffect } from "react";
import useUser from "@/hooks/auth/useUser";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";

export default function Loader() {
  const { loading, user, setRefetch } = useUser();
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      setRefetch((prev) => !prev);
    }, [])
  );

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/(tabs)");
      }
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <LoaderScreen />;
  }

  return null;
}
