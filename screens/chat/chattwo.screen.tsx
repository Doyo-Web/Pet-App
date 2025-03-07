"use client";

import React from "react";
import { useEffect, useState, useRef, useCallback } from "react";
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
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast } from "react-native-toast-notifications";
import useUser from "@/hooks/auth/useUser";
import { createSocketConnection } from "@/utils/socket";
import { SERVER_URI } from "@/utils/uri";
import {
  Feather,
  Ionicons,
  AntDesign,
  MaterialIcons,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { Audio } from "expo-av";
// Replacing react-native-vision-camera with expo-image-manipulator for image processing
import * as ImageManipulator from "expo-image-manipulator";

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
  contentType: "text" | "image" | "video" | "audio";
  mediaUrl?: string;
  timestamp: string;
  fullname?: string;
  text?: string;
};

type User = {
  _id: string;
  fullName: string;
  fullname?: string;
  avatar?: {
    url: string;
  };
  lastMessageTime?: string;
  petName?: string;
};

const { width, height } = Dimensions.get("window");

const ChatScreen: React.FC = () => {
  const { userId } = useLocalSearchParams<{
    userId: string;
  }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [enddate, setEndDate] = useState("");
  const [userType, setUserType] = useState<"host" | "petParent" | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isBookingExpired, setIsBookingExpired] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(
    null
  );
  const [microphonePermission, setMicrophonePermission] = useState<
    boolean | null
  >(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState(ImagePicker.CameraType.back);

  const socketRef = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);
  const mediaOptionsAnim = useRef(new Animated.Value(0)).current;
  const { user } = useUser();
  const LoggedInuserId = user?._id;

  // Request permissions
  useEffect(() => {
    (async () => {
      const cameraPermissionResult =
        await ImagePicker.requestCameraPermissionsAsync();
      setCameraPermission(cameraPermissionResult.status === "granted");

      const microphoneStatus = await Audio.requestPermissionsAsync();
      setMicrophonePermission(microphoneStatus.status === "granted");

      await MediaLibrary.requestPermissionsAsync();
    })();
  }, []);

  // Fetch user type (host or pet parent)
  const fetchUserType = useCallback(async () => {
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
    } catch (error: any) {
      if (error.response?.status === 400) {
        await AsyncStorage.removeItem("access_token");
        await AsyncStorage.removeItem("refresh_token");
        router.replace("/(routes)/login");
      }
      console.error("Error fetching user type:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if booking is expired
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

        const endDateTime = bookingResponse.data.booking[0].endDateTime;
        setEndDate(endDateTime);

        // Check if booking is expired
        const now = new Date();
        const bookingEndDate = new Date(endDateTime);
        setIsBookingExpired(now >= bookingEndDate);
      } catch (error: any) {
        if (error.response?.status === 400) {
          await AsyncStorage.removeItem("access_token");
          await AsyncStorage.removeItem("refresh_token");
          router.replace("/(routes)/login");
        }
        setError("Booking Not Found");
        setLoading(false);
      }
    };

    getEndDate();
  }, [userId]);

  // Setup chat and fetch messages
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

        // Format messages for display
        const formattedMessages =
          chat?.data?.map((msg: any) => {
            const { content, contentType = "text", mediaUrl } = msg;
            return {
              _id: msg._id || Math.random().toString(),
              text: content,
              fullname: user?.fullname || "User",
              contentType,
              mediaUrl,
              content,
              sender: {
                _id: user?._id || "",
                fullName: user?.fullname || "User",
              },
              timestamp: new Date().toISOString(),
            };
          }) || [];

        setMessages(formattedMessages);
        setLoading(false);
      } catch (err: any) {
        if (err.response?.status === 400) {
          await AsyncStorage.removeItem("access_token");
          await AsyncStorage.removeItem("refresh_token");
          router.replace("/(routes)/login");
        }
        console.log("Error setting up chat:", err);
        setError("Failed to load chat. Please try again.");
        setLoading(false);
      }
    };

    setupChat();
    fetchUserType();
  }, [userId, fetchUserType, user?.fullname, user?._id]);

  // Socket connection for real-time messaging
  useEffect(() => {
    if (!LoggedInuserId || !user?.fullname) {
      return;
    }

    const socket = createSocketConnection();
    // As soon as the page loaded, the socket connection is made and joinChat event is emitted
    socket.emit("joinChat", {
      fullname: user.fullname,
      userId,
      LoggedInuserId,
    });

    socket.on("messageReceived", (message: any) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          _id: message._id || Math.random().toString(),
          text: message.text,
          fullname: message.fullname,
          contentType: message.contentType || "text",
          mediaUrl: message.mediaUrl,
          content: message.text,
          sender: {
            _id: message.userId || "",
            fullName: message.fullname || "User",
          },
          timestamp: new Date().toISOString(),
        },
      ]);
      scrollToBottom();
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, LoggedInuserId, user?.fullname]);

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const toggleMediaOptions = () => {
    setShowMediaOptions(!showMediaOptions);
    Animated.timing(mediaOptionsAnim, {
      toValue: showMediaOptions ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Send text message
  const sendTextMessage = async () => {
    if (isBookingExpired) {
      Toast.show("Booking has ended. You cannot chat now", { type: "info" });
      return;
    }

    if (!newMessage.trim() || !chatId || !user?.fullname) return;

    const socket = createSocketConnection();
    socket.emit("sendMessage", {
      fullname: user.fullname,
      userId,
      LoggedInuserId,
      text: newMessage,
      contentType: "text",
    });

    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) throw new Error("No access token found");

      await axios.post(
        `${SERVER_URI}/${chatId}/messages`,
        {
          content: newMessage,
          contentType: "text",
        },
        { headers: { access_token: accessToken } }
      );

      const newMsg: Message = {
        _id: Math.random().toString(),
        text: newMessage,
        fullname: user.fullname,
        contentType: "text",
        content: newMessage,
        sender: {
          _id: user._id || "",
          fullName: user.fullname,
        },
        timestamp: new Date().toISOString(),
      };

      setMessages([...messages, newMsg]);
      setNewMessage("");
      scrollToBottom();
    } catch (err: any) {
      if (err.response?.status === 400) {
        await AsyncStorage.removeItem("access_token");
        await AsyncStorage.removeItem("refresh_token");
        router.replace("/(routes)/login");
      }
      console.log("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    if (isBookingExpired) {
      Toast.show("Booking has ended. You cannot chat now", { type: "info" });
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        await sendMediaMessage(imageUri, "image");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Toast.show("Failed to pick image", { type: "error" });
    }

    setShowMediaOptions(false);
  };

  // Pick video from gallery
  const pickVideo = async () => {
    if (isBookingExpired) {
      Toast.show("Booking has ended. You cannot chat now", { type: "info" });
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const videoUri = result.assets[0].uri;
        await sendMediaMessage(videoUri, "video");
      }
    } catch (error) {
      console.error("Error picking video:", error);
      Toast.show("Failed to pick video", { type: "error" });
    }

    setShowMediaOptions(false);
  };

  // Start recording audio
  const startRecording = async () => {
    if (isBookingExpired) {
      Toast.show("Booking has ended. You cannot chat now", { type: "info" });
      return;
    }

    if (!microphonePermission) {
      Toast.show("Microphone permission is required", { type: "error" });
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      Toast.show("Recording started...", { type: "info" });
    } catch (error) {
      console.error("Error starting recording:", error);
      Toast.show("Failed to start recording", { type: "error" });
    }
  };

  // Stop recording audio and send
  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        await sendMediaMessage(uri, "audio");
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
      Toast.show("Failed to stop recording", { type: "error" });
    }
  };

  // Open camera using ImagePicker instead of react-native-vision-camera
  const openCamera = async () => {
    if (isBookingExpired) {
      Toast.show("Booking has ended. You cannot chat now", { type: "info" });
      return;
    }

    if (!cameraPermission) {
      Toast.show("Camera permission is required", { type: "error" });
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        cameraType: cameraType,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;

        // Use ImageManipulator to process the image if needed
        const manipResult = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ resize: { width: 1000 } }], // Resize to reasonable dimensions
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        await sendMediaMessage(manipResult.uri, "image");
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      Toast.show("Failed to take picture", { type: "error" });
    }

    setShowMediaOptions(false);
  };

  // Toggle camera type (front/back)
  const toggleCameraType = () => {
    setCameraType(
      cameraType === ImagePicker.CameraType.back
        ? ImagePicker.CameraType.front
        : ImagePicker.CameraType.back
    );
  };

  // Send media message (image, video, audio)
  const sendMediaMessage = async (
    uri: string,
    contentType: "image" | "video" | "audio"
  ) => {
    if (!chatId || !user?.fullname) return;

    try {
      // In a real app, you would upload the file to a server and get a URL
      // For this example, we'll just use the local URI
      const mediaUrl = uri;
      const messageText = `Sent a ${contentType}`;

      const socket = createSocketConnection();
      socket.emit("sendMessage", {
        fullname: user.fullname,
        userId,
        LoggedInuserId,
        text: messageText,
        contentType,
        mediaUrl,
      });

      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) throw new Error("No access token found");

      await axios.post(
        `${SERVER_URI}/${chatId}/messages`,
        {
          content: messageText,
          contentType,
          mediaUrl,
        },
        { headers: { access_token: accessToken } }
      );

      const newMsg: Message = {
        _id: Math.random().toString(),
        text: messageText,
        fullname: user.fullname,
        contentType,
        mediaUrl,
        content: messageText,
        sender: {
          _id: user._id || "",
          fullName: user.fullname,
        },
        timestamp: new Date().toISOString(),
      };

      setMessages([...messages, newMsg]);
      scrollToBottom();
      Toast.show(`${contentType} sent successfully`, { type: "success" });
    } catch (error) {
      console.error(`Error sending ${contentType}:`, error);
      Toast.show(`Failed to send ${contentType}`, { type: "error" });
    }
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

  // Render different chat UI based on user type and booking status
  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        userType === "petParent"
          ? styles.petParentContainer
          : userType === "host"
          ? styles.hostContainer
          : {},
      ]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <FlatList
        data={messages}
        ref={flatListRef}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
        keyExtractor={(item) => item._id}
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
                    ? userType === "petParent"
                      ? styles.chatBubblePetParent
                      : styles.chatBubbleHost
                    : styles.chatBubbleOther,
                ]}
              >
                {item.contentType === "text" ? (
                  <Text
                    style={[
                      styles.chatText,
                      isUserMessage && userType === "petParent"
                        ? styles.chatTextPetParent
                        : {},
                    ]}
                  >
                    {item.text || item.content}
                  </Text>
                ) : item.contentType === "image" ? (
                  <Image
                    source={{ uri: item.mediaUrl }}
                    style={styles.mediaImage}
                    resizeMode="cover"
                  />
                ) : item.contentType === "video" ? (
                  <View style={styles.videoContainer}>
                    <Image
                      source={{ uri: item.mediaUrl }}
                      style={styles.mediaImage}
                      resizeMode="cover"
                    />
                    <View style={styles.playButton}>
                      <Ionicons name="play" size={24} color="white" />
                    </View>
                  </View>
                ) : item.contentType === "audio" ? (
                  <View style={styles.audioContainer}>
                    <Ionicons
                      name="mic"
                      size={20}
                      color={userType === "petParent" ? "#333" : "white"}
                    />
                    <Text
                      style={[
                        styles.audioText,
                        isUserMessage && userType === "petParent"
                          ? styles.chatTextPetParent
                          : {},
                      ]}
                    >
                      Audio message
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.chatText,
                      isUserMessage && userType === "petParent"
                        ? styles.chatTextPetParent
                        : {},
                    ]}
                  >
                    {item.text || item.content}
                  </Text>
                )}
              </View>

              {/* Chat Footer (Only for User's Messages) */}
              {isUserMessage && <Text style={styles.chatFooter}>Seen</Text>}
            </View>
          );
        }}
      />

      {/* Different bottom sections based on booking status */}
      {isBookingExpired ? (
        // Expired booking UI
        <View style={styles.expiredContainer}>
          <Text style={styles.expiredText}>
            The session is no longer available.
          </Text>
        </View>
      ) : (
        <>
          {/* Media options */}
          {showMediaOptions && (
            <Animated.View
              style={[
                styles.mediaOptionsContainer,
                {
                  transform: [
                    {
                      translateY: mediaOptionsAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                  ],
                  opacity: mediaOptionsAnim,
                },
              ]}
            >
              <TouchableOpacity style={styles.mediaOption} onPress={pickImage}>
                <Ionicons name="images-outline" size={18} color="#FF6B6B" />
                <Text style={styles.mediaOptionText}>Photos</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mediaOption} onPress={pickVideo}>
                <Ionicons name="videocam-outline" size={18} color="#FF6B6B" />
                <Text style={styles.mediaOptionText}>Videos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mediaOption}
                onPress={toggleCameraType}
              >
                <MaterialIcons
                  name="flip-camera-ios"
                  size={18}
                  color="#FF6B6B"
                />
                <Text style={styles.mediaOptionText}>Flip Camera</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Active chat input UI */}
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.plusButton}
              onPress={toggleMediaOptions}
            >
              <AntDesign
                name={showMediaOptions ? "close" : "plus"}
                size={24}
                color="#FF6B6B"
              />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message here"
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              style={styles.iconButton}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <Ionicons
                name={isRecording ? "stop-circle" : "mic-outline"}
                size={24}
                color={isRecording ? "#FF3B30" : "#FF6B6B"}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={openCamera}>
              <Ionicons name="camera-outline" size={24} color="#FF6B6B" />
            </TouchableOpacity>

            {newMessage.trim() ? (
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  userType === "petParent" ? styles.sendButtonPetParent : {},
                ]}
                onPress={sendTextMessage}
              >
                <Feather name="send" size={20} color="white" />
              </TouchableOpacity>
            ) : null}
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingBottom: 200,
  },
  hostContainer: {
    backgroundColor: "#e0f7f5", // Light mint color for host
  },
  petParentContainer: {
    backgroundColor: "#fff0f0", // Light pink color for pet parent
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
    borderRadius: 16,
    maxWidth: "75%",
  },
  chatBubbleHost: {
    backgroundColor: "#4CD4C0", // Mint green for host
    alignSelf: "flex-end",
  },
  chatBubblePetParent: {
    backgroundColor: "#FFB6C1", // Pink for pet parent
    alignSelf: "flex-end",
  },
  chatBubbleOther: {
    backgroundColor: "#E8E8E8", // Gray for other users
    alignSelf: "flex-start",
  },
  chatText: {
    color: "#fff",
    fontSize: 15,
  },
  chatTextPetParent: {
    color: "#333", // Darker text for pet parent bubbles for better contrast
  },
  chatFooter: {
    fontSize: 10,
    color: "#aaa",
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    alignItems: "center",
  },
  plusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 15,
  },
  iconButton: {
    padding: 8,
  },
  sendButton: {
    backgroundColor: "#4CD4C0", // Default color (host)
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonPetParent: {
    backgroundColor: "#FF6B6B", // Pink for pet parent
  },
  expiredContainer: {
    padding: 16,
    backgroundColor: "#e0e0e0",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    alignItems: "center",
  },
  expiredText: {
    color: "#666",
    fontSize: 14,
  },
  mediaOptionsContainer: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#f8f8f8",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  mediaOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  mediaOptionText: {
    marginLeft: 4,
    color: "#666",
    fontSize: 14,
  },
  mediaImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  videoContainer: {
    position: "relative",
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -15 }, { translateY: -15 }],
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  audioContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },
  audioText: {
    marginLeft: 8,
    color: "#fff",
  },
});

export default ChatScreen;
