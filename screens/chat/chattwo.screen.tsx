import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import io, { Socket } from "socket.io-client";
import { SERVER_URI } from "@/utils/uri";

type Message = {
  _id: string;
  sender: {
    _id: string;
    fullName: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
};

const ChatScreen: React.FC = () => {
  const { id: chatId } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const setupChat = async () => {
      const accessToken = await AsyncStorage.getItem("access_token");
      const userIdFromStorage = await AsyncStorage.getItem("user_id");
      if (!accessToken || !userIdFromStorage) {
        // Handle authentication error
        return;
      }
      setUserId(userIdFromStorage);

      try {
        const response = await axios.get(
          `${SERVER_URI}/${chatId}/messages`,
          {
            headers: { access_token: accessToken },
          }
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }

      socketRef.current = io(SERVER_URI, {
        query: { chatId, accessToken },
      });

      socketRef.current.on("message", (newMessage: Message) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });
    };

    setupChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [chatId]);

  const sendMessage = async () => {
    if (inputMessage.trim() === "") return;

    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) throw new Error("No access token found");

      const response = await axios.post(
        `${SERVER_URI}/${chatId}/messages`,
        { content: inputMessage },
        {
          headers: { access_token: accessToken },
        }
      );

      const newMessage: Message = response.data;
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputMessage("");

      if (socketRef.current) {
        socketRef.current.emit("sendMessage", newMessage);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
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
                ? styles.sentMessage
                : styles.receivedMessage,
            ]}
          >
            <Text style={styles.messageText}>{item.content}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
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
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Type a message..."
          multiline
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
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 20,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007bff",
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e5e5ea",
  },
  messageText: {
    color: "#000",
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    alignSelf: "flex-end",
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#007bff",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ChatScreen;
