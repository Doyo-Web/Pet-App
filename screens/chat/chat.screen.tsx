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
import { RectButton } from "react-native-gesture-handler";

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
  chatStatus: "active" | "expired";
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

type BookingResponse = {
  booking?: {
    endDateTime: string;
    paymentStatus: string;
  }[];
};

const ChatListScreen: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Participant | null>(null);
  const [relatedUsers, setRelatedUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userType, setUserType] = useState<"host" | "petParent" | null>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const router = useRouter();

  const checkBookingStatus = async (userId: string): Promise<boolean> => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) throw new Error("No access token found");

      const bookingResponse = await axios.post<BookingResponse>(
        `${SERVER_URI}/booking-enddate`,
        { participantId: userId },
        { headers: { access_token: accessToken } }
      );

      console.log(`Booking status for ${userId}:`, bookingResponse.data); // Debug log

      const endDateTime = bookingResponse.data.booking?.[0]?.endDateTime;
      if (endDateTime) {
        // Check if the booking has ended (current time is past the end date)
        return new Date() >= new Date(endDateTime);
      }

      // If no endDateTime is found, default to not expired
      return false;
    } catch (error) {
      console.error(`Error checking booking status for user ${userId}:`, error);
      // Default to not expired in case of error
      return false;
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) throw new Error("No access token found");

      const response = await axios.get(`${SERVER_URI}/user/${userId}`, {
        headers: { access_token: accessToken },
      });

      console.log(`User Details for ${userId}:`, response.data); // Debug log
      return response.data.user; // Assuming the user data is under 'user' key
    } catch (error) {
      console.error(`Error fetching details for user ${userId}:`, error);
      return null;
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = await AsyncStorage.getItem("access_token");

      if (!accessToken) throw new Error("No access token found");

      const response = await axios.get(`${SERVER_URI}/user-related-bookings`, {
        headers: { access_token: accessToken },
      });

      console.log("API Response from /user-related-bookings:", response.data); // Debug log

      const isHost = !!response.data.petParents;
      const isPetParent = !!response.data.hosts;

      setUserType(isHost ? "host" : isPetParent ? "petParent" : null);

      setCurrentUser({
        ...response.data.loggedInUser,
        userType: isHost ? "host" : "petParent",
      });

      const usersList = response.data.hosts || response.data.petParents || [];
      console.log("Users List:", usersList); // Debug log

      const formattedUsers = await Promise.all(
        usersList.map(async (user: User) => {
          const userDetails = await fetchUserDetails(user.userId);
          const currentDate = new Date();
          const chatDate = new Date(user.lastMessageTime || currentDate);

          // Check booking status from API instead of time-based calculation
          const isExpired = await checkBookingStatus(user.userId);

          let formattedTime: string;
          const timeDiff =
            (currentDate.getTime() - chatDate.getTime()) /
            (1000 * 60 * 60 * 24);

          if (timeDiff < 1) {
            formattedTime = chatDate
              .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              .replace(/:\d{2}\s/, " ")
              .toUpperCase();
          } else if (timeDiff < 7) {
            formattedTime = chatDate.toLocaleDateString("en-US", {
              weekday: "long",
            });
          } else {
            formattedTime = chatDate.toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "2-digit",
            });
          }

          return {
            ...user,
            ...(userDetails || {}), // Merge user details if available
            lastMessageTime: formattedTime,
            petName: isHost
              ? `${user.petName || userDetails?.petName || "Pet"}'s Pet Parent`
              : `Pet ${isPetParent ? "Boarding" : "DayCare"}`,
            chatStatus: isExpired ? "expired" : "active",
          };
        })
      );

      console.log("Formatted Users:", formattedUsers); // Debug log
      setRelatedUsers(formattedUsers);
      setFilteredUsers(formattedUsers);
    } catch (error: any) {
      if (error.response?.status === 413) {
        await AsyncStorage.removeItem("access_token");
        await AsyncStorage.removeItem("refresh_token");
        router.replace("/(routes)/login");
      }
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

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

    setSelectedChat(relatedUserId);
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
          <RectButton
            onPress={handleGoBack}
            style={[
              styles.backButton,
              {
                backgroundColor: "#F96247",
              },
            ]}
          >
            <Feather name="arrow-left" size={24} color="white" />
          </RectButton>
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
                  item.chatStatus === "active" && selectedChat === item.userId
                    ? styles.activeSelectedChat
                    : item.chatStatus === "active"
                    ? styles.activeChat
                    : styles.expiredChat,
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
                      {item.fullname || item.email.split("@")[0]}
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
  activeSelectedChat: {
    backgroundColor: "#FEE1E1",
  },
  activeChat: {
    backgroundColor: "#FFFFFF",
  },
  expiredChat: {
    backgroundColor: "#F5F5F5",
    opacity: 0.7,
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
