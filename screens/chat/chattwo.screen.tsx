import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRoute, RouteProp } from "@react-navigation/native";
import { SERVER_URI } from "@/utils/uri";

type ChatScreenRouteParams = {
  params: {
    chatId: string;
    userId: string;
  };
};

type Message = {
  _id: string;
  sender: {
    _id: string;
  };
  content: string;
  timestamp: string;
};

const ChatScreen: React.FC = () => {
  const route = useRoute<RouteProp<ChatScreenRouteParams, "params">>();
  const { chatId, userId } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchMessages = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) {
        throw new Error("No access token found");
      }
      const response = await axios.get(`${SERVER_URI}/chat/${chatId}`, {
        headers: { access_token: accessToken },
      });

      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
       const accessToken = await AsyncStorage.getItem("access_token");
       if (!accessToken) {
         throw new Error("No access token found");
       }
      const response = await axios.post(
        `${SERVER_URI}/chat/message`,
        { chatId, content: newMessage },
        {
          headers: { access_token: accessToken },
        }
      );

      setMessages((prevMessages) => [...prevMessages, response.data]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [chatId]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender._id === userId
          ? styles.messageBubbleRight
          : styles.messageBubbleLeft,
      ]}
    >
      <Text style={styles.messageText}>{item.content}</Text>
      <Text style={styles.messageTimestamp}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.messageList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
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
  messageList: {
    padding: 10,
  },
  messageBubble: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: "75%",
  },
  messageBubbleLeft: {
    backgroundColor: "#e1ffc7",
    alignSelf: "flex-start",
  },
  messageBubbleRight: {
    backgroundColor: "#d1e7ff",
    alignSelf: "flex-end",
  },
  messageText: {
    fontSize: 16,
  },
  messageTimestamp: {
    fontSize: 10,
    color: "gray",
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  sendButton: {
    marginLeft: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#007bff",
    borderRadius: 20,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ChatScreen;
