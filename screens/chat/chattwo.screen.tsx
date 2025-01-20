import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import io from "socket.io-client";
import { SERVER_URI } from "@/utils/uri";

type Message = {
  _id: string;
  sender: {
    _id: string;
    fullName: string;
    avatar?: {
      url: string;
    };
  };
  content: string;
  timestamp: string;
};

const ChatScreen: React.FC = () => {
  const { userId, selectedHost } = useLocalSearchParams<{
    userId: string;
    selectedHost: string;
  }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const socketRef = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);
  const intervalRef = useRef<any>(null); // Ref to hold the interval ID

  useEffect(() => {
    const setupChat = async () => {
      try {
        setLoading(true);
        const accessToken = await AsyncStorage.getItem("access_token");
        if (!accessToken) throw new Error("No access token found");

        // Create or get existing chat
        const chatResponse = await axios.post(
          `${SERVER_URI}/create`,
          { participantId: userId },
          { headers: { access_token: accessToken } }
        );
        const chatId = chatResponse.data._id;
        setChatId(chatId);

        // Fetch messages
        const messagesResponse = await axios.get(
          `${SERVER_URI}/${chatId}/messages`,
          {
            headers: { access_token: accessToken },
          }
        );
        setMessages(messagesResponse.data);

        // Setup Socket.IO
        socketRef.current = io(SERVER_URI, {
          query: { accessToken },
        });

        socketRef.current.emit("joinChat", chatId);

        socketRef.current.on("message", (newMessage: Message) => {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        // Set up message fetching every second
        intervalRef.current = setInterval(async () => {
          const messagesResponse = await axios.get(
            `${SERVER_URI}/${chatId}/messages`,
            {
              headers: { access_token: accessToken },
            }
          );
          setMessages(messagesResponse.data);
        }, 1000); // Fetch messages every second

        setLoading(false);
      } catch (err) {
        console.log("Error setting up chat:", err);
        setError("Failed to load chat. Please try again.");
        setLoading(false);
      }
    };

    setupChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leaveChat", chatId);
        socketRef.current.disconnect();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current); // Clear the interval when the component unmounts
      }
    };
  }, [userId, selectedHost]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) throw new Error("No access token found");

      await axios.post(
        `${SERVER_URI}/${chatId}/messages`,
        { content: newMessage },
        { headers: { access_token: accessToken } }
      );

      setNewMessage("");
    } catch (err) {
      console.log("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ea" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.sender._id === userId
                ? styles.receivedMessage
                : styles.sentMessage,
            ]}
          >
            <Image
              source={{
                uri:
                  item.sender.avatar?.url || "https://via.placeholder.com/40",
              }}
              style={styles.avatar}
            />
            <View style={styles.messageContent}>
              <Text style={styles.senderName}>{item.sender.fullName}</Text>
              <Text style={styles.messageText}>{item.content}</Text>
              <Text style={styles.timestamp}>
                {new Date(item.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
        )}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingBottom: 150,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
  messageBubble: {
    flexDirection: "row",
    marginVertical: 4,
    marginHorizontal: 8,
    padding: 8,
    borderRadius: 12,
    maxWidth: "80%",
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  messageContent: {
    flex: 1,
  },
  senderName: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#6200ea",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ChatScreen;
