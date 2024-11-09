import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URI } from "../../utils/uri";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";

interface Booking {
  _id: string;
  selectedHost: {
    fullName: string;
    hostProfile: {
      pricingBoarding: string;
      pricingVegMeal: string;
      pricingNonVegMeal: string;
    };
  };
  startDateTime: string;
  endDateTime: string;
  diet: string;
}

export default function BillingScreen() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchBookingData();
  }, []);

  const fetchBookingData = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) {
        throw new Error("No access token found");
      }

      const response = await axios.get<{ bookings: Booking[] }>(
        `${SERVER_URI}/get-billing`,
        {
          headers: { access_token: accessToken },
        }
      );

      if (response.data.bookings && response.data.bookings.length > 0) {
        setBooking(response.data.bookings[0]);
      } else {
        throw new Error("No bookings found");
      }
    } catch (error) {
      console.error("Error fetching booking data:", error);
      Alert.alert(
        "Error",
        "Failed to load billing information. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = (
    days: number,
    boardingPrice: number,
    mealPrice: number
  ) => {
    return (boardingPrice + mealPrice) * days;
  };

  const calculateGST = (total: number) => {
    return total * 0.18;
  };

  const handlePayment = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) {
        throw new Error("No access token found");
      }

      console.log("Creating Razorpay order...");
      const orderResponse = await axios.post(
        `${SERVER_URI}/create-razorpay-order`,
        { amount: Math.round(grandTotal * 100) },
        { headers: { access_token: accessToken } }
      );

      const { id: orderId } = orderResponse.data;
      console.log("Order created:", orderId);

      // Create the checkout URL
      const checkoutUrl = `https://checkout.razorpay.com/v1/checkout.html?key=rzp_test_47UXyR0Uds1kIX&order_id=${orderId}&amount=${Math.round(
        grandTotal * 100
      )}&currency=INR&name=Pet%20Boarding&description=Pet%20Boarding%20Payment&prefill[email]=porwalsachin2510@gmail.com&prefill[contact]=9575415347&prefill[name]=Sachin%20Porwal&theme[color]=%23F96247`;

      // Open payment in browser
      const result = await WebBrowser.openAuthSessionAsync(
        checkoutUrl,
        "petboarding://payment-callback"
      );

      if (result.type === "success") {
        // Parse the URL parameters
        const urlParams = new URLSearchParams(new URL(result.url).search);
        const paymentId = urlParams.get("razorpay_payment_id");
        const signature = urlParams.get("razorpay_signature");

        if (paymentId && signature) {
          await savePaymentDetails({
            razorpay_payment_id: paymentId,
            razorpay_order_id: orderId,
            razorpay_signature: signature,
          });
        } else {
          Alert.alert("Error", "Payment verification failed");
        }
      } else {
        Alert.alert("Notice", "Payment was cancelled");
      }
    } catch (error: any) {
      console.error(
        "Error initiating payment:",
        error.response?.data || error.message
      );
      Alert.alert("Error", "Failed to initiate payment. Please try again.");
    }
  };

  const savePaymentDetails = async (paymentData: any) => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) {
        throw new Error("No access token found");
      }

      await axios.post(
        `${SERVER_URI}/save-payment`,
        {
          bookingId: booking?._id,
          paymentId: paymentData.razorpay_payment_id,
          orderId: paymentData.razorpay_order_id,
          signature: paymentData.razorpay_signature,
          amount: grandTotal,
        },
        { headers: { access_token: accessToken } }
      );

      Alert.alert("Success", "Payment completed successfully!", [
        {
          text: "OK",
          onPress: () => router.push("/(drawer)/(tabs)/booknow/booknowsuccess"),
        },
      ]);
    } catch (error) {
      console.error("Error saving payment details:", error);
      Alert.alert(
        "Error",
        "Failed to save payment details. Please contact support."
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>
          Failed to load billing information.
        </Text>
      </SafeAreaView>
    );
  }

  const days = calculateDays(booking.startDateTime, booking.endDateTime);
  const boardingPrice = parseFloat(
    booking.selectedHost.hostProfile.pricingBoarding || "0"
  );
  const mealPrice =
    booking.diet === "veg"
      ? parseFloat(booking.selectedHost.hostProfile.pricingVegMeal || "0")
      : parseFloat(booking.selectedHost.hostProfile.pricingNonVegMeal || "0");

  const total = calculateTotal(days, boardingPrice, mealPrice);
  const gst = calculateGST(total);
  const grandTotal = total + gst;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Boarding</Text>
        </View>

        <Text style={styles.title}>Billing Information</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Boarding per night</Text>
            <Text style={styles.value}>
              Rs.{boardingPrice.toFixed(2)}/night
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Home cooked food per day</Text>
            <Text style={styles.value}>Rs.{mealPrice.toFixed(2)}/day</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>No. of days</Text>
            <Text style={styles.value}>{days} Days</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total</Text>
            <Text style={styles.value}>Rs.{total.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>GST (18%)</Text>
            <Text style={styles.value}>Rs.{gst.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.grandTotalContainer}>
          <Text style={styles.grandTotalLabel}>Grand Total</Text>
          <Text style={styles.grandTotalValue}>Rs.{grandTotal.toFixed(2)}</Text>
        </View>

        <TouchableOpacity style={styles.paymentButton} onPress={handlePayment}>
          <Text style={styles.paymentButtonText}>Make Payment</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
  },
  header: {
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
    position: "absolute",
    left: 10,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 50,
  },
  headerTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  title: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    marginHorizontal: 16,
    marginBottom: 20,
    marginTop: 20,
  },
  card: {
    backgroundColor: "#FFE5E0",
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  grandTotalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FF6B4A",
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  paymentButton: {
    backgroundColor: "#FF6B4A",
    // marginTop: 60,
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  paymentButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    textAlign: "center",
    color: "red",
    fontSize: 16,
    marginTop: 20,
  },
});
