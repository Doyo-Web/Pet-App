import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import io from "socket.io-client";
import { SERVER_URI } from "../../utils/uri"; // your server URI

const socket = io(SERVER_URI);

interface Message {
  roomId: string;
  content: string;
  sender: string;
  timestamp: number;
}

const ChatScreen = ({
  route,
}: {
  route: { params: { roomId: string; userId: string } };
}) => {
  const { roomId, userId } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    socket.emit("joinRoom", roomId);

    socket.on("receiveMessage", (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const sendMessage = () => {
    if (message.trim() === "") return;

    const newMessage: Message = {
      roomId,
      content: message,
      sender: userId,
      timestamp: Date.now(),
    };
    socket.emit("sendMessage", newMessage);
    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.sender === userId;
    return (
      <View
        style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        {!isOwnMessage && (
          <Image
            source={{ uri: "https://via.placeholder.com/40" }}
            style={styles.avatar}
          />
        )}
        <View style={styles.messageContent}>
          <Text
            style={[styles.messageText, isOwnMessage && styles.ownMessageText]}
          >
            {item.content}
          </Text>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 90}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chat Room</Text>
        </View>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.timestamp.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />
        <View style={styles.inputContainer}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            style={styles.input}
            placeholder="Type a message"
            placeholderTextColor="#999"
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingBottom: 35,
  },
  header: {
    backgroundColor: "#4a90e2",
    padding: 15,
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  messageList: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  messageBubble: {
    flexDirection: "row",
    marginVertical: 5,
    maxWidth: "80%",
  },
  ownMessage: {
    alignSelf: "flex-end",
  },
  otherMessage: {
    alignSelf: "flex-start",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  messageContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    color: "#000",
  },
  ownMessageText: {
    color: "#000",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    alignSelf: "flex-end",
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: "#e1e1e1",
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#4a90e2",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatScreen;
