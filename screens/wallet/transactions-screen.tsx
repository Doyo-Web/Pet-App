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
  widthPixel,
  heightPixel,
  fontPixel,
  pixelSizeVertical,
  pixelSizeHorizontal,
} from "../../utils/responsive";
import React from "react";

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

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
    fetchTransactions(1);
  }, []);

  const fetchTransactions = async (page: number, append = false) => {
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
        `${SERVER_URI}/wallet/transactions?page=${page}&limit=10`,
        {
          headers: {
            "Content-Type": "application/json",
            access_token: accessToken,
          },
        }
      );

      if (response.data.success) {
        if (append) {
          setTransactions((prev) => [...prev, ...response.data.transactions]);
        } else {
          setTransactions(response.data.transactions);
        }
        setPagination(response.data.pagination);
      } else {
        Toast.show("Failed to fetch transactions", {
          type: "error",
        });
      }
    } catch (error: any) {
      if (error.response?.status === 413) {
        await AsyncStorage.removeItem("access_token");
        await AsyncStorage.removeItem("refresh_token");
        router.replace("/(routes)/login");
      } else {
        console.error("Error fetching transactions:", error);
        Toast.show("An error occurred while fetching transactions", {
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
    fetchTransactions(1);
  };

  const loadMoreTransactions = () => {
    if (!loadingMore && pagination.page < pagination.pages) {
      fetchTransactions(pagination.page + 1, true);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const isCredit = item.type === "CREDIT";

    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() =>
          router.push({
            pathname: "/(drawer)/(tabs)/wallet/transactions",
            params: { id: item._id },
          })
        }
      >
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
          <Text
            style={[
              styles.statusText,
              item.status === "COMPLETED"
                ? styles.completedStatus
                : item.status === "PENDING"
                ? styles.pendingStatus
                : styles.failedStatus,
            ]}
          >
            {item.status}
          </Text>
        </View>
      </TouchableOpacity>
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
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#00BFA6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#00BFA6" style={styles.loader} />
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMoreTransactions}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="history" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          }
          contentContainerStyle={
            transactions.length === 0
              ? { flexGrow: 1 }
              : styles.transactionsList
          }
        />
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
  transactionsList: {
    paddingBottom: heightPixel(24),
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: pixelSizeVertical(16),
    paddingHorizontal: pixelSizeHorizontal(16),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  transactionIconContainer: {
    marginRight: pixelSizeHorizontal(12),
  },
  transactionIcon: {
    width: widthPixel(40),
    height: heightPixel(40),
    borderRadius: 20,
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
    fontWeight: "500",
    paddingHorizontal: pixelSizeHorizontal(8),
    paddingVertical: pixelSizeVertical(2),
    borderRadius: 4,
  },
  completedStatus: {
    backgroundColor: "#E6FFFC",
    color: "#00BFA6",
  },
  pendingStatus: {
    backgroundColor: "#FFF8E6",
    color: "#FFA500",
  },
  failedStatus: {
    backgroundColor: "#FFE6E6",
    color: "#FF4D4F",
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
  footerLoader: {
    paddingVertical: pixelSizeVertical(16),
    alignItems: "center",
  },
});
