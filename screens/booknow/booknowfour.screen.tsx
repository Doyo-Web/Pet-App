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
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URI } from "../../utils/uri";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

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
  paymentStatus: string;
}

export default function BillingScreen() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const router = useRouter();

  const bookingData = useSelector(
    (state: RootState) => state.booking.bookingData
  );

  useEffect(() => {
    fetchBookingData();
  }, []);

  const fetchBookingData = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) {
        throw new Error("No access token found");
      }

      const response = await axios.post<{ bookings: Booking[] }>(
        `${SERVER_URI}/get-billing`,
        {
          bookingId: bookingData?._id,
        },
        {
          headers: { access_token: accessToken },
        }
      );

      if (response.data.bookings) {
        setBooking(response.data.bookings);
      } else {
        throw new Error("No bookings found");
      }
    } catch (error) {
      console.log("Error fetching booking data:", error);
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
    setPaymentLoading(true);
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) {
        throw new Error("No access token found");
      }

      // Simulate payment process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate successful payment
      const mockPaymentData = {
        razorpay_payment_id: `pay_${Math.random().toString(36).substr(2, 9)}`,
        razorpay_order_id: `order_${Math.random().toString(36).substr(2, 9)}`,
        razorpay_signature: `${Math.random().toString(36).substr(2, 32)}`,
      };

      await savePaymentDetails(mockPaymentData);

      // Navigate to chat screen after successful payment
      // router.push({
      //   pathname: "/chat",
      //   params: { bookingId: booking?._id },
      // });
    } catch (error: any) {
      console.log("Error processing payment:", error.message);
      Alert.alert("Error", "Failed to process payment. Please try again.");
    } finally {
      setPaymentLoading(false);
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

      // Update the local booking state to reflect the completed payment
      setBooking((prevBooking) => {
        if (prevBooking) {
          return { ...prevBooking, paymentStatus: "completed" };
        }
        return prevBooking;
      });

      Alert.alert("Success", "Payment completed successfully!");
    } catch (error) {
      console.log("Error saving payment details:", error);
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

        {booking.paymentStatus !== "completed" ? (
          <TouchableOpacity
            style={[
              styles.paymentButton,
              paymentLoading && styles.disabledButton,
            ]}
            onPress={handlePayment}
            disabled={paymentLoading}
          >
            {paymentLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.paymentButtonText}>Make Payment</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() =>
              router.push({
                pathname: "/chat",
                params: { bookingId: booking._id },
              })
            }
          >
            <Text style={styles.chatButtonText}>Open Chat</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? 25 : 0,
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
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
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
  chatButton: {
    backgroundColor: "#4CAF50",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  chatButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
