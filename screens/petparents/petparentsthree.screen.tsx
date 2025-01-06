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

const { width } = Dimensions.get("window");
const imageSize = (width - 48) / 2;

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
     // Show review popup after 2 seconds
     const timer = setTimeout(() => {
       setShowReview(true);
     }, 2000);

     return () => clearTimeout(timer);
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
        console.error("No access token found");
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
    setShowReview(false);
  } catch (error) {
    console.error("Error submitting review:", error);
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
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FCD34D",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    marginRight: 40,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
  },
  gallery: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  imageContainer: {
    width: imageSize,
    height: imageSize,
    borderRadius: 16,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  addButton: {
    width: imageSize,
    height: imageSize,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FCD34D",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  modalContent: {
    width: width - 32,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    position: "relative",
  },
  userInfoContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userName: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: "600",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  locationText: {
    marginLeft: 4,
    color: "#666666",
  },
  closeButton: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 1,
  },
  closeButtonCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  reviewContainer: {
    width: "100%",
    alignItems: "center",
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  hostImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 16,
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  starContainer: {
    padding: 4,
  },
  star: {
    fontSize: 32,
    color: "#D1D5DB",
  },
  starSelected: {
    color: "#FCD34D",
  },
  feedbackLabel: {
    fontSize: 14,
    color: "#666666",
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  feedbackInput: {
    width: "100%",
    height: 100,
    backgroundColor: "#FEF9C3",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    textAlignVertical: "top",
  },
  submitButton: {
    width: "100%",
    backgroundColor: "#FCD34D",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  submitButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "600",
  },
});
