import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { SERVER_URI } from "@/utils/uri";

type User = {
  _id: string;
  email: string;
  avatar?: {
    url: string;
  };
};

type Participant = {
  _id: string;
  fullname: string;
  email: string;
  avatar?: {
    url: string;
  };
};

const ChatListScreen: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Participant | null>(null); // Current logged-in user
  const [relatedUsers, setRelatedUsers] = useState<User[]>([]); // Related users list (hosts or pet parents)
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const accessToken = await AsyncStorage.getItem("access_token");
        if (!accessToken) throw new Error("No access token found");

        const response = await axios.get(
          `${SERVER_URI}/user-related-bookings`,
          {
            headers: { access_token: accessToken },
          }
        );

        console.log("API response:", response.data);

        // Set current user and related users based on response
        setCurrentUser(response.data.loggedInUser || null);
        setRelatedUsers(response.data.hosts || response.data.petParents || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openChat = (relatedUserId: string) => {
    if (!currentUser) return;

    router.push({
      pathname: "/chat/chattwo", // Dynamic route
      params: {
        userId: relatedUserId,
        selectedHost: currentUser._id, // Sending the logged-in user's ID
      },
    });
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#6200ea" />
      ) : relatedUsers.length > 0 && currentUser ? (
        <>
          <View style={styles.userInfo}>
            <Image
              source={{
                uri:
                  currentUser.avatar?.url || "https://via.placeholder.com/50",
              }}
              style={styles.avatar}
            />
            <Text style={styles.userText}>
              Logged in as: {currentUser.fullname} ({currentUser.email})
            </Text>
          </View>
          <FlatList
            data={relatedUsers}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.userItem}
                onPress={() => openChat(item._id)}
              >
                <Image
                  source={{
                    uri: item.avatar?.url || "https://via.placeholder.com/50",
                  }}
                  style={styles.avatar}
                />
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{item.email}</Text>
                  <Text style={styles.userId}>ID: {item._id}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </>
      ) : (
        <Text style={styles.noUsersText}>No related users found</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  userInfo: {
    padding: 16,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  userText: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  userId: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  noUsersText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
});

export default ChatListScreen;
