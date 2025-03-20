import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { SERVER_URI } from "@/utils/uri";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import {
  widthPixel,
  heightPixel,
  fontPixel,
  pixelSizeVertical,
  pixelSizeHorizontal,
} from "../../utils/responsive";
import { RectButton } from "react-native-gesture-handler";

interface Host {
  userId: string;
  _id: string;
  fullName: string;
  city: string;
  profileImage: string;
  rating: number;
  bio: string;
  phoneNumber?: string;
  email?: string;
}

interface Booking {
  _id: string;
  acceptedHosts: Host[];
}

interface HostCardProps {
  host: Host;
  onKnowMore: () => void;
  isSelected: boolean;
  onSelect: () => void;
}

const HostCard: React.FC<HostCardProps> = ({
  host,
  onKnowMore,
  isSelected,
  onSelect,
}) => (
  <TouchableOpacity
    style={[styles.card, isSelected && styles.selectedCard]}
    onPress={onSelect}
    accessibilityRole="button"
    accessibilityState={{ selected: isSelected }}
    accessibilityLabel={`${isSelected ? "Deselect" : "Select"} ${
      host.fullName
    } as your host`}
  >
    <View style={styles.cardContent}>
      <Image
        source={{ uri: host.profileImage }}
        style={styles.avatar}
        accessibilityLabel={`${host.fullName}'s profile picture`}
      />
      <View style={styles.hostInfo}>
        <Text style={styles.hostName}>{host.fullName}</Text>
        <Text style={styles.location}>{host.city}</Text>
      </View>
      <View style={styles.ratingContainer}>
        <View style={styles.stars}>
          {[...Array(5)].map((_, i) => (
            <Icon
              key={`star-${host._id}-${i}`}
              name="star"
              size={16}
              color={i < host.rating ? "#FDD00D" : "#E0E0E0"}
            />
          ))}
        </View>
        <TouchableOpacity
          onPress={onKnowMore}
          accessibilityLabel={`Learn more about ${host.fullName}`}
        >
          <Text style={styles.knowMore}>know more</Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

export default function BookingScreenThree() {
  const bookingData = useSelector(
    (state: RootState) => state.booking.bookingData
  );
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedHostIds, setSelectedHostIds] = useState<string[]>([]);
  const [selectedHostDetails, setSelectedHostDetails] = useState<Host | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, []);

  const fetchBooking = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) {
        console.log("No access token found");
        setLoading(false);
        Alert.alert(
          "Error",
          "You are not logged in. Please log in and try again."
        );
        return;
      }

      setLoading(true);

      const response = await axios.post<{ booking: Booking; success: boolean }>(
        `${SERVER_URI}/get-booking-by-id`,
        {
          bookingId: bookingData?._id,
        },
        {
          headers: { access_token: accessToken },
        }
      );

      if (response.data.success && response.data.booking) {
        setBooking(response.data.booking);
      }
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHostDetails = async (hostId: string) => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) {
        Alert.alert("Error", "Please log in to view host details");
        return;
      }

      setLoading(true);
      const response = await axios.get<{ host: Host; success: boolean }>(
        `${SERVER_URI}/get-host-details/${hostId}`,
        {
          headers: { access_token: accessToken },
        }
      );

      if (response.data.success && response.data.host) {
        setSelectedHostDetails(response.data.host);
        setModalVisible(true);
      }
    } catch (error: any) {
      console.log("Error fetching host details:", error);
      Alert.alert("Error", "Failed to fetch host details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = async (error: any) => {
    if (error.response?.status === 413) {
      await AsyncStorage.removeItem("access_token");
      await AsyncStorage.removeItem("refresh_token");
      router.replace("/(routes)/login");
    }
    console.log("Error:", error);
  };

  const handleKnowMore = (host: Host) => {
    fetchHostDetails(host.userId);
  };

  const handleSelectHost = (hostId: string) => {
    setSelectedHostIds((prevSelectedHostIds) => {
      if (prevSelectedHostIds.includes(hostId)) {
        return prevSelectedHostIds.filter((id) => id !== hostId);
      } else {
        return [...prevSelectedHostIds, hostId];
      }
    });
  };

  const handleConfirmBooking = async () => {
    if (selectedHostIds.length === 0) {
      Alert.alert(
        "Error",
        "Please select at least one host before confirming the booking."
      );
      return;
    }

    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) {
        Alert.alert(
          "Error",
          "You are not logged in. Please log in and try again."
        );
        return;
      }

      setLoading(true);

      const response = await axios.post(
        `${SERVER_URI}/confirm-booking`,
        {
          selectedHostIds,
          bookingId: bookingData?._id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            access_token: accessToken,
          },
        }
      );

      if (response.data.success) {
        Alert.alert("Success", "Booking confirmed successfully!", [
          { text: "OK", onPress: () => router.push("./booknowfour") },
        ]);
      }
    } catch (error: any) {
      handleAuthError(error);
      Alert.alert("Error", "Failed to confirm booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !modalVisible) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#FF6B6B"
          accessibilityLabel="Loading bookings"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.boardingboxtwo}>
        <RectButton
          style={styles.backButton}
          onPress={() => router.push("/(drawer)/(tabs)/booknow/booknowtwo")}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </RectButton>
        <Text style={styles.headerboardingbox}>Boarding</Text>
      </View>

      <Text style={styles.subtitle}>Select Host(s) for your pet</Text>

      {booking && booking.acceptedHosts.length > 0 ? (
        booking.acceptedHosts.map((host) => (
          <View style={styles.profilecardcontainer} key={host.userId}>
            <View style={styles.profilecardbackground}></View>
            <HostCard
              host={host}
              onKnowMore={() => handleKnowMore(host)}
              isSelected={selectedHostIds.includes(host.userId)}
              onSelect={() => handleSelectHost(host.userId)}
            />
          </View>
        ))
      ) : (
        <Text style={styles.noHostsText}>No accepted hosts available yet.</Text>
      )}

      <TouchableOpacity
        style={[
          styles.confirmButton,
          selectedHostIds.length === 0 && styles.disabledButton,
        ]}
        onPress={handleConfirmBooking}
        disabled={selectedHostIds.length === 0 || loading}
        accessibilityLabel="Confirm booking with selected host(s)"
      >
        <Text style={styles.confirmButtonText}>Confirm Booking</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedHostDetails && (
              <>
                <Text style={styles.modalTitle}>
                  {selectedHostDetails.fullName}
                </Text>
                <Image
                  source={{ uri: selectedHostDetails.profileImage }}
                  style={styles.modalAvatar}
                />
                <View style={styles.modalDetails}>
                  <Text style={styles.modalText}>
                    Location: {selectedHostDetails.city}
                  </Text>
                  <Text style={styles.modalText}>
                    Bio: {selectedHostDetails.bio || "Not provided"}
                  </Text>
                  <Text style={styles.modalText}>
                    Rating: {selectedHostDetails.rating}/5
                  </Text>
                  {selectedHostDetails.phoneNumber && (
                    <Text style={styles.modalText}>
                      Phone: {selectedHostDetails.phoneNumber}
                    </Text>
                  )}
                  {selectedHostDetails.email && (
                    <Text style={styles.modalText}>
                      Email: {selectedHostDetails.email}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
            {loading && <ActivityIndicator size="large" color="#FF6B6B" />}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: pixelSizeVertical(190),
  },
  headerboardingbox: {
    fontSize: fontPixel(18),
    color: "#fff",
    fontFamily: "OtomanopeeOne",
  },
  boardingboxtwo: {
    marginTop: pixelSizeVertical(25),
    backgroundColor: "#F96247",
    borderRadius: widthPixel(6),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: pixelSizeHorizontal(10),
    height: heightPixel(70),
    marginHorizontal: pixelSizeHorizontal(16),
  },
  backButton: {
    width: widthPixel(36),
    height: heightPixel(36),
    position: "absolute",
    left: pixelSizeHorizontal(10),
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: widthPixel(50),
  },
  subtitle: {
    textAlign: "center",
    fontSize: fontPixel(18),
    fontWeight: "600",
    marginHorizontal: pixelSizeHorizontal(16),
    marginBottom: pixelSizeVertical(20),
    marginTop: pixelSizeVertical(20),
  },
  card: {
    borderWidth: 1,
    borderColor: "#FF6B4A",
    borderRadius: widthPixel(12),
    marginBottom: pixelSizeVertical(16),
    padding: pixelSizeHorizontal(12),
    zIndex: 999,
    backgroundColor: "#fff",
  },
  selectedCard: {
    backgroundColor: "#E6FFE6",
    borderColor: "#4CAF50",
  },
  profilecardcontainer: {
    position: "relative",
    width: "90%",
    marginHorizontal: "auto",
  },
  profilecardbackground: {
    position: "absolute",
    top: pixelSizeVertical(8),
    right: pixelSizeHorizontal(-7),
    bottom: pixelSizeVertical(9),
    left: pixelSizeHorizontal(9),
    backgroundColor: "#FF6B6B",
    borderRadius: widthPixel(12),
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: widthPixel(60),
    height: heightPixel(60),
    borderRadius: widthPixel(30),
    marginRight: pixelSizeHorizontal(12),
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: fontPixel(16),
    fontWeight: "600",
  },
  location: {
    fontSize: fontPixel(14),
    color: "#757575",
  },
  ratingContainer: {
    alignItems: "flex-end",
  },
  stars: {
    flexDirection: "row",
  },
  knowMore: {
    fontSize: fontPixel(14),
    color: "#FF6B4A",
  },
  confirmButton: {
    backgroundColor: "#FF6B4A",
    borderRadius: widthPixel(8),
    paddingVertical: pixelSizeVertical(16),
    marginHorizontal: pixelSizeHorizontal(16),
    alignItems: "center",
    marginTop: pixelSizeVertical(20),
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: fontPixel(16),
    fontWeight: "bold",
  },
  noHostsText: {
    textAlign: "center",
    fontSize: fontPixel(16),
    color: "#666",
    marginTop: pixelSizeVertical(20),
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: widthPixel(300),
    padding: pixelSizeVertical(20),
    backgroundColor: "#fff",
    borderRadius: widthPixel(12),
    alignItems: "center",
  },
  modalTitle: {
    fontSize: fontPixel(20),
    fontWeight: "bold",
    marginBottom: pixelSizeVertical(10),
  },
  modalAvatar: {
    width: widthPixel(80),
    height: heightPixel(80),
    borderRadius: widthPixel(40),
    marginBottom: pixelSizeVertical(10),
  },
  modalDetails: {
    width: "100%",
  },
  modalText: {
    fontSize: fontPixel(16),
    marginBottom: pixelSizeVertical(5),
  },
  closeButton: {
    backgroundColor: "#FF6B4A",
    borderRadius: widthPixel(8),
    paddingVertical: pixelSizeVertical(10),
    paddingHorizontal: pixelSizeHorizontal(20),
    marginTop: pixelSizeVertical(15),
  },
  closeButtonText: {
    color: "#fff",
    fontSize: fontPixel(16),
    fontWeight: "bold",
  },
});
