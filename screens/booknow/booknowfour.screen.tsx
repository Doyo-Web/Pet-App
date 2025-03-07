"use client";

import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  Modal,
  BackHandler,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URI } from "../../utils/uri";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import WebView from "react-native-webview";
import React from "react";

const { width } = Dimensions.get("window");

// Responsive sizing function
const normalize = (size: number, factor = 0.25) => {
  return size + (width / 400 - 1) * size * factor;
};

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

interface PaymentResponse {
  success: boolean;
  orderId: string;
  paymentLink: string;
}

export default function BillingScreen() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [showWebView, setShowWebView] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentCheckInterval, setPaymentCheckInterval] =
    useState<NodeJS.Timeout | null>(null);
  const webViewRef = useRef<WebView>(null);

  const router = useRouter();

  const bookingData = useSelector(
    (state: RootState) => state.booking.bookingData
  );

  useEffect(() => {
    fetchBookingData();

    // Handle back button press on Android
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (showWebView) {
          handleCloseWebView();
          return true;
        }
        return false;
      }
    );

    // Cleanup function
    return () => {
      if (paymentCheckInterval) {
        clearInterval(paymentCheckInterval);
      }
      backHandler.remove();
    };
  }, [showWebView, paymentCheckInterval]);

  // Check payment status periodically after initiating payment
  useEffect(() => {
    if (paymentCheckInterval) {
      clearInterval(paymentCheckInterval);
      setPaymentCheckInterval(null);
    }

    if (orderId && showWebView) {
      const interval = setInterval(() => {
        checkPaymentStatus(orderId);
      }, 5000); // Check every 5 seconds

      setPaymentCheckInterval(interval);
    }

    return () => {
      if (paymentCheckInterval) {
        clearInterval(paymentCheckInterval);
      }
    };
  }, [orderId, showWebView]);

  const fetchBookingData = async () => {
    try {
      setLoading(true);
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

      console.log("Booking data response:", response.data);

      if (response.data.bookings) {
        setBooking(response.data.bookings);
      } else {
        throw new Error("No bookings found");
      }
    } catch (error: any) {
      console.log("Error fetching booking data:", error);

      if (error.response?.status === 400 || error.response?.status === 401) {
        await AsyncStorage.removeItem("access_token");
        await AsyncStorage.removeItem("refresh_token"); // Clear token
        router.replace("/(routes)/login"); // Redirect to login page
      } else {
        Alert.alert(
          "Error",
          "Failed to load billing information. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!booking) return;

    try {
      setPaymentLoading(true);
      const accessToken = await AsyncStorage.getItem("access_token");

      if (!accessToken) {
        throw new Error("No access token found");
      }

      console.log("Creating payment order...");

      const response = await axios.post<PaymentResponse>(
        `${SERVER_URI}/create-order`,
        {
          bookingId: booking._id,
          amount: grandTotal.toFixed(2),
          currency: "INR",
          customerName: booking.selectedHost.fullName,
          customerPhone: "9999999999", // You might want to get this from user data
          customerEmail: "customer@example.com", // You might want to get this from user data
        },
        {
          headers: {
            access_token: accessToken,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Payment order response:", response.data);

      if (response.data.success && response.data.paymentLink) {
        setPaymentUrl(response.data.paymentLink);
        setOrderId(response.data.orderId);
        setShowWebView(true);
      } else {
        throw new Error(
          "Invalid payment response: " + JSON.stringify(response.data)
        );
      }
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      let errorMessage = "Failed to initiate payment. Please try again.";

      if (error.response) {
        console.error("Error response data:", error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }

      Alert.alert("Payment Error", errorMessage);
    } finally {
      setPaymentLoading(false);
    }
  };

  const checkPaymentStatus = async (orderId: string) => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) return;

      console.log("Checking payment status for order:", orderId);

      const response = await axios.get(`${SERVER_URI}/status/${orderId}`, {
        headers: { access_token: accessToken },
      });

      console.log("Payment status check:", response.data);

      if (response.data.success && response.data.status === "PAID") {
        handlePaymentSuccess();
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
    }
  };

  const handlePaymentSuccess = () => {
    // Clear any existing interval
    if (paymentCheckInterval) {
      clearInterval(paymentCheckInterval);
      setPaymentCheckInterval(null);
    }

    // Close the WebView if it's open
    setShowWebView(false);

    // Update payment status
    setPaymentSuccess(true);

    // Navigate to the booknowsuccess screen
    if (booking) {
      router.push("/(drawer)/(tabs)/booknow/booknowsuccess");
    }
  };

  const handleCloseWebView = () => {
    if (paymentCheckInterval) {
      clearInterval(paymentCheckInterval);
      setPaymentCheckInterval(null);
    }
    setShowWebView(false);
  };

  const handleWebViewNavigationStateChange = (navState: any) => {
    // Check if the URL contains success or failure indicators
    const url = navState.url;
    console.log("WebView navigated to:", url);

    // Check for various success indicators in the URL
    if (
      url.includes("payment_success=true") ||
      url.includes("order_status=PAID") ||
      url.includes("status=SUCCESS") ||
      url.includes("link_status=PAID") ||
      url.includes("payment_status=SUCCESS") ||
      url.includes("txStatus=SUCCESS")
    ) {
      handlePaymentSuccess();
    }
    // Check for various failure indicators in the URL
    else if (
      url.includes("payment_failure=true") ||
      url.includes("order_status=FAILED") ||
      url.includes("status=FAILURE") ||
      url.includes("link_status=EXPIRED") ||
      url.includes("payment_status=FAILED") ||
      url.includes("txStatus=FAILED")
    ) {
      if (paymentCheckInterval) {
        clearInterval(paymentCheckInterval);
        setPaymentCheckInterval(null);
      }

      setShowWebView(false);
      Alert.alert(
        "Payment Failed",
        "Your payment was not successful. Please try again."
      );
    }
  };

  // Add JavaScript to inject into WebView to detect payment completion
  const injectedJavaScript = `
    (function() {
      // Function to check if payment is complete
      function checkPaymentCompletion() {
        // Look for success elements or text on the page
        const successElements = [
          document.querySelector('.payment-success'),
          document.querySelector('.success-message'),
          document.querySelector('.transaction-success'),
          document.getElementById('success-message'),
          document.querySelector('[data-status="success"]'),
          document.querySelector('.payment-status-success')
        ];
        
        // Check if any success elements exist
        const hasSuccessElement = successElements.some(el => el !== null);
        
        // Check for success text in the page
        const pageText = document.body.innerText.toLowerCase();
        const hasSuccessText = 
          pageText.includes('payment successful') || 
          pageText.includes('payment completed') || 
          pageText.includes('transaction successful') ||
          pageText.includes('payment success') ||
          pageText.includes('order confirmed');
        
        if (hasSuccessElement || hasSuccessText) {
          window.ReactNativeWebView.postMessage(JSON.stringify({type: 'paymentSuccess'}));
        }
        
        // Look for failure elements or text
        const failureElements = [
          document.querySelector('.payment-failure'),
          document.querySelector('.error-message'),
          document.querySelector('.transaction-failed'),
          document.getElementById('error-message'),
          document.querySelector('[data-status="failed"]'),
          document.querySelector('.payment-status-failed')
        ];
        
        // Check if any failure elements exist
        const hasFailureElement = failureElements.some(el => el !== null);
        
        // Check for failure text in the page
        const hasFailureText = 
          pageText.includes('payment failed') || 
          pageText.includes('transaction failed') || 
          pageText.includes('payment cancelled') ||
          pageText.includes('payment declined') ||
          pageText.includes('payment error');
        
        if (hasFailureElement || hasFailureText) {
          window.ReactNativeWebView.postMessage(JSON.stringify({type: 'paymentFailure'}));
        }
      }
      
      // Run the check when page loads
      checkPaymentCompletion();
      
      // Also run the check periodically
      setInterval(checkPaymentCompletion, 1000);
      
      // And run it when DOM changes
      const observer = new MutationObserver(checkPaymentCompletion);
      observer.observe(document.body, { childList: true, subtree: true });
    })();
  `;

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log("Message from WebView:", data);

      if (data.type === "paymentSuccess") {
        handlePaymentSuccess();
      } else if (data.type === "paymentFailure") {
        if (paymentCheckInterval) {
          clearInterval(paymentCheckInterval);
          setPaymentCheckInterval(null);
        }
        setShowWebView(false);
        Alert.alert(
          "Payment Failed",
          "Your payment was not successful. Please try again."
        );
      }
    } catch (error) {
      console.error("Error parsing WebView message:", error);
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
  const boardingPrice = Number.parseFloat(
    booking.selectedHost.hostProfile.pricingBoarding || "0"
  );
  const mealPrice =
    booking.diet === "veg"
      ? Number.parseFloat(
          booking.selectedHost.hostProfile.pricingVegMeal || "0"
        )
      : Number.parseFloat(
          booking.selectedHost.hostProfile.pricingNonVegMeal || "0"
        );

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
              <Text style={styles.paymentButtonText}>Pay with Cashfree</Text>
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

      {/* Payment WebView Modal */}
      <Modal
        visible={showWebView}
        onRequestClose={handleCloseWebView}
        animationType="slide"
      >
        <SafeAreaView style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseWebView}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.webViewTitle}>Complete Payment</Text>
          </View>

          {paymentUrl && (
            <WebView
              ref={webViewRef}
              source={{ uri: paymentUrl }}
              onNavigationStateChange={handleWebViewNavigationStateChange}
              startInLoadingState={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              thirdPartyCookiesEnabled={true}
              injectedJavaScript={injectedJavaScript}
              onMessage={handleWebViewMessage}
              renderLoading={() => (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color="#FF6B4A" />
                </View>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: normalize(20),
  },
  header: {
    backgroundColor: "#F96247",
    borderRadius: normalize(6),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: normalize(10),
    height: normalize(70),
    marginHorizontal: normalize(16),
    marginTop: Platform.OS === "android" ? normalize(25) : 0,
  },
  backButton: {
    position: "absolute",
    left: normalize(10),
    width: normalize(36),
    height: normalize(36),
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: normalize(50),
  },
  headerTitle: {
    fontSize: normalize(18),
    color: "#fff",
    fontWeight: "bold",
  },
  title: {
    textAlign: "center",
    fontSize: normalize(24),
    fontWeight: "600",
    marginHorizontal: normalize(16),
    marginBottom: normalize(20),
    marginTop: normalize(20),
  },
  card: {
    backgroundColor: "#FFE5E0",
    margin: normalize(16),
    padding: normalize(16),
    borderRadius: normalize(12),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: normalize(16),
  },
  label: {
    fontSize: normalize(16),
    color: "#333",
  },
  value: {
    fontSize: normalize(16),
    fontWeight: "500",
    color: "#333",
  },
  grandTotalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FF6B4A",
    margin: normalize(16),
    padding: normalize(16),
    borderRadius: normalize(12),
  },
  grandTotalLabel: {
    fontSize: normalize(18),
    fontWeight: "600",
    color: "#fff",
  },
  grandTotalValue: {
    fontSize: normalize(18),
    fontWeight: "600",
    color: "#fff",
  },
  paymentButton: {
    backgroundColor: "#FF6B4A",
    margin: normalize(16),
    padding: normalize(16),
    borderRadius: normalize(8),
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  paymentButtonText: {
    color: "#fff",
    fontSize: normalize(16),
    fontWeight: "600",
  },
  errorText: {
    textAlign: "center",
    color: "red",
    fontSize: normalize(16),
    marginTop: normalize(20),
  },
  chatButton: {
    backgroundColor: "#4CAF50",
    margin: normalize(16),
    padding: normalize(16),
    borderRadius: normalize(8),
    alignItems: "center",
  },
  chatButtonText: {
    color: "#fff",
    fontSize: normalize(16),
    fontWeight: "600",
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  webViewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  closeButton: {
    position: "absolute",
    left: normalize(16),
  },
  webViewTitle: {
    fontSize: normalize(18),
    fontWeight: "600",
  },
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});
