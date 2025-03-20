"use client";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URI } from "@/utils/uri";
import { Toast } from "react-native-toast-notifications";
import {
  fontPixel,
  pixelSizeVertical,
  pixelSizeHorizontal,
} from "../../utils/responsive";
import React from "react";
import { RectButton } from "react-native-gesture-handler";

// Define interfaces
interface Wallet {
  balance: number;
}

interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  upiid?: string;
}

export default function WithdrawScreen() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWalletAndBankDetails();
  }, []);

  const fetchWalletAndBankDetails = async () => {
    try {
      setLoading(true);
      const accessToken = await AsyncStorage.getItem("access_token");

      if (!accessToken) {
        Toast.show("Access token not found. Please log in again.", {
          type: "error",
        });
        router.replace("/(routes)/login");
        return;
      }

      // Fetch wallet balance
      const walletResponse = await axios.get(`${SERVER_URI}/wallet`, {
        headers: {
          "Content-Type": "application/json",
          access_token: accessToken,
        },
      });

      if (walletResponse.data.success) {
        setWallet(walletResponse.data.wallet);
      } else {
        Toast.show("Failed to fetch wallet data", {
          type: "error",
        });
      }

      // Fetch host profile to get bank details
      const hostResponse = await axios.get(`${SERVER_URI}/host`, {
        headers: {
          "Content-Type": "application/json",
          access_token: accessToken,
        },
      });

      console.log(hostResponse.data);

      if (hostResponse.data && hostResponse.data.host.paymentDetails) {
        setBankDetails({
          accountHolderName: hostResponse.data.host.paymentDetails.accountHolderName,
          accountNumber: hostResponse.data.host.paymentDetails.accountNumber,
          ifscCode: hostResponse.data.host.paymentDetails.ifscCode,
          bankName: hostResponse.data.host.paymentDetails.bankName,
          upiid: hostResponse.data.host.paymentDetails.upiid,
        });
      }
    } catch (error: any) {
      if (error.response?.status === 413) {
        await AsyncStorage.removeItem("access_token");
        await AsyncStorage.removeItem("refresh_token");
        router.replace("/(routes)/login");
      } else {
        console.error("Error fetching data:", error);
        Toast.show("An error occurred while fetching data", {
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      // Validate amount
      const withdrawAmount = Number.parseFloat(amount);
      if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
        Toast.show("Please enter a valid amount", {
          type: "error",
        });
        return;
      }

      // Check if amount is greater than balance
      if (wallet && withdrawAmount > wallet.balance) {
        Toast.show("Insufficient balance", {
          type: "error",
        });
        return;
      }

      // Check if bank details are available
      if (!bankDetails) {
        Toast.show("Please update your bank details first", {
          type: "error",
        });
        return;
      }

      // Confirm withdrawal
      Alert.alert(
        "Confirm Withdrawal",
        `Are you sure you want to withdraw ₹${withdrawAmount.toFixed(
          2
        )} to your bank account?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Withdraw",
            onPress: async () => {
              setSubmitting(true);
              const accessToken = await AsyncStorage.getItem("access_token");

              if (!accessToken) {
                Toast.show("Access token not found. Please log in again.", {
                  type: "error",
                });
                router.replace("/(routes)/login");
                return;
              }

              try {
                const response = await axios.post(
                  `${SERVER_URI}/wallet/withdraw`,
                  { amount: withdrawAmount },
                  {
                    headers: {
                      "Content-Type": "application/json",
                      access_token: accessToken,
                    },
                  }
                );

                console.log("withdraw Request", response.data.success);

                if (response.data.success) {
                  Toast.show("Withdrawal request submitted successfully", {
                    type: "success",
                  });
                  router.push("/(drawer)/(tabs)/wallet/withdrawals");
                } else {
                  Toast.show(
                    response.data.message || "Failed to process withdrawal",
                    {
                      type: "error",
                    }
                  );
                }
              } catch (error: any) {
                console.error("Error processing withdrawal:", error);
                Toast.show(
                  error.response?.data?.message ||
                    "Failed to process withdrawal",
                  { type: "error" }
                );
              } finally {
                setSubmitting(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error in withdrawal process:", error);
      Toast.show("An unexpected error occurred", {
        type: "error",
      });
    }
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <RectButton onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#00BFA6" />
        </RectButton>
        <Text style={styles.headerTitle}>Withdraw Money</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00BFA6" style={styles.loader} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>
              {wallet ? formatAmount(wallet.balance) : "₹0.00"}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Enter Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                maxLength={10}
              />
            </View>

            <Text style={styles.sectionTitle}>Bank Account Details</Text>
            {bankDetails ? (
              <View style={styles.bankDetailsContainer}>
                <View style={styles.bankDetailRow}>
                  <Text style={styles.bankDetailLabel}>Account Holder</Text>
                  <Text style={styles.bankDetailValue}>
                    {bankDetails.accountHolderName}
                  </Text>
                </View>
                <View style={styles.bankDetailRow}>
                  <Text style={styles.bankDetailLabel}>Account Number</Text>
                  <Text style={styles.bankDetailValue}>
                    {bankDetails.accountNumber}
                  </Text>
                </View>
                <View style={styles.bankDetailRow}>
                  <Text style={styles.bankDetailLabel}>IFSC Code</Text>
                  <Text style={styles.bankDetailValue}>
                    {bankDetails.ifscCode}
                  </Text>
                </View>
                <View style={styles.bankDetailRow}>
                  <Text style={styles.bankDetailLabel}>Bank Name</Text>
                  <Text style={styles.bankDetailValue}>
                    {bankDetails.bankName}
                  </Text>
                </View>
                {bankDetails.upiid && (
                  <View style={styles.bankDetailRow}>
                    <Text style={styles.bankDetailLabel}>UPI ID</Text>
                    <Text style={styles.bankDetailValue}>
                      {bankDetails.upiid}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.noBankDetailsContainer}>
                <MaterialIcons name="account-balance" size={48} color="#ccc" />
                <Text style={styles.noBankDetailsText}>
                  No bank details found. Please update your payment details.
                </Text>
                <TouchableOpacity
                  style={styles.updateButton}
                >
                  <Text style={styles.updateButtonText}>
                    Update Payment Details
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.noteContainer}>
              <MaterialIcons name="info-outline" size={20} color="#666" />
              <Text style={styles.noteText}>
                Withdrawal requests are processed within 2-3 business days.
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.withdrawButton,
                (!wallet ||
                  wallet.balance <= 0 ||
                  !amount ||
                  !bankDetails ||
                  submitting) &&
                  styles.disabledButton,
              ]}
              onPress={handleWithdraw}
              disabled={
                !wallet ||
                wallet.balance <= 0 ||
                !amount ||
                !bankDetails ||
                submitting
              }
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.withdrawButtonText}>Withdraw Money</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: pixelSizeHorizontal(16),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: fontPixel(18),
    fontWeight: "600",
    color: "#333",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: pixelSizeHorizontal(16),
  },
  balanceCard: {
    backgroundColor: "#E6FFFC",
    borderRadius: 12,
    padding: pixelSizeHorizontal(16),
    marginBottom: pixelSizeVertical(24),
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: fontPixel(14),
    color: "#666",
    marginBottom: pixelSizeVertical(8),
  },
  balanceAmount: {
    fontSize: fontPixel(24),
    fontWeight: "bold",
    color: "#333",
  },
  formContainer: {
    marginBottom: pixelSizeVertical(24),
  },
  sectionTitle: {
    fontSize: fontPixel(16),
    fontWeight: "600",
    color: "#333",
    marginBottom: pixelSizeVertical(12),
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: pixelSizeVertical(24),
    paddingHorizontal: pixelSizeHorizontal(12),
  },
  currencySymbol: {
    fontSize: fontPixel(20),
    color: "#333",
    marginRight: pixelSizeHorizontal(8),
  },
  amountInput: {
    flex: 1,
    fontSize: fontPixel(20),
    paddingVertical: pixelSizeVertical(12),
  },
  bankDetailsContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: pixelSizeHorizontal(16),
    marginBottom: pixelSizeVertical(24),
  },
  bankDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: pixelSizeVertical(12),
  },
  bankDetailLabel: {
    fontSize: fontPixel(14),
    color: "#666",
  },
  bankDetailValue: {
    fontSize: fontPixel(14),
    fontWeight: "500",
    color: "#333",
  },
  noBankDetailsContainer: {
    alignItems: "center",
    padding: pixelSizeHorizontal(24),
    marginBottom: pixelSizeVertical(24),
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },
  noBankDetailsText: {
    fontSize: fontPixel(14),
    color: "#666",
    textAlign: "center",
    marginTop: pixelSizeVertical(16),
    marginBottom: pixelSizeVertical(16),
  },
  updateButton: {
    backgroundColor: "#00BFA6",
    paddingVertical: pixelSizeVertical(10),
    paddingHorizontal: pixelSizeHorizontal(16),
    borderRadius: 8,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: fontPixel(14),
    fontWeight: "600",
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: pixelSizeHorizontal(12),
    borderRadius: 8,
    marginBottom: pixelSizeVertical(24),
  },
  noteText: {
    fontSize: fontPixel(12),
    color: "#666",
    marginLeft: pixelSizeHorizontal(8),
    flex: 1,
  },
  withdrawButton: {
    backgroundColor: "#00BFA6",
    paddingVertical: pixelSizeVertical(16),
    borderRadius: 8,
    alignItems: "center",
  },
  withdrawButtonText: {
    color: "#fff",
    fontSize: fontPixel(16),
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
});
