import React, { useEffect } from "react";
import LoaderScreen from "@/screens/loader/loader.screen";
import LoginScreen from "@/screens/auth/login/login.screen";
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

  if (!user) {
    
    return <LoginScreen />;
  }

  return null;
}
