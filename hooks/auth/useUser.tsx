import React, { useEffect, useState } from "react";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function useUser() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [refetch, setRefetch] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("access_token");

        if (!accessToken) {
          setLoading(false);
          return;
        }

        // Check if we already have a cached user
        const cachedUser = await AsyncStorage.getItem("user");
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
          setLoading(false);
        }

        // Fetch the latest user data from the server
        const { data } = await axios.get(`${SERVER_URI}/me`, {
          headers: {
            access_token: accessToken,
          },
        });

        setUser(data.user);
        await AsyncStorage.setItem("user", JSON.stringify(data.user)); // Cache user
      } catch (error: any) {
        setError(error?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [refetch]);

  return { loading, user, error, setRefetch, refetch };
}
