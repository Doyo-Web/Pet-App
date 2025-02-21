import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import { router } from "expo-router";

// Responsive utilities
const { width, height } = Dimensions.get("window");

const guidelineBaseWidth = 375
const guidelineBaseHeight = 812

const scale = (size: number) => (width / guidelineBaseWidth) * size
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor

const s = scale
const vs = verticalScale
const ms = moderateScale

interface Booking {
  city: any;
  _id: string;
  userId: string;
  pets: Array<{
    _id: string;
    name: string;
    breed: string;
    image: string;
  }>;
  startDateTime: string;
  endDateTime: string;
  location: {
    type: string;
    address: string;
    city: string;
  };
  diet: string;
  acceptedHosts: string[];
  selectedHost?: string;
  paymentStatus: "pending" | "completed";
  paymentDetails?: {
    paymentId: string;
    orderId: string;
    signature: string;
    amount: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Host {
  host: any;
  _id: string;
  name: string;
  city: string;
  bookings: Booking[];
}

export default function RequestsScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hostCity, setHostCity] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequestData = useCallback(async () => {
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

      // First get host profile to get city
      const hostResponse = await axios.get<Host>(`${SERVER_URI}/host`, {
        headers: { access_token: accessToken },
      });

      if (hostResponse.data && hostResponse.data.host.city) {
        setHostCity(hostResponse.data.host.city);
      } else {
        setLoading(false);
        return;
      }

      // Then get booking requests
      const bookingResponse = await axios.get<{ bookings: Booking[] }>(
        `${SERVER_URI}/getrequestbooking`,
        {
          headers: { access_token: accessToken },
        }
      );

      // Filter bookings based on city match
      const filteredBookings = bookingResponse.data.bookings.filter(
        (booking) =>
          booking.city &&
          booking.city &&
          booking.city.toLowerCase() ===
            hostResponse.data.host.city.toLowerCase() &&
          booking.userId._id !== hostResponse.data.host.userId._id // Exclude host's own booking
      );
      

      setBookings(filteredBookings);
      setLoading(false);
    } catch (error: any) {

       if (error.response?.status === 400) {
         await AsyncStorage.removeItem("access_token");
         await AsyncStorage.removeItem("refresh_token"); // Clear token
         router.replace("/(routes)/login"); // Redirect to login page
       }
      console.log("Error fetching data:", error);
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRequestData();
      const interval = setInterval(fetchRequestData, 10000);
      return () => clearInterval(interval);
    }, [fetchRequestData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRequestData();
  };

  const handleKnowMore = (bookingId: string) => {
    // Implement navigation to booking details screen
    console.log("Navigate to booking details for:", bookingId);
  };

  const handleAccept = async (bookingId: string) => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      await axios.put(
        `${SERVER_URI}/accepted-host`,
        { bookingId },
        { headers: { access_token: accessToken } }
      );
      Alert.alert("Success", "Booking accepted successfully");

      // Refresh the bookings list
      const bookingResponse = await axios.get<{ bookings: Booking[] }>(
        `${SERVER_URI}/getrequestbooking`,
        {
          headers: { access_token: accessToken },
        }
      );
      const filteredBookings = bookingResponse.data.bookings.filter(
        (booking) =>
          booking.location &&
          booking.location.city &&
          booking.location.city.toLowerCase() === hostCity.toLowerCase()
      );
      setBookings(filteredBookings);
    } catch (error: any) {
       if (error.response?.status === 400) {
         await AsyncStorage.removeItem("access_token");
         await AsyncStorage.removeItem("refresh_token"); // Clear token
         router.replace("/(routes)/login"); // Redirect to login page
       }
      console.log("Error accepting booking:", error);
      Alert.alert("Error", "Failed to accept booking. Please try again.");
    }
  };

  const handleDecline = async (bookingId: string) => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      await axios.post(
        `${SERVER_URI}/decline-host`,
        { bookingId },
        { headers: { access_token: accessToken } }
      );
      Alert.alert("Success", "Booking declined successfully");

      // Refresh the bookings list
      const bookingResponse = await axios.get<{ bookings: Booking[] }>(
        `${SERVER_URI}/getrequestbooking`,
        {
          headers: { access_token: accessToken },
        }
      );


      const filteredBookings = bookingResponse.data.bookings.filter(
        (booking) =>
          booking.location &&
          booking.location.city &&
          booking.location.city.toLowerCase() === hostCity.toLowerCase()
      );
      setBookings(filteredBookings);
    } catch (error: any) {
       if (error.response?.status === 400) {
         await AsyncStorage.removeItem("access_token");
         await AsyncStorage.removeItem("refresh_token"); // Clear token
         router.replace("/(routes)/login"); // Redirect to login page
       }
      console.log("Error declining booking:", error);
      Alert.alert("Error", "Failed to decline booking. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date
      .getFullYear()
      .toString()
      .slice(2)}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#20B2AA" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.safeArea}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={["#FF6B4A"]}
          tintColor="#FF6B4A"
        />
      }
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={styles.backButtonCircle}>
                <ArrowLeft size={24} color="#20B2AA" strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
            <Text style={styles.title}>Requests</Text>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollViewContent,
              bookings.length === 0 && styles.emptyStateContainer,
            ]}
          >
            {bookings.length === 0 ? (
              <Text style={styles.noBookingsText}>
                No booking requests at the moment
              </Text>
            ) : (
              bookings.map((booking) => (
                <View style={styles.profilecardcontainer}>
                  <View style={styles.profilecardbackground}></View>
                  <View key={booking._id} style={styles.requestContainer}>
                    <View style={styles.card}>
                      <View style={styles.cardContent}>
                        {booking.pets[0]?.image ? (
                          <Image
                            source={{ uri: booking.pets[0].image }}
                            style={styles.petImage}
                          />
                        ) : (
                          <View style={styles.petImage}>
                            <Text style={styles.petImagePlaceholder}>🐾</Text>
                          </View>
                        )}
                        <View style={styles.petInfo}>
                          <Text style={styles.petName}>
                            {booking.pets[0]?.name || "Pet"}{" "}
                            <Text style={styles.breedText}>
                              ({booking.pets[0]?.breed || "Unknown"})
                            </Text>
                          </Text>
                          <Text style={styles.dateRange}>
                            {formatDate(booking.startDateTime)}-
                            {formatDate(booking.endDateTime)}
                          </Text>
                          {booking.paymentStatus === "completed" && (
                            <Text style={styles.paymentComplete}>
                              Payment Completed
                            </Text>
                          )}
                        </View>
                        <TouchableOpacity
                          onPress={() => handleKnowMore(booking._id)}
                          style={styles.knowMoreButton}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Text style={styles.knowMoreText}>know more</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.actionButtonsContainer}>
                      <TouchableOpacity
                        style={styles.declineButton}
                        onPress={() => handleDecline(booking._id)}
                      >
                        <Text style={styles.declineButtonText}>DECLINE</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleAccept(booking._id)}
                      >
                        <Text style={styles.acceptButtonText}>ACCEPT</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 8,
    // paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: s(16),
    paddingVertical: vs(20),
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
  },
  backButton: {
    padding: s(4),
  },
  backButtonCircle: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: "#E8F8F7",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: s(24),
    fontWeight: "700",
    marginLeft: s(16),
    color: "#000",
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: s(16),
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: vs(300),
  },
  profilecardcontainer: {
    position: "relative",
    width: "100%",
    maxWidth: s(400),
    marginHorizontal: "auto",
    marginBottom: vs(16),
  },
  profilecardbackground: {
    position: "absolute",
    top: 0,
    right: -1,
    bottom: vs(75),
    left: s(8),
    backgroundColor: "#00D0C3",
    borderRadius: s(12),
    transform: [{ translateX: s(4) }, { translateY: s(4) }],
  },
  requestContainer: {
    marginBottom: vs(16),
  },
  card: {
    borderWidth: 1.5,
    borderColor: "#20B2AA",
    borderRadius: s(12),
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    padding: s(16),
    alignItems: "center",
  },
  petImage: {
    width: s(56),
    height: s(56),
    borderRadius: s(28),
    backgroundColor: "#E8F8F7",
    alignItems: "center",
    justifyContent: "center",
  },
  petImagePlaceholder: {
    fontSize: s(24),
  },
  petInfo: {
    flex: 1,
    marginLeft: s(12),
  },
  petName: {
    fontSize: s(16),
    fontWeight: "600",
    color: "#000",
    marginBottom: vs(4),
  },
  breedText: {
    fontWeight: "400",
    color: "#000",
  },
  dateRange: {
    fontSize: s(14),
    color: "#666",
    letterSpacing: -0.3,
  },
  paymentComplete: {
    color: "#4CAF50",
    fontSize: s(14),
    marginTop: vs(4),
    fontWeight: "500",
  },
  knowMoreButton: {
    padding: s(8),
    marginLeft: s(8),
  },
  knowMoreText: {
    color: "#20B2AA",
    fontSize: s(14),
    fontWeight: "500",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    marginTop: vs(8),
    gap: s(8),
  },
  declineButton: {
    flex: 1,
    backgroundColor: "#FF6B6B",
    paddingVertical: vs(16),
    borderRadius: s(8),
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    paddingVertical: vs(16),
    borderRadius: s(8),
    alignItems: "center",
    justifyContent: "center",
  },
  declineButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: s(14),
    letterSpacing: 0.5,
  },
  acceptButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: s(14),
    letterSpacing: 0.5,
  },
  noBookingsText: {
    fontSize: s(16),
    color: "#666",
    textAlign: "center",
  },
});
