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
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URI } from "@/utils/uri";
import { Toast } from "react-native-toast-notifications";

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

export default function HostProfileScreen() {
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);
  const [host, setHost] = useState<Host | null>(null);
  const [loading, setLoading] = useState(true);

const router = useRouter();
  
const handleHostProfileDelete = async () => {

  try {
    // Fetch the access token from AsyncStorage
    const accessToken = await AsyncStorage.getItem("access_token");

    if (!accessToken) {
      Toast.show("Access token not found. Please log in again.", {
        type: "error",
      });
      return;
    }

    // Make the DELETE request
    const response = await axios.delete(`${SERVER_URI}/hostprofile-delete`, {
      headers: {
        "Content-Type": "application/json",
        access_token: accessToken, // Send the token in the headers
      },
    });

    if (response.status === 200) {
      // Show success message
     Toast.show(response.data.message, {
              type: "success",
            });

      // Redirect to the desired route
      router.push("/(tabs)/host");
    }
  } catch (error: any) {
    // Handle errors
    if (error.response) {
      console.error("Error Response Data:", error.response.data);
      Toast.show("Failed to delete host profile.", {
        type: "error",
      });
    } else {
      console.error("Error Message:", error.message);
      Toast.show("An unexpected error occurred", {
        type: "error",
      });
    }
  }
};

  useEffect(() => {
    const fetchHostData = async () => {
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

        const response = await axios.get<Host>(`${SERVER_URI}/host`, {
          headers: { access_token: accessToken },
        });
        console.log(response.data);
        setHost(response.data.host);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching host data:", error);
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

  const renderPanelContent = (panel: string) => {
    switch (panel) {
      case "services":
        return (
          <View style={styles.panelContent}>
            <View>
              <View style={styles.boardingIconContainer}>
                <MaterialIcons name="home" size={32} color="#00BFA6" />
                <View style={styles.editBadge}>
                  <MaterialIcons name="edit" size={16} color="#fff" />
                </View>
              </View>
              <Text style={styles.boardingText}>Boarding</Text>
            </View>
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
          onPress={() => togglePanel("requests")}
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

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => togglePanel("reviews")}
        >
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
          onPress={handleHostProfileDelete}
        >
          <MaterialIcons name="delete-outline" size={24} color="#FF4D4F" />
          <Text style={styles.deleteText}>Delete my Host Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 200,
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    justifyContent: "space-between",
  },
  earningsContainer: {
    backgroundColor: "#FFE600",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  earningsText: {
    fontWeight: "500",
  },
  profileCard: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#00BFA6",
    flexDirection: "row",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 4,
    color: "#666",
  },
  profileDescription: {
    color: "#666",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6FFFC",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  menuText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: "#333",
  },
  panelContent: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -8,
    marginBottom: 8,
    padding: 16,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderColor: "#E6FFFC",
  },
  panelText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  boardingIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: "#00BFA6",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#00BFA6",
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  boardingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#333",
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    justifyContent: "space-between",
  },
  galleryImage: {
    width: "48%",
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  seeMoreText: {
    textAlign: "center",
    color: "#666",
    marginTop: 8,
    marginBottom: 24,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginBottom: 32,
  },
  deleteText: {
    color: "#FF4D4F",
    marginLeft: 8,
    fontSize: 16,
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    textAlign: "center",
    color: "red",
    marginVertical: 20,
  },
});
