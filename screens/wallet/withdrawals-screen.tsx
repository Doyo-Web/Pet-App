"use client";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URI } from "@/utils/uri";
import { Toast } from "react-native-toast-notifications";
import {
  heightPixel,
  fontPixel,
  pixelSizeVertical,
  pixelSizeHorizontal,
} from "../../utils/responsive";
import React from "react";
import { RectButton } from "react-native-gesture-handler";

// Define interfaces
interface Withdrawal {
  _id: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  accountDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    upiId?: string;
  };
  transactionId?: string;
  transactionDate?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function WithdrawalsScreen() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchWithdrawals(1);
  }, []);

  const fetchWithdrawals = async (page: number, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const accessToken = await AsyncStorage.getItem("access_token");

      if (!accessToken) {
        Toast.show("Access token not found. Please log in again.", {
          type: "error",
        });
        router.replace("/(routes)/login");
        return;
      }

      const response = await axios.get(
        `${SERVER_URI}/wallet/withdrawals?page=${page}&limit=10`,
        {
          headers: {
            "Content-Type": "application/json",
            access_token: accessToken,
          },
        }
      );

      if (response.data.success) {
        if (append) {
          setWithdrawals((prev) => [...prev, ...response.data.withdrawals]);
        } else {
          setWithdrawals(response.data.withdrawals);
        }
        setPagination(response.data.pagination);
      } else {
        Toast.show("Failed to fetch withdrawals", {
          type: "error",
        });
      }
    } catch (error: any) {
      if (error.response?.status === 413) {
        await AsyncStorage.removeItem("access_token");
        await AsyncStorage.removeItem("refresh_token");
        router.replace("/(routes)/login");
      } else {
        console.error("Error fetching withdrawals:", error);
        Toast.show("An error occurred while fetching withdrawals", {
          type: "error",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchWithdrawals(1);
  };

  const loadMoreWithdrawals = () => {
    if (!loadingMore && pagination.page < pagination.pages) {
      fetchWithdrawals(pagination.page + 1, true);
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "#00BFA6";
      case "PENDING":
        return "#FFA500";
      case "PROCESSING":
        return "#3498db";
      case "FAILED":
        return "#FF4D4F";
      case "CANCELLED":
        return "#888";
      default:
        return "#888";
    }
  };

  const renderWithdrawalItem = ({ item }: { item: Withdrawal }) => {
    return (
      <View style={styles.withdrawalItem}>
        <View style={styles.withdrawalHeader}>
          <Text style={styles.withdrawalDate}>
            {formatDate(item.createdAt)}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(item.status)}20` },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
        <View style={styles.withdrawalDetails}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount</Text>
            <Text style={styles.amountValue}>{formatAmount(item.amount)}</Text>
          </View>
          <View style={styles.bankContainer}>
            <Text style={styles.bankLabel}>Bank</Text>
            <Text style={styles.bankValue}>{item.accountDetails.bankName}</Text>
          </View>
        </View>
        {item.transactionId && (
          <View style={styles.transactionIdContainer}>
            <Text style={styles.transactionIdLabel}>Transaction ID</Text>
            <Text style={styles.transactionIdValue}>{item.transactionId}</Text>
          </View>
        )}
        {item.remarks && (
          <View style={styles.remarksContainer}>
            <Text style={styles.remarksLabel}>Remarks</Text>
            <Text style={styles.remarksValue}>{item.remarks}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#00BFA6" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <RectButton onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#00BFA6" />
        </RectButton>
        <Text style={styles.headerTitle}>Withdrawal History</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#00BFA6" style={styles.loader} />
      ) : (
        <FlatList
          data={withdrawals}
          renderItem={renderWithdrawalItem}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMoreWithdrawals}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons
                name="account-balance-wallet"
                size={48}
                color="#ccc"
              />
              <Text style={styles.emptyText}>No withdrawal history yet</Text>
              <TouchableOpacity
                style={styles.withdrawButton}
                onPress={() => router.push("/(drawer)/(tabs)/wallet/withdraw")}
              >
                <Text style={styles.withdrawButtonText}>Withdraw Money</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={
            withdrawals.length === 0 ? { flexGrow: 1 } : styles.withdrawalsList
          }
        />
      )}

      {withdrawals.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.newWithdrawalButton}
            onPress={() => router.push("/(drawer)/(tabs)/wallet/withdraw")}
          >
            <Text style={styles.newWithdrawalButtonText}>New Withdrawal</Text>
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
  withdrawalsList: {
    padding: pixelSizeHorizontal(16),
    paddingBottom: heightPixel(80),
  },
  withdrawalItem: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: pixelSizeHorizontal(16),
    marginBottom: pixelSizeVertical(16),
  },
  withdrawalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: pixelSizeVertical(12),
  },
  withdrawalDate: {
    fontSize: fontPixel(14),
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: pixelSizeHorizontal(8),
    paddingVertical: pixelSizeVertical(4),
    borderRadius: 4,
  },
  statusText: {
    fontSize: fontPixel(12),
    fontWeight: "500",
  },
  withdrawalDetails: {
    flexDirection: "row",
    marginBottom: pixelSizeVertical(12),
  },
  amountContainer: {
    flex: 1,
  },
  amountLabel: {
    fontSize: fontPixel(12),
    color: "#666",
    marginBottom: pixelSizeVertical(4),
  },
  amountValue: {
    fontSize: fontPixel(18),
    fontWeight: "600",
    color: "#333",
  },
  bankContainer: {
    flex: 1,
  },
  bankLabel: {
    fontSize: fontPixel(12),
    color: "#666",
    marginBottom: pixelSizeVertical(4),
  },
  bankValue: {
    fontSize: fontPixel(14),
    color: "#333",
  },
  transactionIdContainer: {
    marginBottom: pixelSizeVertical(8),
  },
  transactionIdLabel: {
    fontSize: fontPixel(12),
    color: "#666",
    marginBottom: pixelSizeVertical(2),
  },
  transactionIdValue: {
    fontSize: fontPixel(14),
    color: "#333",
  },
  remarksContainer: {
    marginTop: pixelSizeVertical(4),
  },
  remarksLabel: {
    fontSize: fontPixel(12),
    color: "#666",
    marginBottom: pixelSizeVertical(2),
  },
  remarksValue: {
    fontSize: fontPixel(14),
    color: "#333",
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
    marginBottom: pixelSizeVertical(24),
    textAlign: "center",
  },
  withdrawButton: {
    backgroundColor: "#00BFA6",
    paddingVertical: pixelSizeVertical(12),
    paddingHorizontal: pixelSizeHorizontal(24),
    borderRadius: 8,
  },
  withdrawButtonText: {
    color: "#fff",
    fontSize: fontPixel(16),
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: pixelSizeHorizontal(16),
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  newWithdrawalButton: {
    backgroundColor: "#00BFA6",
    paddingVertical: pixelSizeVertical(16),
    borderRadius: 8,
    alignItems: "center",
  },
  newWithdrawalButtonText: {
    color: "#fff",
    fontSize: fontPixel(16),
    fontWeight: "600",
  },
  footerLoader: {
    paddingVertical: pixelSizeVertical(16),
    alignItems: "center",
  },
});
