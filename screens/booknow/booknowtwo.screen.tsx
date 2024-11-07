import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialIcons";
import { router } from "expo-router";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the structure of Host and Booking data
interface Host {
  profileImage: string;
  fullName: string;
  city: string;
  bio: string;
  rating: number;
}

interface Booking {
  acceptedHosts: Host[];
  location: { address: string; type: string };
  // Add other necessary fields from your booking data
}

export default function BookingScreenTwo() {
  const [currentBookingIndex, setCurrentBookingIndex] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data each time the component mounts
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) {
        console.error("No access token found");
        setLoading(false);
        return;
      }

      // Make sure to clear any cached data and force a fresh request.
      setLoading(true); // Show loading spinner

      const response = await axios.get<{ bookings: Booking[] }>(`${SERVER_URI}/get-bookings`, {
        headers: { access_token: accessToken },
      });

      console.log(response.data.bookings); // Log the fresh data
      setBookings(response.data.bookings);
      setLoading(false); // Hide loading spinner after data is fetched
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setLoading(false); // Hide loading spinner in case of error
    }
  };

  const nextBooking = () => {
    setCurrentBookingIndex((prevIndex) => (prevIndex + 1) % bookings.length);
  };

  const prevBooking = () => {
    setCurrentBookingIndex((prevIndex) => (prevIndex - 1 + bookings.length) % bookings.length);
  };

  const handleBookNow = () => {
    router.push("./booknowthree");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </SafeAreaView>
    );
  }

  const currentBooking = bookings[currentBookingIndex];
  const hostInfo = currentBooking.acceptedHosts && currentBooking.acceptedHosts[0];

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.push("/(drawer)/(tabs)/booknow")}>
        <View style={styles.boardingboxtwo}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/(drawer)/(tabs)/booknow")}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerboardingbox}>Boarding</Text>
        </View>
      </TouchableOpacity>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="paw" size={24} color="white" />
            </View>
            <Text style={styles.cardTitle}>Booking Confirmation Process</Text>
          </View>
          <Text style={styles.stepText}>
            <Text style={styles.boldText}>Step 1:</Text> Your request will be
            acknowledged by our hosts within 12 hours. You will receive a
            notification and an email update regarding the status.
          </Text>
          <Text style={styles.stepText}>
            <Text style={styles.boldText}>Step 2:</Text> Once the hosts accept
            your request, you can select your preferred host from the accepted
            hosts to proceed with the booking.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Matched Pawfect Hosts</Text>

        {hostInfo ? (
          <View style={styles.hostCard}>
            <Image
              source={{ uri: hostInfo.profileImage }}
              style={styles.hostImage}
            />
            <View style={styles.ratingContainer}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < hostInfo.rating ? "star" : "star-outline"}
                  size={20}
                  color="#FFD700"
                />
              ))}
            </View>
            <View style={styles.hostInfo}>
              <View style={styles.hostHeader}>
                <Text style={styles.hostName}>{hostInfo.fullName}</Text>
                <View style={styles.locationContainer}>
                  <Ionicons name="location" size={16} color="#666" />
                  <Text style={styles.locationText}>{hostInfo.city}</Text>
                </View>
              </View>
              <Text style={styles.bioText}>{hostInfo.bio}</Text>
              <TouchableOpacity style={styles.viewMoreButton}>
                <Text style={styles.viewMoreText}>View More</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.noHostsText}>No matched hosts available.</Text>
        )}

        <View style={styles.sliderButtons}>
          <TouchableOpacity onPress={prevBooking} style={styles.sliderButton}>
            <AntDesign name="arrowleft" size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity onPress={nextBooking} style={styles.sliderButton}>
            <AntDesign name="arrowright" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.bookNowButton} onPress={handleBookNow}>
          <Text style={styles.bookNowText}>Book Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // The rest of your styles...
  container: {
    flex: 1,
    backgroundColor: "#FFF5EB",
    paddingBottom: 140,
  },
  headerboardingbox: {
    fontSize: 18,
    color: "#fff",
    fontFamily: "OtomanopeeOne",
  },
  boardingboxtwo: {
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
    zIndex: 1,
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    backgroundColor: "#FF6B6B",
    borderRadius: 20,
    padding: 8,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  stepText: {
    marginBottom: 8,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: "bold",
  },
  sectionTitle: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  hostCard: {
    backgroundColor: "#FFECD1",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  hostImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    position: "absolute",
    top: 30,
    right: 30,
  },
  hostInfo: {
    marginBottom: 12,
  },
  hostHeader: {
    marginBottom: 8,
  },
  hostName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationText: {
    marginLeft: 4,
    color: "#666",
  },
  viewMoreButton: {
    backgroundColor: "#FFD700",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 8,
  },
  viewMoreText: {
    fontWeight: "bold",
    color: "#000",
  },
  sliderButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 40,
    marginBottom: 16,
  },
  sliderButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  bookNowButton: {
    backgroundColor: "#F96247",
    borderRadius: 4,
    padding: 16,
    alignItems: "center",
  },
  bookNowText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  noHostsText: {
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
  },

  bioText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 8,
  },
});
