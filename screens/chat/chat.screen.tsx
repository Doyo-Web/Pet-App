import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { SERVER_URI } from "@/utils/uri";

type Chat = {
  _id: string;
  participants: {
    _id: string;
    fullName: string;
    avatar: string;
  }[];
  lastMessage: {
    content: string;
    timestamp: string;
  };
};

const ChatListScreen: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("access_token");
        if (!accessToken) throw new Error("No access token found");

        const response = await axios.get(`${SERVER_URI}/list`, {
          headers: { access_token: accessToken },
        });
        setChats(response.data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, []);

 const navigateToChat = (chatId: string) => {
   router.push({
     pathname: "/chat/[id]", // Use '[id]' for the dynamic segment
     params: { id: chatId }, // Pass the 'id' parameter to the route
   });
 };

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => navigateToChat(item._id)}
          >
            <Text style={styles.chatName}>{item.participants[0].fullName}</Text>
            <Text style={styles.lastMessage}>{item.lastMessage?.content}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  chatItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  chatName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  lastMessage: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
});

export default ChatListScreen;
