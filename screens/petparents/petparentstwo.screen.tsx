import { SERVER_URI } from "@/utils/uri";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Calendar } from "react-native-calendars";

const screenWidth = Dimensions.get("window").width;

interface Pet {
  image: string;
  _id: string;
  name: string;
  profileImage?: string;
}

interface Location {
  address: string;
  type: string;
}

interface Host {
  _id: string;
  fullName: string;
  city: string;
  profileImage: string;
  rating: number;
  bio: string;
}

interface PaymentDetails {
  amount: number;
  orderId: string;
  paymentId: string;
  signature: string;
}

interface Booking {
  _id: string;
  acceptedHosts: Host[];
  createdAt: string;
  diet: string;
  endDateTime: string;
  location: Location;
  paymentDetails?: PaymentDetails;
  paymentStatus: string;
  pets: Pet[];
  selectedHost?: string;
  startDateTime: string;
  updatedAt: string;
  userId: string;
}

type MarkedDates = {
  [date: string]: {
    startingDay?: boolean;
    endingDay?: boolean;
    color?: string;
    textColor?: string;
    disabled?: boolean;
    disableTouchEvent?: boolean;
  };
};

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState<"completed" | "upcoming">(
    "completed"
  );
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

      const response = await axios.get<{
        bookings: Booking[];
        success: boolean;
      }>(`${SERVER_URI}/bookings`, {
        headers: { access_token: accessToken },
      });

      if (response.data.success) {
        setBookings(response.data.bookings);
        console.log("get bookings Data", response.data.bookings);
      } else {
        Alert.alert("Error", "Failed to fetch bookings. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      Alert.alert("Error", "Failed to fetch bookings. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderBookingItem = (item: Booking) => (
    <View key={item._id} style={styles.bookingItem}>
      <View style={styles.yellowStrip} />
      <View style={styles.bookingContent}>
        <Image
          source={{
            uri:
              item.pets[0]?.image || "https://placekitten.com/100/100",
          }}
          style={styles.petImage}
        />
        <View style={styles.bookingInfo}>
          <View style={styles.dateRow}>
            <Text style={styles.calendarIcon}>📅</Text>
            <Text style={styles.dateText}>
              {new Date(item.startDateTime).toLocaleDateString()} -{" "}
              {new Date(item.endDateTime).toLocaleDateString()}
            </Text>
          </View>
          <Text style={styles.petName}>
            {item.pets.map((pet) => pet.name).join(", ")}
          </Text>
          <Text style={styles.dietText}>Diet: {item.diet}</Text>
          <Text style={styles.locationText}>
            Location: {item.location.address} ({item.location.type})
          </Text>
          <View style={styles.bottomRow}>
            <Text style={styles.bookingType}>
              {item.selectedHost ? "Host Selected" : "Pending Host"}
            </Text>
            <Text
              style={
                item.paymentStatus === "completed"
                  ? styles.completedStatus
                  : styles.upcomingStatus
              }
            >
              {item.paymentStatus === "completed" ? "Completed" : "Pending"}
            </Text>
          </View>
          {item.paymentDetails && (
            <Text style={styles.paymentText}>
              Payment: ${item.paymentDetails.amount} (Order ID:{" "}
              {item.paymentDetails.orderId})
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsText}>View Details {">"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getMarkedDates = (): MarkedDates => {
    const markedDates: MarkedDates = {};
    bookings.forEach((booking) => {
      const startDate = new Date(booking.startDateTime)
        .toISOString()
        .split("T")[0];
      const endDate = new Date(booking.endDateTime).toISOString().split("T")[0];
      markedDates[startDate] = { startingDay: true, color: "#FFD700" };
      markedDates[endDate] = { endingDay: true, color: "#FFD700" };
    });
    return markedDates;
  };

  const renderCalendar = () => (
    <Calendar
      style={styles.calendar}
      theme={{
        backgroundColor: "#FFF8E1",
        calendarBackground: "#FFF8E1",
        textSectionTitleColor: "#666",
        selectedDayBackgroundColor: "#FFD700",
        selectedDayTextColor: "#000000",
        todayTextColor: "#FFD700",
        dayTextColor: "#2d4150",
        textDisabledColor: "#d9e1e8",
        dotColor: "#FFD700",
        selectedDotColor: "#ffffff",
        arrowColor: "#FFD700",
        monthTextColor: "#000000",
        textDayFontFamily: "monospace",
        textMonthFontFamily: "monospace",
        textDayHeaderFontFamily: "monospace",
        textDayFontWeight: "300",
        textMonthFontWeight: "bold",
        textDayHeaderFontWeight: "300",
        textDayFontSize: 16,
        textMonthFontSize: 16,
        textDayHeaderFontSize: 16,
      }}
      markedDates={getMarkedDates()}
    />
  );

  const renderCompletedBookings = () => (
    <ScrollView style={styles.sectionContent}>
      {bookings
        .filter((booking) => booking.paymentStatus === "completed")
        .map(renderBookingItem)}
    </ScrollView>
  );

  const renderUpcomingBookings = () => (
    <ScrollView style={styles.sectionContent}>
      {renderCalendar()}
      {bookings
        .filter((booking) => booking.paymentStatus === "pending")
        .map(renderBookingItem)}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <View style={styles.backButtonCircle}>
            <Text style={styles.backButtonText}>{"<"}</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.title}>My Bookings</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "completed" && styles.activeTab]}
          onPress={() => setActiveTab("completed")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "completed" && styles.activeTabText,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
          onPress={() => setActiveTab("upcoming")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "upcoming" && styles.activeTabText,
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      ) : (
        <View style={styles.content}>
          {activeTab === "completed"
            ? renderCompletedBookings()
            : renderUpcomingBookings()}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 200,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#FFD700",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  sectionContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  calendar: {
    marginBottom: 16,
  },
  bookingItem: {
    flexDirection: "row",
    marginBottom: 16,
    marginHorizontal: 16,
  },
  yellowStrip: {
    width: 4,
    backgroundColor: "#FFD700",
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  bookingContent: {
    flex: 1,
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  calendarIcon: {
    marginRight: 4,
    fontSize: 16,
  },
  dateText: {
    fontSize: 14,
    color: "#666",
  },
  petName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  dietText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  bookingType: {
    fontSize: 14,
    color: "#666",
  },
  completedStatus: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4CAF50",
  },
  upcomingStatus: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FF5252",
  },
  paymentText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  detailsButton: {
    justifyContent: "center",
  },
  detailsText: {
    color: "#666",
    fontSize: 12,
  },
});
