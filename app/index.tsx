import useUser from "@/hooks/auth/useUser";
import { Redirect } from "expo-router";
import Loader from "@/components/loader/loader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import React from "react";

const TabsIndex = () => {
  const { loading, user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [loginUser, setLoginUser] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        // If user object is available, store it in AsyncStorage
        if (user?._id) {
          await AsyncStorage.setItem("user", user._id);
          setLoginUser(user._id);
        } else {
          // // If no user object, retrieve stored user ID from AsyncStorage
          // const storedUserId = await AsyncStorage.getItem("user");
          setLoginUser("");
        }
      } catch (error) {
        console.error(
          "Failed to store or retrieve user from AsyncStorage",
          error
        );
      } finally {
        // Set loading state to false once user data is processed
        setIsLoading(false);
      }
    };

    checkUser();
  }, [user]);

  if (loading || isLoading) {
    // Show loader while loading user data or processing AsyncStorage
    return <Loader />;
  }

  // Redirect based on the retrieved or existing user ID
  return <Redirect href={loginUser ? "/(tabs)" : "/(routes)/loader"} />;
};

export default TabsIndex;
