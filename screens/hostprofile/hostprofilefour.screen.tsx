import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import {
  widthPixel,
  heightPixel,
  fontPixel,
  pixelSizeVertical,
  pixelSizeHorizontal,
} from "../../utils/responsive";
import { router } from "expo-router";

// Define the type for a single review
interface Review {
  _id: string;
  userId: {
    fullname: string;
    avatar: {
      url: string;
    };
  };
  createdAt: string;
  rating: number;
  feedback: string;
}

// ReviewCard Component Props
interface ReviewCardProps {
  review: Review;
}

// ReviewCard Component
const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <Image source={{ uri: review.userId.avatar.url }} style={styles.image} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{review.userId.fullname}</Text>
        <Text style={styles.date}>
          {new Date(review.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.ratingContainer}>
        {[...Array(review.rating)].map((_, index) => (
          <AntDesign key={index} name="star" size={16} color="#FFD700" />
        ))}
      </View>
    </View>
    <Text style={styles.feedback}>{review.feedback}</Text>
    <View style={styles.actions}>
      <TouchableOpacity>
        <AntDesign name="sharealt" size={20} color="#000" style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity>
        <AntDesign name="hearto" size={20} color="#000" style={styles.icon} />
      </TouchableOpacity>
    </View>
  </View>
);

// MyReviewsScreen Component
const MyReviewsScreen: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) {
        console.log("No access token found");
        Alert.alert(
          "Error",
          "You are not logged in. Please log in and try again."
        );
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const response = await axios.get<{ reviews: Review[] }>(
        `${SERVER_URI}/getAll-review`,
        {
          headers: {
            "Content-Type": "application/json",
            access_token: accessToken,
          },
        }
      );

      setReviews(response.data.reviews);
    } catch (error: any) {
      if (error.response?.status === 413) {
        await AsyncStorage.removeItem("access_token");
        await AsyncStorage.removeItem("refresh_token"); // Clear token
        router.replace("/(routes)/login"); // Redirect to login page
      }
      console.log("Error fetching reviews:", error);
      Alert.alert("Error", "Failed to fetch reviews. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#00bcd4" />
        <Text>Loading reviews...</Text>
      </View>
    );
  }

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
      <View style={styles.container}>
        <Text style={styles.title}>My Reviews</Text>
        <FlatList
          data={reviews}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <ReviewCard review={item} />}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.noReviewsText}>No reviews available.</Text>
          }
        />
      </View>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: pixelSizeHorizontal(16),
    paddingTop: pixelSizeVertical(36),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: fontPixel(24),
    fontWeight: "bold",
    marginBottom: pixelSizeVertical(16),
    textAlign: "center",
  },
  listContainer: {
    paddingBottom: pixelSizeVertical(16),
  },
  card: {
    backgroundColor: "#E0F7FA",
    borderRadius: widthPixel(10),
    padding: pixelSizeHorizontal(16),
    marginBottom: pixelSizeVertical(16),
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: pixelSizeVertical(10),
  },
  image: {
    width: widthPixel(50),
    height: heightPixel(50),
    borderRadius: widthPixel(25),
    marginRight: pixelSizeHorizontal(12),
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: fontPixel(16),
    fontWeight: "bold",
  },
  date: {
    fontSize: fontPixel(12),
    color: "#757575",
  },
  ratingContainer: {
    flexDirection: "row",
  },
  feedback: {
    fontSize: fontPixel(14),
    color: "#424242",
    marginBottom: pixelSizeVertical(12),
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  icon: {
    marginHorizontal: pixelSizeHorizontal(8),
  },
  noReviewsText: {
    textAlign: "center",
    color: "#757575",
    marginTop: pixelSizeVertical(20),
  },
});

export default MyReviewsScreen;
