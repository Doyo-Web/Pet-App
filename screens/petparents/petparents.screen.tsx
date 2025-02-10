import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import {
  ArrowLeft,
  MapPin,
  ChevronDown,
  Pencil,
  Plus,
  Calendar,
  FileText,
  ChevronRight,
  LogOut,
} from "lucide-react-native";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import useUser from "@/hooks/auth/useUser";
import {
  widthPixel,
  heightPixel,
  fontPixel,
  pixelSizeVertical,
  pixelSizeHorizontal,
} from "../../utils/responsive";

const { width, height } = Dimensions.get("window");

export default function PetParentProfile() {
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const { petProfiles, isLoading, error } = useSelector(
    (state: RootState) => state.petProfile
  );

  const { user, setRefetch, loading } = useUser();
  const ruser = useSelector((state: any) => state.user.user);

   const navigateToGallery = () => {
     router.push("/(drawer)/(tabs)/petparents/petparentsthree");
  };
  
  
   const navigateToBookingRequest = () => {
     router.push("/(drawer)/(tabs)/booknow/booknowthree");
   };

  const toggleExpand = () => {
    setExpanded(!expanded);
    Animated.spring(animation, {
      toValue: expanded ? 0 : 1,
      useNativeDriver: true,
    }).start();
  };

  const addNewPet = () => {
    router.push("/(drawer)/(tabs)/profile");
  };

  // Flatten all pet images into a single array
  const allPetImages = petProfiles.flatMap((pet) =>
    pet.petImages.map((img) => ({ url: img.url, petName: pet.petName }))
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <View style={styles.backButtonCircle}>
              <ArrowLeft color="#000" size={24} />
            </View>
          </TouchableOpacity>
          <View style={styles.profilecardcontainer}>
            <View style={styles.profilecardbackground}></View>
            <View style={styles.profile}>
              <Image
                source={{
                  uri:
                    ruser?.avatar?.url || user?.avatar?.url
                      ? ruser?.avatar?.url || user?.avatar?.url
                      : "https://media.istockphoto.com/id/2151669184/vector/vector-flat-illustration-in-grayscale-avatar-user-profile-person-icon-gender-neutral.jpg?s=612x612&w=0&k=20&c=UEa7oHoOL30ynvmJzSCIPrwwopJdfqzBs0q69ezQoM8=",
                }}
                style={styles.avatar}
              />
              <View style={styles.info}>
                <Text style={styles.name}>
                  {ruser?.fullname || user?.fullname}
                </Text>
                <View style={styles.location}>
                  <MapPin color="#666" size={14} />
                  <Text style={styles.locationText}>
                    {ruser?.profession || user?.profession}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Dashboard */}
        <View style={styles.dashboard}>
          <Text style={styles.dashboardTitle}>My Dashboard</Text>
        </View>

        {/* Pet Profiles */}
        <View style={styles.petProfilesContainer}>
          <TouchableOpacity
            style={styles.petProfilesHeader}
            onPress={toggleExpand}
          >
            <View style={styles.petProfilesHeaderContent}>
              <View style={styles.paw}>
                <Text style={styles.pawText}>🐾</Text>
              </View>
              <Text style={styles.petProfilesHeaderText}>Pet Profile</Text>
            </View>
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["-90deg", "0deg"],
                    }),
                  },
                ],
              }}
            >
              <ChevronDown color="#000" size={24} />
            </Animated.View>
          </TouchableOpacity>

          {expanded && (
            <View style={styles.petProfilesContent}>
              <View style={styles.petList}>
                {isLoading ? (
                  <Text>Loading pet profiles...</Text>
                ) : error ? (
                  <Text>Error loading pet profiles: {error}</Text>
                ) : (
                  petProfiles.map((pet) => (
                    <View key={pet._id} style={styles.petItem}>
                      <Image
                        source={{
                          uri:
                            pet.petImages[0]?.url ||
                            "https://placekitten.com/200/200",
                        }}
                        style={styles.petImage}
                      />
                      <Text style={styles.petName}>{pet.petName}</Text>
                      <TouchableOpacity style={styles.editButton}>
                        <Pencil color="#666" size={16} />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
                <TouchableOpacity style={styles.addButton} onPress={addNewPet}>
                  <View style={styles.plusCircle}>
                    <Plus color="#000" size={24} />
                  </View>
                  <Text style={styles.addText}>Add New</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* My Bookings */}
        <TouchableOpacity
          style={styles.navigationSection}
          onPress={() => router.push("/petparents/petparentstwo")}
        >
          <View style={styles.navigationContent}>
            <View style={styles.navigationIconContainer}>
              <Calendar color="#000" size={24} />
            </View>
            <Text style={styles.navigationTitle}>My Bookings</Text>
          </View>
          <ChevronRight color="#000" size={24} />
        </TouchableOpacity>

        {/* Requests */}
        <TouchableOpacity
          style={styles.navigationSection}
          onPress={navigateToBookingRequest}
        >
          <View style={styles.navigationContent}>
            <View style={styles.navigationIconContainer}>
              <FileText color="#000" size={24} />
            </View>
            <Text style={styles.navigationTitle}>Requests</Text>
          </View>
          <ChevronRight color="#000" size={24} />
        </TouchableOpacity>

        {/* Gallery */}
        <View style={styles.gallery}>
          <Text style={styles.galleryTitle}>My Gallery</Text>
          {allPetImages.length > 0 ? (
            <View style={styles.galleryGrid}>
              {allPetImages.slice(0, 4).map((image, index) => (
                <View key={index} style={styles.galleryImageContainer}>
                  <Image
                    source={{ uri: image.url }}
                    style={styles.galleryImage}
                  />
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noImagesText}>No images available</Text>
          )}
          {allPetImages.length > 4 && (
            <TouchableOpacity onPress={navigateToGallery}>
              <Text style={styles.seeMore}>see more</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity>
            <Text style={styles.reportText}>Report a problem?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton}>
            <LogOut color="#ff4444" size={20} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: heightPixel(160),
    paddingTop: heightPixel(20),
  },
  header: {
    padding: pixelSizeHorizontal(16),
    backgroundColor: "#fff",
  },
  backButton: {
    marginBottom: pixelSizeVertical(16),
  },
  backButtonCircle: {
    width: widthPixel(40),
    height: heightPixel(40),
    borderRadius: widthPixel(20),
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
  },
  profilecardcontainer: {
    position: "relative",
    width: "100%",
    maxWidth: widthPixel(400),
    marginHorizontal: "auto",
  },
  profilecardbackground: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: widthPixel(5),
    backgroundColor: "#FDCF00",
    borderRadius: widthPixel(12),
    transform: [{ translateX: widthPixel(4) }, { translateY: heightPixel(4) }],
  },
  profile: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: widthPixel(12),
    padding: pixelSizeHorizontal(12),
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  avatar: {
    width: widthPixel(60),
    height: heightPixel(60),
    borderRadius: widthPixel(30),
  },
  info: {
    marginLeft: pixelSizeHorizontal(12),
    alignItems: "center",
  },
  name: {
    fontSize: fontPixel(18),
    fontWeight: "bold",
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: pixelSizeVertical(4),
  },
  locationText: {
    marginLeft: pixelSizeHorizontal(4),
    color: "#666",
    fontSize: fontPixel(14),
  },
  dashboard: {
    padding: pixelSizeHorizontal(16),
    alignItems: "center",
  },
  dashboardTitle: {
    fontSize: fontPixel(24),
    fontWeight: "bold",
  },
  petProfilesContainer: {
    margin: pixelSizeHorizontal(16),
    backgroundColor: "#FFF8E1",
    borderRadius: widthPixel(12),
    overflow: "hidden",
  },
  petProfilesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: pixelSizeHorizontal(16),
  },
  petProfilesHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  paw: {
    marginRight: pixelSizeHorizontal(8),
  },
  pawText: {
    fontSize: fontPixel(20),
  },
  petProfilesHeaderText: {
    fontSize: fontPixel(18),
    fontWeight: "600",
  },
  petProfilesContent: {
    padding: pixelSizeHorizontal(16),
    paddingTop: 0,
  },
  petList: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  petItem: {
    alignItems: "center",
    position: "relative",
    width: "30%",
    marginBottom: pixelSizeVertical(16),
  },
  petImage: {
    width: widthPixel(80),
    height: heightPixel(80),
    borderRadius: widthPixel(40),
  },
  petName: {
    marginTop: pixelSizeVertical(8),
    fontSize: fontPixel(16),
  },
  editButton: {
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: "#fff",
    borderRadius: widthPixel(12),
    padding: pixelSizeHorizontal(4),
    borderWidth: 1,
    borderColor: "#eee",
  },
  addButton: {
    alignItems: "center",
    width: "30%",
  },
  plusCircle: {
    width: widthPixel(80),
    height: heightPixel(80),
    borderRadius: widthPixel(40),
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
  },
  addText: {
    marginTop: pixelSizeVertical(8),
    fontSize: fontPixel(16),
  },
  navigationSection: {
    margin: pixelSizeHorizontal(16),
    marginTop: 0,
    padding: pixelSizeHorizontal(16),
    backgroundColor: "#FFF8E1",
    borderRadius: widthPixel(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navigationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  navigationIconContainer: {
    marginRight: pixelSizeHorizontal(12),
  },
  navigationTitle: {
    fontSize: fontPixel(18),
    fontWeight: "600",
  },
  gallery: {
    padding: pixelSizeHorizontal(16),
  },
  galleryTitle: {
    fontSize: fontPixel(18),
    fontWeight: "600",
    marginBottom: pixelSizeVertical(16),
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  galleryImageContainer: {
    width: "48%",
    marginBottom: pixelSizeVertical(16),
  },
  galleryImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: widthPixel(8),
  },
  galleryImageCaption: {
    marginTop: pixelSizeVertical(4),
    fontSize: fontPixel(14),
    textAlign: "center",
  },
  noImagesText: {
    textAlign: "center",
    color: "#666",
    fontSize: fontPixel(16),
  },
  seeMore: {
    textAlign: "center",
    color: "#666",
    marginTop: pixelSizeVertical(16),
    textDecorationLine: "underline",
  },
  footer: {
    padding: pixelSizeHorizontal(16),
    alignItems: "center",
  },
  reportText: {
    color: "#666",
    marginBottom: pixelSizeVertical(16),
    fontSize: fontPixel(14),
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutText: {
    color: "#ff4444",
    fontSize: fontPixel(16),
    marginLeft: pixelSizeHorizontal(8),
  },
});
