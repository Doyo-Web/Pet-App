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
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";

interface Booking {
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
          console.error("No access token found");
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

        console.log(hostResponse.data.host.city);
        if (hostResponse.data && hostResponse.data.host.city) {
          setHostCity(hostResponse.data.host.city);
        } else {
          console.error("Host city not found in response");
          setLoading(false);
          Alert.alert("Error", "Failed to fetch host data. Please try again.");
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
            booking.location &&
            booking.location.address &&
            booking.location.address.toLowerCase() ===
              hostResponse.data.host.city.toLowerCase()
        );

        console.log("Host city:", hostResponse.data.host.city);
        console.log(
          "Fetched and filtered bookings:",
          JSON.stringify(filteredBookings, null, 2)
        );
        setBookings(filteredBookings);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
        Alert.alert("Error", "Failed to fetch booking data. Please try again.");
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
    } catch (error) {
      console.error("Error accepting booking:", error);
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
    } catch (error) {
      console.error("Error declining booking:", error);
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
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  backButton: {
    padding: 4,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F8F7",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginLeft: 16,
    color: "#000",
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },

  profilecardcontainer: {
    position: "relative",
    width: "100%",
    maxWidth: 400,
    marginHorizontal: "auto",
  },

  profilecardbackground: {
    position: "absolute",
    top: 0,
    right: -1,
    bottom: 75,
    left: 8,
    backgroundColor: "#00D0C3",
    borderRadius: 12,
    transform: [{ translateX: 4 }, { translateY: 4 }],
  },

  requestContainer: {
    marginBottom: 16,
  },

  card: {
    borderWidth: 1.5,
    borderColor: "#20B2AA",
    borderRadius: 12,
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
    padding: 16,
    alignItems: "center",
  },
  petImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E8F8F7",
    alignItems: "center",
    justifyContent: "center",
  },
  petImagePlaceholder: {
    fontSize: 24,
  },
  petInfo: {
    flex: 1,
    marginLeft: 12,
  },
  petName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  breedText: {
    fontWeight: "400",
    color: "#000",
  },
  dateRange: {
    fontSize: 14,
    color: "#666",
    letterSpacing: -0.3,
  },
  paymentComplete: {
    color: "#4CAF50",
    fontSize: 14,
    marginTop: 4,
    fontWeight: "500",
  },
  knowMoreButton: {
    padding: 8,
    marginLeft: 8,
  },
  knowMoreText: {
    color: "#20B2AA",
    fontSize: 14,
    fontWeight: "500",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },
  declineButton: {
    flex: 1,
    backgroundColor: "#FF6B6B",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  declineButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  acceptButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  noBookingsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
