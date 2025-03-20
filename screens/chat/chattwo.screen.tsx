"use client";

import React from "react";
import { useEffect, useState, useRef, useCallback, memo } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Image,
  Animated,
  Modal,
  StatusBar,
  SafeAreaView,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast } from "react-native-toast-notifications";
import useUser from "@/hooks/auth/useUser";
import { SERVER_URI } from "@/utils/uri";
import { useFocusEffect } from "@react-navigation/native";
import { Feather, Ionicons, AntDesign } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { Audio, Video, ResizeMode } from "expo-av";
import * as ImageManipulator from "expo-image-manipulator";
import { RectButton } from "react-native-gesture-handler";

interface Message {
  _id: string;
  sender: {
    _id: string;
    fullName: string;
    avatar?: { url: string };
  } | null;
  content: string;
  contentType: "text" | "image" | "video" | "audio";
  mediaUrl?: string;
  timestamp: string;
}

interface ChatItemProps {
  item: Message;
  isUserMessage: boolean;
  onPress: () => void;
  playingAudioId: string | null;
}

const ChatScreen: React.FC = () => {
  const { userId } = useLocalSearchParams<{ userId: string }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isBookingExpired, setIsBookingExpired] = useState<boolean>(false);
  const [showMediaOptions, setShowMediaOptions] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [fullScreenMedia, setFullScreenMedia] = useState<{
    type: "image" | "video";
    uri: string;
  } | null>(null);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [chatPartner, setChatPartner] = useState<{
    name: string;
    avatar?: string;
  }>({ name: "Loading..." });
  const [shouldAutoScroll, setShouldAutoScroll] = useState<boolean>(true);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [userType, setUserType] = useState<"host" | "petParent" | null>(null);

  const socketRef = useRef<any>(null);
  const flatListRef = useRef<FlatList<Message>>(null);
  const mediaOptionsAnim = useRef(new Animated.Value(0)).current;
  const { user } = useUser();
  const LoggedInuserId = user?._id;
  const inputRef = useRef<TextInput>(null);

  const getThemeColors = () => {
    if (userType === "host") {
      return {
        primary: "#B5F1E3",
        secondary: "#4CD4C0",
        text: "#333",
        bubbleText: "#fff",
      };
    } else {
      return {
        primary: "#FFD6D6",
        secondary: "#FF9E9E",
        text: "#333",
        bubbleText: "#fff",
      };
    }
  };

  const themeColors = getThemeColors();

  useEffect(() => {
    const keyboardWillShowListener =
      Platform.OS === "ios"
        ? Keyboard.addListener("keyboardWillShow", (e) => {
            setKeyboardHeight(e.endCoordinates.height);
            setKeyboardVisible(true);
          })
        : Keyboard.addListener("keyboardDidShow", (e) => {
            setKeyboardHeight(e.endCoordinates.height);
            setKeyboardVisible(true);
          });

    const keyboardWillHideListener =
      Platform.OS === "ios"
        ? Keyboard.addListener("keyboardWillHide", () => {
            setKeyboardHeight(0);
            setKeyboardVisible(false);
          })
        : Keyboard.addListener("keyboardDidHide", () => {
            setKeyboardHeight(0);
            setKeyboardVisible(false);
          });

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      if (!userId) return;
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) throw new Error("No access token found");

      const response = await axios.get(`${SERVER_URI}/user/${userId}`, {
        headers: { access_token: accessToken },
      });

      if (response.data.user) {
        setChatPartner({
          name: response.data.user.fullname,
          avatar: response.data.user.avatar?.url,
        });
      }
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      if (error.response?.status === 413) {
        await AsyncStorage.removeItem("access_token");
        await AsyncStorage.removeItem("refresh_token");
        router.replace("/(routes)/login");
      }
    }
  }, [userId, router]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) throw new Error("No access token found");

      const response = await axios.get(`${SERVER_URI}/user-related-bookings`, {
        headers: { access_token: accessToken },
      });

      const isHost = !!response.data.hosts;
      setUserType(isHost ? "host" : "petParent");
      await fetchUserData();
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
  }, [router, userId, fetchUserData]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  useEffect(() => {
    const requestPermissions = async () => {
      await ImagePicker.requestCameraPermissionsAsync();
      await Audio.requestPermissionsAsync();
      await MediaLibrary.requestPermissionsAsync();
    };
    requestPermissions();
  }, []);

  useEffect(() => {
    const setupChat = async () => {
      try {
        setLoading(true);
        const accessToken = await AsyncStorage.getItem("access_token");
        if (!accessToken) throw new Error("No access token found");

        const bookingResponse = await axios.post(
          `${SERVER_URI}/booking-enddate`,
          { participantId: userId },
          { headers: { access_token: accessToken } }
        );

        const endDateTime = bookingResponse.data.booking?.[0]?.endDateTime;
        if (endDateTime) {
          setIsBookingExpired(new Date() >= new Date(endDateTime));
        }

        const chatResponse = await axios.post(
          `${SERVER_URI}/create`,
          { participantId: userId },
          { headers: { access_token: accessToken } }
        );
        setChatId(chatResponse.data._id);

        if (chatResponse.data.participants && !chatPartner.name) {
          const partner = chatResponse.data.participants.find(
            (p: any) => p._id !== LoggedInuserId
          );
          if (partner) {
            setChatPartner({
              name: partner.fullName || "Chat Partner",
              avatar: partner.avatar?.url,
            });
          }
        }

        const messagesResponse = await axios.get(
          `${SERVER_URI}/${chatResponse.data._id}/messages`,
          {
            headers: { access_token: accessToken },
          }
        );

        const formattedMessages: Message[] = (messagesResponse.data || [])
          .filter((msg: any) => msg && msg._id)
          .map((msg: any) => ({
            _id: msg._id,
            sender: msg.sender
              ? {
                  _id: msg.sender._id || "",
                  fullName: msg.sender.fullName || chatPartner.name,
                }
              : null,
            content: msg.content || "",
            contentType: msg.contentType || "text",
            mediaUrl: msg.mediaUrl,
            timestamp: msg.timestamp || new Date().toISOString(),
          }));
        setMessages(formattedMessages);
      } catch (err: any) {
        console.error("Setup chat error:", err);
        if (err.response?.status === 400) {
          await AsyncStorage.removeItem("access_token");
          await AsyncStorage.removeItem("refresh_token");
          router.replace("/(routes)/login");
        }
        setError("Failed to load chat");
      } finally {
        setLoading(false);
      }
    };

    setupChat();
  }, [userId, LoggedInuserId, chatPartner.name]);

  useEffect(() => {
    if (!LoggedInuserId || !user?.fullname) return;

    const socket = new WebSocket(`ws://${SERVER_URI.split("//")[1]}`);
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          event: "joinChat",
          data: {
            fullName: user.fullname,
            userId,
            LoggedInuserId,
          },
        })
      );
    };

    socket.onmessage = (event) => {
      const { event: eventType, data } = JSON.parse(event.data);
      if (eventType === "messageReceived") {
        const message: Message = data;
        if (message.sender?._id !== LoggedInuserId) {
          setMessages((prev) => {
            if (prev.some((msg) => msg._id === message._id)) {
              return prev;
            }
            return [...prev, message];
          });
          scrollToBottom();
        }
      }
    };

    return () => {
      socket.close();
    };
  }, [LoggedInuserId, user?.fullname, userId]);

  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isCloseToBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 20;
    setShouldAutoScroll(isCloseToBottom);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (shouldAutoScroll && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [shouldAutoScroll]);

  const sendMediaMessage = useCallback(
    async (uri: string, contentType: "image" | "video" | "audio") => {
      if (!chatId || !user?.fullname) return;

      setShouldAutoScroll(true);

      try {
        const accessToken = await AsyncStorage.getItem("access_token");
        const messageText = `Sent a ${contentType}`;

        const response = await axios.post(
          `${SERVER_URI}/${chatId}/messages`,
          {
            content: messageText,
            contentType,
            mediaUrl: uri,
          },
          { headers: { access_token: accessToken! } }
        );

        const newMsg: Message = {
          _id: response.data._id,
          sender: {
            _id: LoggedInuserId!,
            fullName: user.fullname,
          },
          content: messageText,
          contentType,
          mediaUrl: uri,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => {
          if (prev.some((msg) => msg._id === newMsg._id)) {
            return prev;
          }
          return [...prev, newMsg];
        });
        scrollToBottom();

        socketRef.current.send(
          JSON.stringify({
            event: "sendMessage",
            data: {
              fullName: user.fullname,
              userId,
              LoggedInuserId,
              text: messageText,
              contentType,
              mediaUrl: uri,
              messageId: response.data._id,
            },
          })
        );
      } catch (error) {
        Toast.show(`Failed to send ${contentType}`, { type: "error" });
      }
    },
    [chatId, user, LoggedInuserId]
  );

  const toggleMediaOptions = useCallback(() => {
    setShowMediaOptions((prev) => !prev);
    Animated.timing(mediaOptionsAnim, {
      toValue: showMediaOptions ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showMediaOptions]);

  const sendTextMessage = useCallback(async () => {
    if (isBookingExpired || !newMessage.trim() || !chatId || !user?.fullname) {
      Toast.show("Cannot send message", { type: "info" });
      return;
    }

    setShouldAutoScroll(true);

    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      const messageToSend = newMessage.trim();

      setNewMessage("");
      if (Platform.OS === "ios") {
        inputRef.current?.blur();
      } else {
        Keyboard.dismiss();
      }

      const response = await axios.post(
        `${SERVER_URI}/${chatId}/messages`,
        { content: messageToSend, contentType: "text" },
        { headers: { access_token: accessToken! } }
      );

      const newMsg: Message = {
        _id: response.data._id,
        sender: {
          _id: LoggedInuserId!,
          fullName: user.fullname,
        },
        content: messageToSend,
        contentType: "text",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => {
        if (prev.some((msg) => msg._id === newMsg._id)) {
          return prev;
        }
        return [...prev, newMsg];
      });

      socketRef.current.send(
        JSON.stringify({
          event: "sendMessage",
          data: {
            fullName: user.fullname,
            userId,
            LoggedInuserId,
            text: messageToSend,
            contentType: "text",
            messageId: response.data._id,
          },
        })
      );

      setTimeout(() => {
        scrollToBottom();
      }, 300);
    } catch (err) {
      setError("Failed to send message");
    }
  }, [
    isBookingExpired,
    newMessage,
    chatId,
    user,
    LoggedInuserId,
    scrollToBottom,
  ]);

  const pickMedia = useCallback(
    async (type: "image" | "video") => {
      if (isBookingExpired) {
        Toast.show("Booking has ended", { type: "info" });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          type === "image"
            ? ImagePicker.MediaTypeOptions.Images
            : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        await sendMediaMessage(result.assets[0].uri, type);
      }
      setShowMediaOptions(false);
    },
    [isBookingExpired, sendMediaMessage]
  );

  const startRecording = useCallback(async () => {
    if (isBookingExpired) {
      Toast.show("Booking has ended", { type: "info" });
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
    } catch (error) {
      Toast.show("Failed to start recording", { type: "error" });
    }
  }, [isBookingExpired]);

  const stopRecording = useCallback(async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      if (uri) await sendMediaMessage(uri, "audio");
    } catch (error) {
      Toast.show("Failed to stop recording", { type: "error" });
    }
  }, [recording, sendMediaMessage]);

  const takePhoto = useCallback(async () => {
    if (isBookingExpired) {
      Toast.show("Booking has ended", { type: "info" });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1000 } }],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      await sendMediaMessage(manipResult.uri, "image");
    }
    setShowMediaOptions(false);
  }, [isBookingExpired, sendMediaMessage]);

  const playAudio = useCallback(
    async (messageId: string, uri?: string) => {
      if (!uri) return;

      try {
        if (playingAudioId === messageId && currentSound) {
          await currentSound.stopAsync();
          await currentSound.unloadAsync();
          setPlayingAudioId(null);
          setCurrentSound(null);
          return;
        }

        if (currentSound) {
          await currentSound.stopAsync();
          await currentSound.unloadAsync();
        }

        const { sound } = await Audio.Sound.createAsync({ uri });
        setCurrentSound(sound);
        setPlayingAudioId(messageId);
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setPlayingAudioId(null);
            setCurrentSound(null);
            sound.unloadAsync();
          }
        });
      } catch (error) {
        Toast.show("Failed to play audio", { type: "error" });
      }
    },
    [playingAudioId, currentSound]
  );

  const viewMediaFullScreen = useCallback(
    (type: "image" | "video", uri: string) => {
      setFullScreenMedia({ type, uri });
    },
    []
  );

  const handleItemPress = useCallback(
    (item: Message) => {
      if (item.contentType === "audio") {
        playAudio(item._id, item.mediaUrl);
      } else if (item.contentType === "image" || item.contentType === "video") {
        item.mediaUrl && viewMediaFullScreen(item.contentType, item.mediaUrl);
      }
    },
    [playAudio, viewMediaFullScreen]
  );

  const handleBackPress = useCallback(() => {
    router.push("/(drawer)/(tabs)/chat");
  }, [router]);

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

  const ChatItem = memo(
    ({ item, isUserMessage, onPress, playingAudioId }: ChatItemProps) => (
      <View
        style={[
          styles.chatContainer,
          isUserMessage ? styles.chatEnd : styles.chatStart,
        ]}
      >
        {!isUserMessage && item?.sender?.fullName && (
          <Text style={styles.chatHeader}>{chatPartner.name}</Text>
        )}
        <TouchableOpacity onPress={onPress}>
          <View
            style={[
              styles.chatBubble,
              isUserMessage
                ? [
                    styles.chatBubbleUser,
                    { backgroundColor: themeColors.secondary },
                  ]
                : styles.chatBubbleOther,
            ]}
          >
            {item.contentType === "text" && (
              <Text
                style={[
                  styles.chatText,
                  { color: isUserMessage ? themeColors.bubbleText : "#333" },
                ]}
              >
                {item.content}
              </Text>
            )}
            {item.contentType === "image" && item.mediaUrl && (
              <Image
                source={{ uri: item.mediaUrl }}
                style={styles.mediaImage}
              />
            )}
            {item.contentType === "video" && item.mediaUrl && (
              <View style={styles.videoPreview}>
                <Image
                  source={{ uri: item.mediaUrl }}
                  style={styles.mediaImage}
                />
                <View style={styles.playButton}>
                  <Ionicons name="play" size={24} color="white" />
                </View>
              </View>
            )}
            {item.contentType === "audio" && (
              <View style={styles.audioContainer}>
                <Ionicons
                  name={playingAudioId === item._id ? "stop" : "play"}
                  size={20}
                  color={isUserMessage ? "white" : "#333"}
                />
                <Text
                  style={[
                    styles.chatText,
                    { color: isUserMessage ? themeColors.bubbleText : "#333" },
                  ]}
                >
                  Audio message
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        {isUserMessage && <Text style={styles.chatFooter}>Seen</Text>}
      </View>
    ),
    (prevProps, nextProps) =>
      prevProps.item._id === nextProps.item._id &&
      prevProps.isUserMessage === nextProps.isUserMessage &&
      prevProps.playingAudioId === nextProps.playingAudioId
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar hidden={true} />
      <RectButton
        style={[
          styles.headerContainer,
          { backgroundColor: themeColors.primary },
        ]}
        onPress={handleBackPress}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <View
            style={[
              styles.backButton,
              { backgroundColor: themeColors.secondary },
            ]}
          >
            <AntDesign name="arrowleft" size={24} color="#fff" />
          </View>
          <View style={styles.userInfoContainer}>
            {chatPartner.avatar ? (
              <Image
                source={{ uri: chatPartner.avatar }}
                style={styles.avatar}
              />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: themeColors.secondary },
                ]}
              >
                <Text style={styles.avatarText}>
                  {chatPartner.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={[styles.userName, { color: themeColors.text }]}>
              {chatPartner.name}
            </Text>
          </View>
        </View>
      </RectButton>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={styles.container}>
          <FlatList<Message>
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item._id}
            onScroll={handleScroll}
            onContentSizeChange={scrollToBottom}
            onLayout={scrollToBottom}
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            windowSize={5}
            renderItem={({ item }) => (
              <ChatItem
                item={item}
                isUserMessage={item?.sender?._id === LoggedInuserId}
                onPress={() => handleItemPress(item)}
                playingAudioId={playingAudioId}
              />
            )}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingBottom: isBookingExpired
                  ? 0
                  : keyboardVisible
                  ? keyboardHeight + 80
                  : 80,
              },
            ]}
          />

          {isBookingExpired ? (
            <View style={styles.expiredContainer}>
              <Text style={styles.expiredText}>
                The session is no longer available.
              </Text>
            </View>
          ) : (
            <>
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
                      bottom: 56,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.mediaOption}
                    onPress={() => pickMedia("image")}
                  >
                    <Ionicons name="images-outline" size={18} color="#FF6B6B" />
                    <Text style={styles.mediaOptionText}>Photos</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.mediaOption}
                    onPress={() => pickMedia("video")}
                  >
                    <Ionicons
                      name="videocam-outline"
                      size={18}
                      color="#FF6B6B"
                    />
                    <Text style={styles.mediaOptionText}>Videos</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}

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
                  ref={inputRef}
                  style={styles.input}
                  value={newMessage}
                  onChangeText={setNewMessage}
                  placeholder="Type a message here"
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
                <TouchableOpacity style={styles.iconButton} onPress={takePhoto}>
                  <Ionicons name="camera-outline" size={24} color="#FF6B6B" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    { backgroundColor: themeColors.secondary },
                  ]}
                  onPress={sendTextMessage}
                >
                  <Feather name="send" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={!!fullScreenMedia}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setFullScreenMedia(null)}
      >
        <View style={styles.fullScreenContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setFullScreenMedia(null)}
          >
            <AntDesign name="close" size={30} color="white" />
          </TouchableOpacity>
          {fullScreenMedia?.type === "image" && (
            <Image
              source={{ uri: fullScreenMedia.uri }}
              style={styles.fullScreenImage}
              resizeMode={ResizeMode.CONTAIN}
            />
          )}
          {fullScreenMedia?.type === "video" && (
            <Video
              source={{ uri: fullScreenMedia.uri }}
              style={styles.fullScreenVideo}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={true}
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    position: "relative",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
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
  chatBubbleUser: {
    backgroundColor: "#4CD4C0",
  },
  chatBubbleOther: {
    backgroundColor: "#E8E8E8",
  },
  chatText: {
    color: "#fff",
    fontSize: 15,
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
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
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
  },
  iconButton: {
    padding: 8,
  },
  sendButton: {
    backgroundColor: "#4CD4C0",
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
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
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 56,
    zIndex: 2,
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
  videoPreview: {
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
    gap: 8,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
  fullScreenVideo: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#B5F1E3",
    paddingVertical: 12,
    paddingHorizontal: 16,
    height: 70,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4CD4C0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4CD4C0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});

export default ChatScreen;
