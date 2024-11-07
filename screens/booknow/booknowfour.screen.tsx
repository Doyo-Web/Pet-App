import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";

interface BillingItem {
  label: string;
  value: string;
}

const billingItems: BillingItem[] = [
  { label: "Boarding per night", value: "Rs.700/night" },
  { label: "Home cooked food per day", value: "Rs.200/day" },
  { label: "No. of days", value: "4 Days" },
  { label: "Total", value: "Rs.3600" },
  { label: "GST (18%)", value: "Rs.648" },
];

export default function BookingScreenFour() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        onPress={() => {
          router.push("/(drawer)/(tabs)/booknow/booknowthree");
        }}
      >
        <View style={styles.boardingboxtwo}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              router.push("/(drawer)/(tabs)/booknow/booknowthree");
            }}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerboardingbox}>Boarding</Text>
        </View>
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Billing Information</Text>

      {/* Billing Details Card */}
      <View style={styles.card}>
        {billingItems.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Grand Total */}
      <View style={styles.grandTotalContainer}>
        <Text style={styles.grandTotalLabel}>Grand Total</Text>
        <Text style={styles.grandTotalValue}>Rs.4248</Text>
      </View>

      {/* Make Payment Button */}
      <TouchableOpacity style={styles.paymentButton}>
        <Text style={styles.paymentButtonText}>Make Payment</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B4A",
    padding: 16,
    borderRadius: 8,
    margin: 16,
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

  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
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
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  paymentButton: {
    backgroundColor: "#FF6B4A",
    marginTop: 60,
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
});
