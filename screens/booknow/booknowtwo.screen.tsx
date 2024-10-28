import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialIcons";
import { router } from "expo-router";

export default function BookingScreenTwo() {
  const [currentHostIndex, setCurrentHostIndex] = useState(0);

  const hosts = [
    {
      name: "Beatrice Oliver",
      location: "Mumbai",
      rating: 5,
      image: "https://picsum.photos/id/64/300/200",
    },
    {
      name: "John Doe",
      location: "Delhi",
      rating: 4,
      image: "https://picsum.photos/id/65/300/200",
    },
    {
      name: "Jane Smith",
      location: "Bangalore",
      rating: 5,
      image: "https://picsum.photos/id/66/300/200",
    },
  ];

  const nextHost = () => {
    setCurrentHostIndex((prevIndex) => (prevIndex + 1) % hosts.length);
  };

  const prevHost = () => {
    setCurrentHostIndex(
      (prevIndex) => (prevIndex - 1 + hosts.length) % hosts.length
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          router.push("/(drawer)/(tabs)/booknow");
        }}
      >
        <View style={styles.boardingboxtwo}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              router.push("/(drawer)/(tabs)/booknow");
            }}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerboardingbox}>Boarding</Text>
        </View>
      </TouchableOpacity>
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="paw" size={24} color="white" />
            </View>
            <Text style={styles.cardTitle}>Booking Confirmation Process</Text>
          </View>
          <Text style={styles.stepText}>
            <Text style={styles.boldText}>Step 1:</Text> Your request will be
            acknowledged by our hosts within 12 hours. You will receive a
            notification in your notification bar and an email update regarding
            the status.
          </Text>
          <Text style={styles.stepText}>
            <Text style={styles.boldText}>Step 2:</Text> Once the hosts accept
            your request, you can select your preferred host from the accepted
            hosts to proceed with the booking.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Matched Pawfect Hosts</Text>

        <View style={styles.hostCard}>
          <Image
            source={{ uri: hosts[currentHostIndex].image }}
            style={styles.hostImage}
          />

          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name={
                  i < hosts[currentHostIndex].rating ? "star" : "star-outline"
                }
                size={20}
                color="#FFD700"
              />
            ))}
          </View>
          <View style={styles.hostInfo}>
            <View style={styles.hostHeader}>
              <Text style={styles.hostName}>
                {hosts[currentHostIndex].name}
              </Text>

              <View style={styles.locationContainer}>
                <Ionicons name="location" size={16} color="#666" />
                <Text style={styles.locationText}>
                  {hosts[currentHostIndex].location}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.viewMoreButton}>
              <Text style={styles.viewMoreText}>View More</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sliderButtons}>
          <TouchableOpacity onPress={prevHost} style={styles.sliderButton}>
            <AntDesign name="arrowleft" size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity onPress={nextHost} style={styles.sliderButton}>
            <AntDesign name="arrowright" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.bookNowButton}>
          <Text style={styles.bookNowText}>Book Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5EB",
    paddingBottom: 140,
  },

  headerboardingbox: {
    fontSize: 18,
    color: "#fff",
    fontFamily: "OtomanopeeOne",
  },

  boardingboxtwo: {
    backgroundColor: "#F96247",
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
      paddingHorizontal: 10,
    height: 70,
    marginHorizontal: 16,
  },

  backButton: {
    zIndex: 1,
    width: 36,
    height: 36,
    position: "absolute",
    left: 10,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 50,
  },

  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },

  toparrow: {
    padding: 10,
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    backgroundColor: "#FF6B6B",
    borderRadius: 20,
    padding: 8,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  stepText: {
    marginBottom: 8,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: "bold",
  },
  sectionTitle: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  hostCard: {
    backgroundColor: "#FFECD1",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  hostImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  hostInfo: {
    flexDirection: "row",
    marginBottom: 12,
    justifyContent: "space-between",
  },

  hostHeader: {
    marginBottom: 8,
  },
  hostName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  ratingContainer: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 20,
    backgroundColor: "#FFFFFF33",
    flexDirection: "row",
    position: "absolute",
    top: 30,
    right: 30,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationText: {
    marginLeft: 4,
    color: "#666",
  },
  viewMoreButton: {
    width: 140,
    height: 45,
    backgroundColor: "#FFD700",
    borderRadius: 4,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  viewMoreText: {
    fontWeight: "bold",
  },
  sliderButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  sliderButton: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 50,
    padding: 10,
    marginLeft: 8,
  },
  bookNowButton: {
    backgroundColor: "#FF6B6B",
    padding: 16,
    alignItems: "center",
    margin: 16,
    borderRadius: 8,
  },
  bookNowText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
