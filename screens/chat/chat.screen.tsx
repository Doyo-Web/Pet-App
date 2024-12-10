import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URI } from "../../utils/uri";
import io from "socket.io-client";
import { router } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { useRouter, useLocalSearchParams } from "expo-router";

interface User {
  _id: string;
  fullname: string;
}

interface Message {
  _id: string;
  sender: User;
  content: string;
  timestamp: string;
}

interface Chat {
  _id: string;
  booking: string;
  isActive: boolean;
  messages: Message[];
  participants: User[];
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [chat, setChat] = useState<Chat | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // const { bookingId } = route.params as { bookingId: string };
  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<any>(null);
  const router = useRouter();
  const { bookingId } = useLocalSearchParams();

   if (!bookingId) {
     router.push("/(drawer)/(tabs)/booknow");
     return null;
   }

  useEffect(() => {
    if (!bookingId) {
      router.push("/(drawer)/(tabs)/booknow");
      return;
    }
    createOrFetchChat();
    setupSocket();
    getCurrentUser();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [bookingId, router]);

  const getCurrentUser = async () => {
    try {
      const userJson = await AsyncStorage.getItem("user");
      if (userJson) {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error("Error getting current user:", error);
    }
  };

  const setupSocket = async () => {
    const accessToken = await AsyncStorage.getItem("access_token");
    socketRef.current = io(SERVER_URI, {
      query: { token: accessToken },
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to socket server");
      socketRef.current.emit("joinRoom", bookingId);
    });

    socketRef.current.on("receiveMessage", (newMessage: Message) => {
      console.log("Received new message:", newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socketRef.current.on("chatClosed", () => {
      console.log("Chat closed");
      setIsActive(false);
    });

    socketRef.current.on("error", (error: any) => {
      console.error("Socket error:", error);
      Alert.alert("Error", error.message);
    });
  };

  const createOrFetchChat = async () => {
    setIsLoading(true);
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      const response = await axios.post(
        `${SERVER_URI}/chat`,
        { bookingId },
        { headers: { access_token: accessToken } }
      );
      console.log("Create or fetch chat response:", response.data);

      if (response.data.success && response.data.chat) {
        setChat(response.data.chat);
        setMessages(response.data.chat.messages || []);
        setIsActive(response.data.chat.isActive);

        // Set the other user
        const otherParticipant = response.data.chat.participants.find(
          (p: User) => p._id !== currentUser?._id
        );
        setOtherUser(otherParticipant);
      } else {
        throw new Error("Failed to create or fetch chat");
      }
    } catch (error) {
      console.error("Error creating or fetching chat:", error);
      Alert.alert("Error", "Failed to initialize chat. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!chat?._id) {
      console.error("Chat ID is not set, cannot fetch messages");
      return;
    }
    setIsLoading(true);
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      const response = await axios.get(`${SERVER_URI}/chat/${chat._id}`, {
        headers: { access_token: accessToken },
      });
      console.log("Fetch messages response:", response.data);
      setMessages(response.data.messages);
      setIsActive(response.data.isActive);
    } catch (error) {
      console.error("Error fetching messages:", error);
      Alert.alert("Error", "Failed to fetch messages. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (inputMessage.trim() === "") return;

    if (!chat?._id) {
      console.error("Chat ID is not set, cannot send message");
      Alert.alert("Error", "Chat not initialized. Please try again.");
      return;
    }

    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      console.log(
        "Sending message. Chat ID:",
        chat._id,
        "Content:",
        inputMessage
      );
      const response = await axios.post(
        `${SERVER_URI}/chat/message`,
        { chatId: chat._id, content: inputMessage.trim() },
        { headers: { access_token: accessToken } }
      );

      console.log("Send message response:", response.data);

      if (response.data.success && response.data.message) {
        setMessages((prevMessages) => [...prevMessages, response.data.message]);
        setInputMessage("");
      } else {
        throw new Error(response.data.message || "Failed to send message");
      }
    } catch (error: any) {
      console.error(
        "Error sending message:",
        error.response?.data || error.message
      );
      if (error.response?.data?.message === "Chat not found") {
        Alert.alert("Error", "Chat not found. Refreshing chat data...", [
          {
            text: "OK",
            onPress: () => createOrFetchChat(),
          },
        ]);
      } else {
        Alert.alert(
          "Error",
          error.response?.data?.message ||
            "Failed to send message. Please try again."
        );
      }
    }
  };

  const closeChat = async () => {
    if (!chat?._id) {
      console.error("Chat ID is not set, cannot close chat");
      return;
    }
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      const response = await axios.post(
        `${SERVER_URI}/chat/close`,
        { chatId: chat._id },
        { headers: { access_token: accessToken } }
      );
      if (response.data.success) {
        setIsActive(false);
        socketRef.current.emit("closeChat", chat._id);
      } else {
        throw new Error(response.data.message || "Failed to close chat");
      }
    } catch (error) {
      console.error("Error closing chat:", error);
      Alert.alert("Error", "Failed to close chat. Please try again.");
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.sender._id === currentUser?._id;
    const senderName = isCurrentUser ? "You" : item.sender.fullname;
    const receiverName = isCurrentUser ? otherUser?.fullname : "You";

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        ]}
      >
        <Text style={styles.messageHeader}>
          {senderName} to {receiverName}
        </Text>
        <Text style={styles.messageContent}>{item.content}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B4A" />
        <Text>Loading chat...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.chatHeader}>
        <Text style={styles.chatHeaderText}>
          Chat between {currentUser?.fullname} and {otherUser?.fullname}
        </Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />
      {isActive ? (
        <>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputMessage}
              onChangeText={setInputMessage}
              placeholder="Type a message..."
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={closeChat}>
            <Text style={styles.closeButtonText}>Close Chat</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.chatClosedText}>This chat has been closed.</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  chatHeader: {
    padding: 15,
    backgroundColor: "#FF6B4A",
    alignItems: "center",
  },
  chatHeaderText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  messageContainer: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    maxWidth: "80%",
  },
  currentUserMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  otherUserMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E8E8E8",
  },
  messageHeader: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "black",
  },
  messageContent: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#FF6B4A",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  chatClosedText: {
    textAlign: "center",
    padding: 20,
    color: "#888",
  },
  closeButton: {
    backgroundColor: "#FF6B4A",
    padding: 15,
    margin: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
