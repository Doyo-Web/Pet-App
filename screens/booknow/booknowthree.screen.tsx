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
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { SERVER_URI } from "@/utils/uri";

interface Host {
  _id: string;
  fullName: string;
  city: string;
  profileImage: string;
  rating: number;
  bio: string;
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedHostIds, setSelectedHostIds] = useState<string[]>([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) {
        console.error("No access token found");
        setLoading(false);
        Alert.alert(
          "Error",
          "You are not logged in. Please log in and try again."
        );
        return;
      }

      setLoading(true);

      const response = await axios.get<{ bookings: Booking[] }>(
        `${SERVER_URI}/get-bookings`,
        {
          headers: { access_token: accessToken },
        }
      );

      setBookings(response.data.bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      Alert.alert("Error", "Failed to fetch bookings. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleKnowMore = (host: Host) => {
    Alert.alert("Host Details", `Name: ${host.fullName}\nBio: ${host.bio}`);
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
        { selectedHostIds },
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
      } else {
        Alert.alert(
          "Error",
          response.data.message ||
            "Failed to confirm booking. Please try again."
        );
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const allHosts = bookings.flatMap((booking) =>
    booking.acceptedHosts.map((host) => ({
      ...host,
      bookingId: booking._id,
    }))
  );

  if (loading) {
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
      <TouchableOpacity
        onPress={() => router.push("/(drawer)/(tabs)/booknow/booknowtwo")}
        accessibilityLabel="Go back to previous screen"
      >
        <View style={styles.boardingboxtwo}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/(drawer)/(tabs)/booknow/booknowtwo")}
            accessibilityLabel="Go back"
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerboardingbox}>Boarding</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Select the Host(s) for your pet</Text>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#FF6B4A"]}
            tintColor="#FF6B4A"
          />
        }
      >
        {allHosts.map((host) => (
          <HostCard
            key={`${host.bookingId}-${host._id}`}
            host={host}
            onKnowMore={() => handleKnowMore(host)}
            isSelected={selectedHostIds.includes(host._id)}
            onSelect={() => handleSelectHost(host._id)}
          />
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={handleConfirmBooking}
        accessibilityLabel="Confirm booking with selected hosts"
      >
        <Text style={styles.confirmButtonText}>Confirm Booking</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 190,
  },
  headerboardingbox: {
    fontSize: 18,
    color: "#fff",
    fontFamily: "OtomanopeeOne",
  },
  boardingboxtwo: {
    marginTop: 25,
    backgroundColor: "#F96247",
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    height: 70,
    marginHorizontal: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    position: "absolute",
    left: 10,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 50,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 16,
    marginBottom: 20,
    marginTop: 20,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: "#FF6B4A",
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
  },
  selectedCard: {
    backgroundColor: "#E6FFE6",
    borderColor: "#4CAF50",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: 16,
    fontWeight: "600",
  },
  location: {
    fontSize: 14,
    color: "#757575",
  },
  ratingContainer: {
    alignItems: "flex-end",
  },
  stars: {
    flexDirection: "row",
  },
  knowMore: {
    fontSize: 14,
    color: "#FF6B4A",
  },
  confirmButton: {
    backgroundColor: "#FF6B4A",
    borderRadius: 8,
    paddingVertical: 16,
    marginHorizontal: 16,
    alignItems: "center",
    marginTop: 20,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});