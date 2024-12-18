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

export default function PetParentProfile() {
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpand = () => {
    setExpanded(!expanded);
    Animated.spring(animation, {
      toValue: expanded ? 0 : 1,
      useNativeDriver: true,
    }).start();
  };

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
          <View style={styles.profile}>
            <Image
              source={{ uri: "https://placekitten.com/100/100" }}
              style={styles.avatar}
            />
            <View style={styles.info}>
              <Text style={styles.name}>Ritu Gupta</Text>
              <View style={styles.location}>
                <MapPin color="#666" size={14} />
                <Text style={styles.locationText}>Coimbatore</Text>
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
                <View style={styles.petItem}>
                  <Image
                    source={{ uri: "https://placekitten.com/200/200" }}
                    style={styles.petImage}
                  />
                  <Text style={styles.petName}>Mojito</Text>
                  <TouchableOpacity style={styles.editButton}>
                    <Pencil color="#666" size={16} />
                  </TouchableOpacity>
                </View>

                <View style={styles.petItem}>
                  <Image
                    source={{ uri: "https://placedog.net/200/200" }}
                    style={styles.petImage}
                  />
                  <Text style={styles.petName}>Rocky</Text>
                  <TouchableOpacity style={styles.editButton}>
                    <Pencil color="#666" size={16} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.addButton}>
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
          onPress={() =>
            router.push("/petparents/petparentstwo")
          }
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
        <TouchableOpacity style={styles.navigationSection}>
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
          <View style={styles.galleryGrid}>
            <Image
              source={{ uri: "https://placekitten.com/300/300" }}
              style={styles.galleryImage}
            />
            <Image
              source={{ uri: "https://placedog.net/300/300" }}
              style={styles.galleryImage}
            />
            <Image
              source={{ uri: "https://placekitten.com/301/301" }}
              style={styles.galleryImage}
            />
            <Image
              source={{ uri: "https://placedog.net/301/301" }}
              style={styles.galleryImage}
            />
          </View>
          <TouchableOpacity>
            <Text style={styles.seeMore}>see more</Text>
          </TouchableOpacity>
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
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  info: {
    marginLeft: 12,
    alignItems: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationText: {
    marginLeft: 4,
    color: "#666",
  },
  dashboard: {
    padding: 16,
    alignItems: "center",
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  petProfilesContainer: {
    margin: 16,
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    overflow: "hidden",
  },
  petProfilesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  petProfilesHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  paw: {
    marginRight: 8,
  },
  pawText: {
    fontSize: 20,
  },
  petProfilesHeaderText: {
    fontSize: 18,
    fontWeight: "600",
  },
  petProfilesContent: {
    padding: 16,
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
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  petName: {
    marginTop: 8,
    fontSize: 16,
  },
  editButton: {
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#eee",
  },
  addButton: {
    alignItems: "center",
    width: "30%",
  },
  plusCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
  },
  addText: {
    marginTop: 8,
    fontSize: 16,
  },
  navigationSection: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navigationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  navigationIconContainer: {
    marginRight: 12,
  },
  navigationTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  gallery: {
    padding: 16,
  },
  galleryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  galleryImage: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  seeMore: {
    textAlign: "center",
    color: "#666",
    marginTop: 16,
    textDecorationLine: "underline",
  },
  footer: {
    padding: 16,
    alignItems: "center",
  },
  reportText: {
    color: "#666",
    marginBottom: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutText: {
    color: "#ff4444",
    fontSize: 16,
    marginLeft: 8,
  },
});
