"use client";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URI } from "@/utils/uri";
import { Toast } from "react-native-toast-notifications";
import {
  widthPixel,
  heightPixel,
  fontPixel,
  pixelSizeVertical,
  pixelSizeHorizontal,
} from "../../utils/responsive";
import React from "react";
import { RectButton } from "react-native-gesture-handler";

// Define interfaces
interface Transaction {
  _id: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  status: "PENDING" | "COMPLETED" | "FAILED";
  source: string;
  description: string;
  createdAt: string;
  platformFee?: number;
  gstAmount?: number;
  netAmount?: number;
}

interface Wallet {
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  recentTransactions: Transaction[];
}

export default function WalletScreen() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
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

      const response = await axios.get(`${SERVER_URI}/wallet`, {
        headers: {
          "Content-Type": "application/json",
          access_token: accessToken,
        },
      });

      if (response.data.success) {
        setWallet(response.data.wallet);
      } else {
        Toast.show("Failed to fetch wallet data", {
          type: "error",
        });
      }
    } catch (error: any) {
      if (error.response?.status === 413) {
        await AsyncStorage.removeItem("access_token");
        await AsyncStorage.removeItem("refresh_token");
        router.replace("/(routes)/login");
      } else {
        console.error("Error fetching wallet data:", error);
        Toast.show("An error occurred while fetching wallet data", {
          type: "error",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchWalletData();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const isCredit = item.type === "CREDIT";

    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionIconContainer}>
          <View
            style={[
              styles.transactionIcon,
              isCredit ? styles.creditIcon : styles.debitIcon,
            ]}
          >
            {isCredit ? (
              <MaterialIcons name="add" size={20} color="#fff" />
            ) : (
              <MaterialIcons name="remove" size={20} color="#fff" />
            )}
          </View>
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionDescription} numberOfLines={1}>
            {item.description}
          </Text>
          <Text style={styles.transactionDate}>
            {formatDate(item.createdAt)}
          </Text>
          {isCredit && item.netAmount && (
            <Text style={styles.transactionFees}>
              Platform fee: {formatAmount(item.platformFee || 0)} | GST:{" "}
              {formatAmount(item.gstAmount || 0)}
            </Text>
          )}
        </View>
        <View style={styles.transactionAmount}>
          <Text
            style={[
              styles.amountText,
              isCredit ? styles.creditText : styles.debitText,
            ]}
          >
            {isCredit ? "+" : "-"}
            {formatAmount(
              isCredit ? item.netAmount || item.amount : item.amount
            )}
          </Text>
          <Text style={styles.statusText}>
            {item.status === "COMPLETED"
              ? "Completed"
              : item.status === "PENDING"
              ? "Pending"
              : "Failed"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <RectButton onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#00BFA6" />
        </RectButton>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#00BFA6" style={styles.loader} />
      ) : wallet ? (
        <FlatList
          data={wallet.recentTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={
            <>
              <View style={styles.balanceCard}>
                <View style={styles.balanceCardBackground}></View>
                <View style={styles.balanceCardContent}>
                  <Text style={styles.balanceLabel}>Available Balance</Text>
                  <Text style={styles.balanceAmount}>
                    ₹{wallet.balance.toFixed(2)}
                  </Text>
                  <TouchableOpacity
                    style={styles.withdrawButton}
                    onPress={() => router.push("/(drawer)/(tabs)/wallet/withdraw")}
                  >
                    <Text style={styles.withdrawButtonText}>Withdraw</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <View style={styles.statIconContainer}>
                    <FontAwesome5
                      name="money-bill-wave"
                      size={16}
                      color="#00BFA6"
                    />
                  </View>
                  <Text style={styles.statLabel}>Total Earned</Text>
                  <Text style={styles.statValue}>
                    ₹{wallet.totalEarned.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.statCard}>
                  <View style={styles.statIconContainer}>
                    <FontAwesome5
                      name="hand-holding-usd"
                      size={16}
                      color="#00BFA6"
                    />
                  </View>
                  <Text style={styles.statLabel}>Total Withdrawn</Text>
                  <Text style={styles.statValue}>
                    ₹{wallet.totalWithdrawn.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={styles.transactionsHeader}>
                <Text style={styles.transactionsTitle}>
                  Recent Transactions
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(drawer)/(tabs)/wallet/transactions")}
                >
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="history" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={
            wallet.recentTransactions.length === 0
              ? { flexGrow: 1 }
              : styles.transactionsList
          }
        />
      ) : (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#FF4D4F" />
          <Text style={styles.errorText}>
            Failed to load wallet data. Please try again.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchWalletData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
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
  balanceCard: {
    position: "relative",
    margin: pixelSizeHorizontal(16),
    height: heightPixel(180),
  },
  balanceCardBackground: {
    position: "absolute",
    top: heightPixel(8),
    right: widthPixel(8),
    bottom: heightPixel(8),
    left: widthPixel(8),
    backgroundColor: "#00D0C3",
    borderRadius: 16,
  },
  balanceCardContent: {
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#00BFA6",
    padding: pixelSizeHorizontal(24),
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: fontPixel(16),
    color: "#666",
    marginBottom: pixelSizeVertical(8),
  },
  balanceAmount: {
    fontSize: fontPixel(32),
    fontWeight: "bold",
    color: "#333",
    marginBottom: pixelSizeVertical(16),
  },
  withdrawButton: {
    backgroundColor: "#00BFA6",
    paddingVertical: pixelSizeVertical(10),
    paddingHorizontal: pixelSizeHorizontal(24),
    borderRadius: 8,
  },
  withdrawButtonText: {
    color: "#fff",
    fontSize: fontPixel(16),
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: pixelSizeHorizontal(16),
    marginBottom: pixelSizeVertical(24),
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: pixelSizeHorizontal(16),
    marginHorizontal: pixelSizeHorizontal(4),
    alignItems: "center",
  },
  statIconContainer: {
    width: widthPixel(40),
    height: heightPixel(40),
    borderRadius: 20,
    backgroundColor: "#E6FFFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: pixelSizeVertical(8),
  },
  statLabel: {
    fontSize: fontPixel(14),
    color: "#666",
    marginBottom: pixelSizeVertical(4),
  },
  statValue: {
    fontSize: fontPixel(18),
    fontWeight: "bold",
    color: "#333",
  },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: pixelSizeHorizontal(16),
    marginBottom: pixelSizeVertical(16),
  },
  transactionsTitle: {
    fontSize: fontPixel(18),
    fontWeight: "600",
    color: "#333",
  },
  viewAllText: {
    fontSize: fontPixel(14),
    color: "#00BFA6",
  },
  transactionsList: {
    paddingBottom: heightPixel(24),
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: pixelSizeVertical(12),
    paddingHorizontal: pixelSizeHorizontal(16),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  transactionIconContainer: {
    marginRight: pixelSizeHorizontal(12),
  },
  transactionIcon: {
    width: widthPixel(36),
    height: heightPixel(36),
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  creditIcon: {
    backgroundColor: "#00BFA6",
  },
  debitIcon: {
    backgroundColor: "#FF4D4F",
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: fontPixel(14),
    fontWeight: "500",
    color: "#333",
    marginBottom: pixelSizeVertical(4),
  },
  transactionDate: {
    fontSize: fontPixel(12),
    color: "#666",
  },
  transactionFees: {
    fontSize: fontPixel(10),
    color: "#888",
    marginTop: pixelSizeVertical(2),
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: fontPixel(16),
    fontWeight: "600",
    marginBottom: pixelSizeVertical(4),
  },
  creditText: {
    color: "#00BFA6",
  },
  debitText: {
    color: "#FF4D4F",
  },
  statusText: {
    fontSize: fontPixel(12),
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: pixelSizeHorizontal(24),
  },
  emptyText: {
    fontSize: fontPixel(16),
    color: "#666",
    marginTop: pixelSizeVertical(16),
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: pixelSizeHorizontal(24),
  },
  errorText: {
    fontSize: fontPixel(16),
    color: "#666",
    marginTop: pixelSizeVertical(16),
    textAlign: "center",
    marginBottom: pixelSizeVertical(24),
  },
  retryButton: {
    backgroundColor: "#00BFA6",
    paddingVertical: pixelSizeVertical(10),
    paddingHorizontal: pixelSizeHorizontal(24),
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: fontPixel(16),
    fontWeight: "600",
  },
});
