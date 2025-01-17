import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialIcons";
import { router } from "expo-router";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface Host {
  _id: string;
  fullName: string;
  profileImage: string;
  city: string;
}

interface Booking {
  _id: string;
  acceptedHosts: Host[];
  createdAt: string;
  diet: string;
  endDateTime: string;
  location: {
    address: string;
    type: string;
  };
  paymentStatus: string;
  pets: Array<{
    id: string;
    name: string;
    image: string;
  }>;
  startDateTime: string;
  updatedAt: string;
  userId: string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function BookingScreenTwo() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentHostIndex, setCurrentHostIndex] = useState(0);
  const [previousHostCount, setPreviousHostCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  const bookingData = useSelector(
    (state: RootState) => state.booking.bookingData
  );

  const fetchBooking = useCallback(async () => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) {
        console.error("No access token found");
        setLoading(false);
        return;
      }

      const response = await axios.post<{ booking: Booking; success: boolean }>(
        `${SERVER_URI}/get-booking-by-id`,
        {
          bookingId: bookingData?._id,
        },
        {
          headers: { access_token: accessToken },
        }
      );

      if (response.data && response.data.success && response.data.booking) {
        const newBooking = response.data.booking;
        setBooking(newBooking);

        const newHostCount = newBooking.acceptedHosts.length;
        if (newHostCount > previousHostCount) {
          setPreviousHostCount(newHostCount);
          setTimeout(fetchBooking, 1000);
        }
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
    } finally {
      setLoading(false);
    }
  }, [bookingData?._id, previousHostCount]);

  useEffect(() => {
    fetchBooking();
    const interval = setInterval(fetchBooking, 10000);
    return () => clearInterval(interval);
  }, [fetchBooking]);

  const nextHost = () => {
    if (booking && booking.acceptedHosts.length > 0) {
      const newIndex = (currentHostIndex + 1) % booking.acceptedHosts.length;
      setCurrentHostIndex(newIndex);
      if (newIndex === 0) {
        router.push("/booknow/booknowthree");
      }
    }
  };

  const prevHost = () => {
    if (booking && booking.acceptedHosts.length > 0) {
      setCurrentHostIndex((prev) =>
        prev === 0 ? booking.acceptedHosts.length - 1 : prev - 1
      );
    }
  };

  const handleViewMore = () => {
    const currentHost = booking?.acceptedHosts[currentHostIndex];
    if (currentHost) {
      console.log("View more for host:", currentHost._id);
    }
  };

  const handleBottomArrowClick = () => {
    if (booking && booking.acceptedHosts.length > 1) {
      nextHost();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </SafeAreaView>
    );
  }

  const currentHost = booking?.acceptedHosts[currentHostIndex];

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBooking();
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={["#FF6B4A"]}
          tintColor="#FF6B4A"
        />
      }
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.boardingboxtwo}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/(drawer)/(tabs)/booknow")}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerboardingbox}>Boarding</Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.profilecardcontainer}>
            <View style={styles.profilecardbackground}></View>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.footprintIcon}>
                  <Ionicons name="paw" size={24} color="white" />
                </View>
                <Text style={styles.cardTitle}>
                  Booking Confirmation Process
                </Text>
              </View>
              <Text style={styles.stepText}>
                <Text style={styles.boldText}>Step 1:</Text>
                {"\n"}
                Your request will be acknowledged by our hosts within 12 hours.
                You will receive a notification in your notification bar and an
                email update regarding the status.
              </Text>
              <Text style={styles.stepText}>
                <Text style={styles.boldText}>Step 2:</Text>
                {"\n"}
                Once the hosts accept your request, you can select your
                preferred host from the accepted hosts to proceed with the
                booking.
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Matched Pawfect Hosts</Text>

          {booking && booking.acceptedHosts.length > 0 ? (
            <>
              <View style={styles.hostCard}>
                <Image
                  source={{ uri: currentHost?.profileImage }}
                  style={styles.hostImage}
                />
                <View style={styles.ratingContainer}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons key={i} name="star" size={20} color="#FFD700" />
                  ))}
                </View>
                <View style={styles.hostInfo}>
                  <View style={styles.hostNameLocationContainer}>
                    <View>
                      <Text style={styles.hostName}>
                        {currentHost?.fullName}
                      </Text>
                      <View style={styles.locationContainer}>
                        <Ionicons name="location" size={16} color="#666" />
                        <Text style={styles.locationText}>
                          {currentHost?.city}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.viewMoreButton}
                      onPress={handleViewMore}
                    >
                      <Text style={styles.viewMoreText}>View More</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.navigationButtons}>
                <TouchableOpacity onPress={prevHost} style={styles.navButton}>
                  <AntDesign name="left" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity onPress={nextHost} style={styles.navButton}>
                  <AntDesign name="right" size={24} color="#666" />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={styles.noHostsText}>
              No matched hosts available yet.
            </Text>
          )}
        </ScrollView>
        <TouchableOpacity
          style={styles.bottomArrowContainer}
          onPress={handleBottomArrowClick}
        >
          <AntDesign name="down" size={24} color="#F96247" />
        </TouchableOpacity>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5EB",
    paddingBottom: 100,
  },
  boardingboxtwo: {
    backgroundColor: "#F96247",
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  headerboardingbox: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  backButton: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    minHeight: SCREEN_HEIGHT - 60,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 60,
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
    right: -5,
    bottom: 18,
    left: 15,
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    transform: [{ translateX: 4 }, { translateY: 4 }],
  },

  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  footprintIcon: {
    backgroundColor: "#FF6B6B",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  stepText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666",
    marginBottom: 12,
  },
  boldText: {
    fontWeight: "bold",
    color: "#333",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#333",
  },
  hostCard: {
    backgroundColor: "#FFECD1",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  hostImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  ratingContainer: {
    position: "absolute",
    top: 24,
    right: 24,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 4,
    borderRadius: 12,
  },
  hostInfo: {
    marginTop: 8,
  },
  hostNameLocationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hostName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    marginLeft: 4,
    color: "#666",
    fontSize: 14,
  },
  viewMoreButton: {
    backgroundColor: "#FFD700",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  viewMoreText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
    marginTop: 16,
    marginBottom: 24,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#666",
    alignItems: "center",
    justifyContent: "center",
  },
  noHostsText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 32,
  },
  bottomArrowContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    padding: 10,
  },
});
