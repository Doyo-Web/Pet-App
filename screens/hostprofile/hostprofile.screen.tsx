import React, { useState, useEffect, SetStateAction } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useRouter } from "expo-router";
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
import useUser from "@/hooks/auth/useUser";

// Define the Host interface
interface Host {
  host: SetStateAction<Host | null>;
  _id: { $oid: string };
  userId: { $oid: string };
  fullName: string;
  phoneNumber: string;
  email: string;
  age: { $numberInt: string };
  gender: string;
  dateOfBirth: { $date: { $numberLong: string } };
  profession: string;
  location: string;
  line1: string;
  line2: string;
  city: string;
  pincode: string;
  residenceType: string;
  builtUpArea: string;
  petSize: string;
  petGender: string;
  petCount: string;
  willingToWalk: string;
  hasAreaRestrictions: string;
  areaRestrictions: string;
  walkFrequency: string;
  walkDuration: string;
  willingToCook: string;
  cookingOptions: string[];
  groomPet: boolean;
  hasPet: string;
  pets: { _id: { $oid: string } }[];
  hasVetNearby: string;
  vetInfo: {
    name: string;
    clinic: string;
    phone: string;
    address: string;
    _id: { $oid: string };
  };
  hostProfile?: {
    profileImage?: string;
    bio?: string;
    idProof?: string;
    facilityPictures?: string[];
    petPictures?: string[];
    pricingDaycare?: string;
    pricingBoarding?: string;
    pricingVegMeal?: string;
    pricingNonVegMeal?: string;
    _id: { $oid: string };
  };
  paymentDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    upiid: string;
    _id: { $oid: string };
  };
  __v: { $numberInt: string };
}

const DeleteConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.profilecardcontainermodel}>
          <View style={styles.profilecardbackgroundmodel}></View>
          <View style={styles.modalContent}>
            <View style={styles.warningIconContainer}>
              <MaterialIcons name="warning" size={32} color="#FF6B6B" />
            </View>
            <Text style={styles.modalTitle}>
              Are you sure you want to delete your Host Profile?
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.yesButton]}
                onPress={onConfirm}
              >
                <Text style={[styles.buttonText, styles.yesButtonText]}>
                  YES
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.noButton]}
                onPress={onClose}
              >
                <Text style={[styles.buttonText, styles.noButtonText]}>NO</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function HostProfileScreen() {
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);
  const [host, setHost] = useState<Host | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const router = useRouter();

  const handleDeletePress = () => {
    setIsDeleteModalVisible(true);
  };

  const handleHostProfileDelete = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");

      if (!accessToken) {
        Toast.show("Access token not found. Please log in again.", {
          type: "error",
        });
        return;
      }

      const response = await axios.delete(`${SERVER_URI}/hostprofile-delete`, {
        headers: {
          "Content-Type": "application/json",
          access_token: accessToken,
        },
      });

      if (response.status === 200) {
        Toast.show(response.data.message, {
          type: "success",
        });
        router.push("/(tabs)/host");
      }
    } catch (error: any) {

       if (error.response?.status === 400) {
         await AsyncStorage.removeItem("access_token");
         await AsyncStorage.removeItem("refresh_token"); // Clear token
         router.replace("/(routes)/login"); // Redirect to login page
      }
      
      if (error.response) {
        console.log("Error Response Data:", error.response.data);
        Toast.show("Failed to delete host profile.", {
          type: "error",
        });
      } else {
        console.log("Error Message:", error.message);
        Toast.show("An unexpected error occurred", {
          type: "error",
        });
      }
    } finally {
      setIsDeleteModalVisible(false);
    }
  };

  useEffect(() => {
    const fetchHostData = async () => {
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

        const response = await axios.get<Host>(`${SERVER_URI}/host`, {
          headers: { access_token: accessToken },
        });

        setHost(response.data.host);
        setLoading(false);
      } catch (error: any) {
         if (error.response?.status === 400) {
           await AsyncStorage.removeItem("access_token");
           await AsyncStorage.removeItem("refresh_token"); // Clear token
           router.replace("/(routes)/login"); // Redirect to login page
         }
        console.log("Error fetching host data:", error);
        setLoading(false);
        Alert.alert("Error", "Failed to fetch host data. Please try again.");
      }
    };

    fetchHostData();
  }, []);

  const togglePanel = (panel: string) => {
    setExpandedPanel((prevPanel) => (prevPanel === panel ? null : panel));
  };

  const navigateToGallery = () => {
    router.push("/(drawer)/(tabs)/hostprofile/hostprofilethree");
  };

  const navigateToReview = () => {
    router.push("/(drawer)/(tabs)/hostprofile/hostprofilefour");
  };

  const renderPanelContent = (panel: string) => {
    switch (panel) {
      case "services":
        return (
          <View style={styles.panelContent}>
            <TouchableOpacity onPress={()=>router.push("/(drawer)/(tabs)/booknow")}>
              <View style={styles.boardingIconContainer}>
                <Image
                  style={styles.boardingIcon}
                  source={require("@/assets/icons/home_boarding.png")}
                />
                <View style={styles.editBadge}>
                  <MaterialIcons name="edit" size={16} color="#fff" />
                </View>
              </View>
              <Text style={styles.boardingText}>Boarding</Text>
            </TouchableOpacity>
          </View>
        );
      case "requests":
        return (
          <View style={styles.panelContent}>
            <Text style={styles.panelText}>New Requests: 2</Text>
            <Text style={styles.panelText}>Pending Approval: 1</Text>
            <Text style={styles.panelText}>Completed: 8</Text>
          </View>
        );
      case "reviews":
        return (
          <View style={styles.panelContent}>
            <Text style={styles.panelText}>Average Rating: 4.8/5</Text>
            <Text style={styles.panelText}>Total Reviews: 15</Text>
            <Text style={styles.panelText}>Recent Reviews: 3</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#00BFA6" />
          </TouchableOpacity>
          <View style={styles.earningsContainer}>
            <Text style={styles.earningsText}>Total Earned : Rs 20,000</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#00BFA6"
            style={styles.loader}
          />
        ) : host ? (
          <View style={styles.profilecardcontainer}>
            <View style={styles.profilecardbackground}></View>
            <View style={styles.profileCard}>
              <Image
                source={{
                  uri:
                    host.hostProfile?.profileImage ||
                    "https://via.placeholder.com/80",
                }}
                style={styles.profileImage}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{host.fullName}</Text>
                <View style={styles.locationContainer}>
                  <Ionicons name="location" size={16} color="#666" />
                  <Text style={styles.locationText}>{host.city}</Text>
                </View>
                <Text style={styles.profileDescription}>
                  {host.hostProfile?.bio || "No bio available"}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <Text style={styles.errorText}>Failed to load host data</Text>
        )}

        <Text style={styles.sectionTitle}>My Dashboard</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/hostprofile/hostprofiletwo")}
        >
          <MaterialIcons name="calendar-today" size={24} color="#00BFA6" />
          <Text style={styles.menuText}>My Bookings</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => togglePanel("services")}
        >
          <MaterialIcons name="pets" size={24} color="#00BFA6" />
          <Text style={styles.menuText}>Services</Text>
          <Ionicons
            name={expandedPanel === "services" ? "chevron-up" : "chevron-down"}
            size={24}
            color="#666"
          />
        </TouchableOpacity>
        {expandedPanel === "services" && renderPanelContent("services")}

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/hostprofile/hostprofilefive")}
        >
          <MaterialIcons name="assignment" size={24} color="#00BFA6" />
          <Text style={styles.menuText}>Requests</Text>
          <Ionicons
            name={expandedPanel === "requests" ? "chevron-up" : "chevron-down"}
            size={24}
            color="#666"
          />
        </TouchableOpacity>
        {expandedPanel === "requests" && renderPanelContent("requests")}

        <TouchableOpacity style={styles.menuItem} onPress={navigateToReview}>
          <MaterialIcons name="rate-review" size={24} color="#00BFA6" />
          <Text style={styles.menuText}>Reviews</Text>
          <Ionicons
            name={expandedPanel === "reviews" ? "chevron-up" : "chevron-down"}
            size={24}
            color="#666"
          />
        </TouchableOpacity>
        {expandedPanel === "reviews" && renderPanelContent("reviews")}

        <Text style={styles.sectionTitle}>My Gallery</Text>
        <View style={styles.galleryGrid}>
          {host?.hostProfile?.facilityPictures
            ? host.hostProfile.facilityPictures
                .slice(0, 4)
                .map((picture, index) => (
                  <Image
                    key={index}
                    source={{ uri: picture }}
                    style={styles.galleryImage}
                  />
                ))
            : Array(4)
                .fill(null)
                .map((_, index) => (
                  <Image
                    key={index}
                    source={{ uri: "https://via.placeholder.com/150" }}
                    style={styles.galleryImage}
                  />
                ))}
        </View>
        <TouchableOpacity onPress={navigateToGallery}>
          <Text style={styles.seeMoreText}>see more</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeletePress}
        >
          <MaterialIcons name="delete-outline" size={24} color="#FF4D4F" />
          <Text style={styles.deleteText}>Delete my Host Profile</Text>
        </TouchableOpacity>
      </ScrollView>
      <DeleteConfirmationModal
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        onConfirm={handleHostProfileDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: heightPixel(200),
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: pixelSizeHorizontal(16),
    justifyContent: "space-between",
  },
  earningsContainer: {
    backgroundColor: "#FFE600",
    paddingHorizontal: pixelSizeHorizontal(16),
    paddingVertical: pixelSizeVertical(8),
    borderRadius: 20,
  },
  earningsText: {
    fontWeight: "500",
    fontSize: fontPixel(14),
  },

  profilecardcontainer: {
    position: "relative",
    width: "100%",
    maxWidth: widthPixel(400),
    marginHorizontal: "auto",
  },

  profilecardbackground: {
    position: "absolute",
    top: heightPixel(20),
    right: widthPixel(16),
    bottom: heightPixel(16),
    left: widthPixel(18),
    backgroundColor: "#00D0C3",
    borderRadius: 12,
    transform: [{ translateX: 4 }, { translateY: 4 }],
  },

  profileCard: {
    position: "relative",
    margin: pixelSizeHorizontal(16),
    padding: pixelSizeHorizontal(16),
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#00BFA6",
    flexDirection: "row",
  },
  profileImage: {
    width: widthPixel(80),
    height: heightPixel(80),
    borderRadius: 40,
  },
  profileInfo: {
    marginLeft: pixelSizeHorizontal(16),
    flex: 1,
  },
  profileName: {
    fontSize: fontPixel(24),
    fontWeight: "bold",
    marginBottom: pixelSizeVertical(4),
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: pixelSizeVertical(8),
  },
  locationText: {
    marginLeft: pixelSizeHorizontal(4),
    color: "#666",
    fontSize: fontPixel(14),
  },
  profileDescription: {
    color: "#666",
    fontSize: fontPixel(14),
  },
  sectionTitle: {
    fontSize: fontPixel(18),
    fontWeight: "500",
    marginHorizontal: pixelSizeHorizontal(16),
    marginTop: pixelSizeVertical(24),
    marginBottom: pixelSizeVertical(16),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6FFFC",
    padding: pixelSizeHorizontal(16),
    marginHorizontal: pixelSizeHorizontal(16),
    marginBottom: pixelSizeVertical(8),
    borderRadius: 8,
  },
  menuText: {
    flex: 1,
    marginLeft: pixelSizeHorizontal(16),
    fontSize: fontPixel(16),
    color: "#333",
  },
  panelContent: {
    backgroundColor: "#fff",
    marginHorizontal: pixelSizeHorizontal(16),
    marginTop: pixelSizeVertical(-8),
    marginBottom: pixelSizeVertical(8),
    padding: pixelSizeHorizontal(16),
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderColor: "#E6FFFC",
  },
  panelText: {
    fontSize: fontPixel(14),
    color: "#666",
    marginBottom: pixelSizeVertical(8),
  },
  boardingIconContainer: {
    width: widthPixel(64),
    height: heightPixel(64),
    backgroundColor: "#00BFA6",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },

  boardingIcon: {
    width: 36,
    height: 36,
    objectFit: "cover",
  },

  editBadge: {
    position: "absolute",
    bottom: -6,
    right: -8,
    backgroundColor: "#00BFA6",
    borderRadius: 12,
    padding: pixelSizeHorizontal(4),
    borderWidth: 2,
    borderColor: "#fff",
  },
  boardingText: {
    marginTop: pixelSizeVertical(8),
    fontSize: fontPixel(16),
    color: "#333",
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: pixelSizeHorizontal(12),
    justifyContent: "space-between",
  },
  galleryImage: {
    width: "48%",
    height: heightPixel(150),
    borderRadius: 8,
    marginBottom: pixelSizeVertical(8),
  },
  seeMoreText: {
    textAlign: "center",
    color: "#666",
    marginTop: pixelSizeVertical(8),
    marginBottom: pixelSizeVertical(24),
    fontSize: fontPixel(14),
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: pixelSizeHorizontal(16),
    marginBottom: pixelSizeVertical(32),
  },
  deleteText: {
    color: "#FF4D4F",
    marginLeft: pixelSizeHorizontal(8),
    fontSize: fontPixel(16),
  },
  loader: {
    marginVertical: pixelSizeVertical(20),
  },
  errorText: {
    textAlign: "center",
    color: "red",
    marginVertical: pixelSizeVertical(20),
    fontSize: fontPixel(14),
  },

  profilecardcontainermodel: {
    position: "relative",
    width: "100%",
    maxWidth: widthPixel(400),
    marginHorizontal: "auto",
  },

  profilecardbackgroundmodel: {
    position: "absolute",
    top: heightPixel(5),
    right: widthPixel(30),
    bottom: heightPixel(-2),
    left: widthPixel(10),
    backgroundColor: "#00D0C3",
    borderRadius: 12,
    transform: [{ translateX: 4 }, { translateY: 4 }],
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: pixelSizeHorizontal(20),
  },
  modalContent: {
    position: "relative",
    backgroundColor: "white",
    borderRadius: 16,
    padding: pixelSizeHorizontal(24),
    width: "100%",
    maxWidth: widthPixel(320),
    alignItems: "center",
  },
  warningIconContainer: {
    width: widthPixel(64),
    height: heightPixel(64),
    borderRadius: 32,
    backgroundColor: "#FFE8E8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: pixelSizeVertical(16),
  },
  modalTitle: {
    fontSize: fontPixel(16),
    textAlign: "center",
    color: "#333333",
    marginBottom: pixelSizeVertical(24),
    lineHeight: fontPixel(24),
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: pixelSizeHorizontal(16),
    width: "100%",
  },
  button: {
    paddingVertical: pixelSizeVertical(12),
    paddingHorizontal: pixelSizeHorizontal(32),
    borderRadius: 8,
    minWidth: widthPixel(100),
  },
  yesButton: {
    backgroundColor: "#00BFA6",
  },
  noButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#00BFA6",
  },
  buttonText: {
    fontSize: fontPixel(14),
    fontWeight: "600",
    textAlign: "center",
  },
  yesButtonText: {
    color: "white",
  },
  noButtonText: {
    color: "#00BFA6",
  },
});
