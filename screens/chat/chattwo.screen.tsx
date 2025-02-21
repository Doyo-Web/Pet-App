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
import { router, useLocalSearchParams } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import io from "socket.io-client";
import { SERVER_URI } from "@/utils/uri";
import { Toast } from "react-native-toast-notifications";
import useUser from "@/hooks/auth/useUser";
import { createSocketConnection } from "@/utils/socket";

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
  const { userId } = useLocalSearchParams<{
    userId: string;
  }>();
  const [messages, setMessages] = useState<
    { fullname: string; text: string }[]
  >([]);

  const [responsemessages, setResponseMessages] = useState<[]>([]);

  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const socketRef = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);
  const intervalRef = useRef<any>(null); // Ref to hold the interval ID
  const [enddate, setEndDate] = useState("");
  const { user } = useUser();
  const LoggedInuserId = user?._id;


  useEffect(() => {
    const getEndDate = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("access_token");
        if (!accessToken) throw new Error("No access token found");

        // Create or get existing chat
        const bookingResponse = await axios.post(
          `${SERVER_URI}/booking-enddate`,
          { participantId: userId },
          { headers: { access_token: accessToken } }
        );
        setEndDate(bookingResponse.data.booking[0].endDateTime);
      } catch (error: any) {
         if (error.response?.status === 400) {
           await AsyncStorage.removeItem("access_token");
           await AsyncStorage.removeItem("refresh_token"); // Clear token
           router.replace("/(routes)/login"); // Redirect to login page
         }
        setError("Booking Not Found");
        setLoading(false);
      }
    };

    getEndDate();
  }, []);

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
        const chat = await axios.get(`${SERVER_URI}/${chatId}/messages`, {
          headers: { access_token: accessToken },
        });

        const chatMessages = chat?.data?.map((msg: any) => {
          const { content } = msg;
          return {
            text: content,
            fullname: user?.fullname,
          };
        });
        setMessages(chatMessages);

        // // Set up message fetching every second
        // intervalRef.current = setInterval(async () => {
        //   const messagesResponse = await axios.get(
        //     `${SERVER_URI}/${chatId}/messages`,
        //     {
        //       headers: { access_token: accessToken },
        //     }
        //   );

        //   setMessages(messagesResponse.data);
        // }, 1000); // Fetch messages every second

        setLoading(false);
      } catch (err: any) {
         if (err.response?.status === 400) {
           await AsyncStorage.removeItem("access_token");
           await AsyncStorage.removeItem("refresh_token"); // Clear token
           router.replace("/(routes)/login"); // Redirect to login page
         }
        console.log("Error setting up chat:", err);
        setError("Failed to load chat. Please try again.");
        setLoading(false);
      }
    };

    setupChat();
  }, [userId]);

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    if (!LoggedInuserId) {
      return;
    }
    const socket = createSocketConnection();
    // As soon as the page loaded, the socket connection is made and joinChat event is emitted
    socket.emit("joinChat", {
      fullname: user.fullname,
      userId,
      LoggedInuserId,
    });

    socket.on("messageReceived", ({ fullname, text }) => {
      setMessages((messages) => [...messages, { fullname, text }]);
      scrollToBottom();
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, LoggedInuserId]);

  

  const sendMessage = async () => {
    const now = new Date();
    const bookingEndDate = new Date(enddate); // Convert endDate to Date object

    if (now >= bookingEndDate) {
      // Show toast message if booking is ended
      Toast.show("booking is ended you cannot chat now", { type: "info" });
      return;
    }

    if (!newMessage.trim() || !chatId) return;

     const socket = createSocketConnection();
     socket.emit("sendMessage", {
       fullname: user?.fullname,
       userId,
       LoggedInuserId,
       text: newMessage,
     });
     setNewMessage("");
     scrollToBottom();
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) throw new Error("No access token found");

      await axios.post(
        `${SERVER_URI}/${chatId}/messages`,
        { content: newMessage },
        { headers: { access_token: accessToken } }
      );

      setNewMessage("");
    } catch (err: any) {
       if (err.response?.status === 400) {
         await AsyncStorage.removeItem("access_token");
         await AsyncStorage.removeItem("refresh_token"); // Clear token
         router.replace("/(routes)/login"); // Redirect to login page
       }
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
        data={messages}
        ref={flatListRef}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          const isUserMessage = user?.fullname === item.fullname;

          return (
            <View
              style={[
                styles.chatContainer,
                isUserMessage ? styles.chatEnd : styles.chatStart,
              ]}
            >
              {/* Chat Header (Only for Other Users) */}
              {!isUserMessage && (
                <Text style={styles.chatHeader}>{item.fullname}</Text>
              )}

              {/* Chat Bubble */}
              <View
                style={[
                  styles.chatBubble,
                  isUserMessage
                    ? styles.chatBubbleUser
                    : styles.chatBubbleOther,
                ]}
              >
                <Text style={styles.chatText}>{item.text}</Text>
              </View>

              {/* Chat Footer (Only for User's Messages) */}
              {isUserMessage && <Text style={styles.chatFooter}>Seen</Text>}
            </View>
          );
        }}
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
    marginBottom: 150,
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

  chatContainer: {
    marginVertical: 8,
    paddingHorizontal: 10,
  },
  chatStart: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  chatEnd: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  chatHeader: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 2,
  },

  chatBubble: {
    padding: 10,
    borderRadius: 10,
    maxWidth: "75%",
  },
  chatBubbleUser: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end",
  },
  chatBubbleOther: {
    backgroundColor: "#6200ea",
    alignSelf: "flex-start",
  },
  chatText: {
    color: "#fff",
  },
  chatFooter: {
    fontSize: 10,
    color: "#aaa",
    marginTop: 2,
  },
});

export default ChatScreen;
