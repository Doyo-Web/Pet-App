"use client";

import React from "react";
import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  TextInput,
  SafeAreaView,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { SERVER_URI } from "@/utils/uri";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

type User = {
  userId: string;
  _id: string;
  email: string;
  fullname?: string;
  petName?: string;
  avatar?: {
    url: string;
  };
  lastMessage?: string;
  lastMessageTime?: string;
};

type Participant = {
  userId: string | number | (string | number)[] | null | undefined;
  _id: string;
  fullname: string;
  email: string;
  userType?: "host" | "petParent";
  avatar?: {
    url: string;
  };
};

const ChatListScreen: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Participant | null>(null);
  const [relatedUsers, setRelatedUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userType, setUserType] = useState<"host" | "petParent" | null>(null);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = await AsyncStorage.getItem("access_token");

      if (!accessToken) throw new Error("No access token found");

      const response = await axios.get(`${SERVER_URI}/user-related-bookings`, {
        headers: { access_token: accessToken },
      });

      // Determine if user is host or pet parent based on response
      const isHost = !!response.data.petParents;
      const isPetParent = !!response.data.hosts;

      setUserType(isHost ? "host" : isPetParent ? "petParent" : null);

      // Set current user
      setCurrentUser({
        ...response.data.loggedInUser,
        userType: isHost ? "host" : "petParent",
      });

      // Format the related users with mock data for UI display
      const mockTimeData = ["11:27 Am", "9:02 Am", "Sunday", "12/01/25"];
      const mockPetNames = ["Jack's", "Toddy's", "Bruno's", "Chokie's"];

      const formattedUsers = (
        response.data.hosts ||
        response.data.petParents ||
        []
      ).map((user: User, index: number) => ({
        ...user,
        lastMessageTime: mockTimeData[index % mockTimeData.length],
        petName: isHost
          ? `${mockPetNames[index % mockPetNames.length]} Pet Parent`
          : `Pet ${isPetParent ? "Boarding" : "DayCare"}`,
      }));

      setRelatedUsers(formattedUsers);
      setFilteredUsers(formattedUsers);
    } catch (error: any) {
      if (error.response?.status === 400) {
        await AsyncStorage.removeItem("access_token");
        await AsyncStorage.removeItem("refresh_token");
        router.replace("/(routes)/login");
      }
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [router]); // Added router to dependencies

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(relatedUsers);
    } else {
      const filtered = relatedUsers.filter(
        (user) =>
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.fullname &&
            user.fullname.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, relatedUsers]);

  const openChat = (relatedUserId: string) => {
    if (!currentUser) return;

    router.push({
      pathname: "/chat/chattwo",
      params: {
        userId: relatedUserId,
      },
    });
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={[
              styles.backButton,
              {
                backgroundColor:
                  userType === "petParent" ? "#F96247" : "#00D0C3",
              },
            ]}
          >
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat Box</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for the chat"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Feather
            name="search"
            size={20}
            color="#000"
            style={styles.searchIcon}
          />
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#6200ea"
            style={styles.loader}
          />
        ) : filteredUsers.length > 0 ? (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.userId}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.chatItem,
                  {
                    backgroundColor:
                      userType === "petParent" ? "#FEE1E1" : "#E1F5F5",
                  },
                ]}
                onPress={() => openChat(item.userId)}
              >
                <Image
                  source={{
                    uri: item.avatar?.url || "https://via.placeholder.com/50",
                  }}
                  style={styles.avatar}
                />
                <View style={styles.chatDetails}>
                  <View style={styles.chatHeader}>
                    <Text style={styles.userName}>
                      {item.email.split("@")[0]}
                    </Text>
                    <Text style={styles.timeStamp}>{item.lastMessageTime}</Text>
                  </View>
                  <Text style={styles.petInfo}>{item.petName}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No chats found</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 45,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  searchIcon: {
    marginLeft: 10,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  chatDetails: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  timeStamp: {
    fontSize: 12,
    color: "#666",
  },
  petInfo: {
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});

export default ChatListScreen;
