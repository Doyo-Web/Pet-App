import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { ArrowLeft, Plus, X, MapPin } from "lucide-react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URI } from "@/utils/uri";
import axios from "axios";
import { Toast } from "react-native-toast-notifications";
import {
  widthPixel,
  heightPixel,
  fontPixel,
  pixelSizeVertical,
  pixelSizeHorizontal,
} from "../../utils/responsive";

const { width } = Dimensions.get("window");
const imageSize = (width - widthPixel(48)) / 2;

export default function GalleryScreen() {
  const [showReview, setShowReview] = useState(false);
  const [review, setReview] = useState({
    rating: 0,
    feedback: "",
  });
  const [loading, setLoading] = useState(true);

  const { petProfiles, isLoading, error } = useSelector(
    (state: RootState) => state.petProfile
  );

  useEffect(() => {
    // Check if the review has already been submitted
    const checkReviewStatus = async () => {
      const reviewSubmitted = await AsyncStorage.getItem("review_submitted");
      if (!reviewSubmitted) {
        // If the review hasn't been submitted yet, show the popup
        const timer = setTimeout(() => {
          setShowReview(true);
        }, 2000);

        return () => clearTimeout(timer);
      }
    };

    checkReviewStatus();
  }, []);

  const allPetImages = petProfiles.flatMap((pet) =>
    pet.petImages.map((img) => ({ url: img.url, petName: pet.petName }))
  );

  const prevStep = () => {
    router.push("/(drawer)/(tabs)/petparents/petparentstwo");
  };

  const handleSubmitReview = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) {
        console.log("No access token found");
        setLoading(false);
        Alert.alert(
          "Error",
          "You are not logged in. Please log in and try again."
        );
        return;
      }

      setLoading(true);

      const response = await axios.post(
        `${SERVER_URI}/create-review`,
        review, // Send review object directly
        {
          headers: {
            "Content-Type": "application/json", // Specify JSON content
            access_token: accessToken, // Include access token
          },
        }
      );

      if (!response.data) {
        throw new Error("Failed to submit review");
      }

      Toast.show(response.data.message, {
        type: "success",
      });
      // Store the review submission status
      await AsyncStorage.setItem("review_submitted", "true");

      setShowReview(false);
    } catch (error) {
      console.log("Error submitting review:", error);
      Alert.alert("Error", "Failed to submit review. Please try again.");
    }
  };

  const renderStars = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => setReview((prev) => ({ ...prev, rating: index + 1 }))}
          style={styles.starContainer}
        >
          <Text
            style={[styles.star, index < review.rating && styles.starSelected]}
          >
            ★
          </Text>
        </TouchableOpacity>
      ));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={prevStep}>
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>My Gallery</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Gallery Grid */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.gallery}>
          {allPetImages.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image
                source={{ uri: image.url }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          ))}

          {/* Add Photo Button */}
          <TouchableOpacity style={styles.addButton}>
            <View style={styles.addButtonInner}>
              <Plus size={24} color="#F59E0B" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={showReview}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowReview(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.profilecardcontainermodel}>
            <View style={styles.profilecardbackgroundmodel}></View>
            <View style={styles.modalContent}>
              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowReview(false)}
              >
                <View style={styles.closeButtonCircle}>
                  <X size={20} color="black" />
                </View>
              </TouchableOpacity>

              {/* Review Content */}
              <View style={styles.reviewContainer}>
                <Text style={styles.reviewTitle}>
                  Please share your experience with DOYO.
                </Text>

                <Image
                  source={{ uri: "https://placeholder.com/100" }}
                  style={styles.hostImage}
                />

                <Text style={styles.ratingText}>Rate our Host's service</Text>

                <View style={styles.starsContainer}>{renderStars()}</View>

                <Text style={styles.feedbackLabel}>
                  Please give us your valuable feedback:
                </Text>

                <TextInput
                  style={styles.feedbackInput}
                  placeholder="Type here..."
                  value={review.feedback}
                  onChangeText={(text) =>
                    setReview((prev) => ({ ...prev, feedback: text }))
                  }
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#666666"
                />

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmitReview}
                >
                  <Text style={styles.submitButtonText}>SUBMIT</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 26,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: pixelSizeHorizontal(16),
    paddingVertical: pixelSizeVertical(12),
  },
  backButton: {
    width: widthPixel(40),
    height: heightPixel(40),
    borderRadius: widthPixel(20),
    backgroundColor: "#FCD34D",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: fontPixel(24),
    fontWeight: "bold",
    marginRight: widthPixel(40),
  },
  placeholder: {
    width: widthPixel(40),
  },
  scrollContent: {
    padding: pixelSizeHorizontal(16),
  },
  gallery: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: widthPixel(16),
  },
  imageContainer: {
    width: imageSize,
    height: imageSize,
    borderRadius: widthPixel(16),
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  addButton: {
    width: imageSize,
    height: imageSize,
    borderRadius: widthPixel(16),
    borderWidth: widthPixel(2),
    borderColor: "#FCD34D",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonInner: {
    width: widthPixel(48),
    height: heightPixel(48),
    borderRadius: widthPixel(24),
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  profilecardcontainermodel: {
    position: "relative",
    maxWidth: widthPixel(400),
    width: width - widthPixel(32),
    marginHorizontal: "auto",
  },
  profilecardbackgroundmodel: {
    position: "absolute",
    top: heightPixel(0),
    right: widthPixel(-2),
    bottom: heightPixel(0),
    left: widthPixel(8),
    backgroundColor: "#FF6B6B",
    borderRadius: widthPixel(12),
    transform: [{ translateX: widthPixel(4) }, { translateY: heightPixel(4) }],
  },
  modalContent: {
    width: width - widthPixel(32),
    backgroundColor: "white",
    borderRadius: widthPixel(20),
    padding: pixelSizeHorizontal(20),
    alignItems: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    right: widthPixel(10),
    top: heightPixel(10),
    zIndex: 1,
  },
  closeButtonCircle: {
    width: widthPixel(30),
    height: heightPixel(30),
    borderRadius: widthPixel(15),
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: widthPixel(2),
    borderColor: "#FFD700",
  },
  reviewContainer: {
    width: "100%",
    alignItems: "center",
  },
  reviewTitle: {
    fontSize: fontPixel(18),
    fontWeight: "600",
    textAlign: "center",
    marginBottom: pixelSizeVertical(20),
  },
  hostImage: {
    width: widthPixel(80),
    height: heightPixel(80),
    borderRadius: widthPixel(40),
    marginBottom: pixelSizeVertical(16),
  },
  ratingText: {
    fontSize: fontPixel(16),
    marginBottom: pixelSizeVertical(12),
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: pixelSizeVertical(20),
  },
  starContainer: {
    padding: pixelSizeHorizontal(4),
  },
  star: {
    fontSize: fontPixel(32),
    color: "#D1D5DB",
  },
  starSelected: {
    color: "#FCD34D",
  },
  feedbackLabel: {
    fontSize: fontPixel(14),
    color: "#666666",
    alignSelf: "flex-start",
    marginBottom: pixelSizeVertical(8),
  },
  feedbackInput: {
    width: "100%",
    height: heightPixel(100),
    backgroundColor: "#FEF9C3",
    borderRadius: widthPixel(12),
    padding: pixelSizeHorizontal(12),
    marginBottom: pixelSizeVertical(20),
    textAlignVertical: "top",
  },
  submitButton: {
    width: "100%",
    backgroundColor: "#FCD34D",
    borderRadius: widthPixel(12),
    padding: pixelSizeHorizontal(16),
    alignItems: "center",
  },
  submitButtonText: {
    color: "black",
    fontSize: fontPixel(16),
    fontWeight: "600",
  },
});
