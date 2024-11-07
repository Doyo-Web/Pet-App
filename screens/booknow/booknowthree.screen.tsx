import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Star } from "lucide-react-native";
import { router } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";

interface Host {
  id: string;
  name: string;
  location: string;
  image: ImageSourcePropType;
  rating: number;
}

const hosts: Host[] = [
  {
    id: "1",
    name: "Beatrice Oliver",
    location: "Mumbai",
    image: require("@/assets/images/person-2.png"),
    rating: 5,
  },
  {
    id: "2",
    name: "Rahul Sharma",
    location: "Mumbai",
    image: require("@/assets/images/person-1.png"),
    rating: 5,
  },
  {
    id: "3",
    name: "Atul Singh",
    location: "Mumbai",
    image: require("@/assets/images/person-3.png"),
    rating: 5,
  },
  {
    id: "4",
    name: "Shreya Rajan",
    location: "Mumbai",
    image: require("@/assets/images/person-4.png"),
    rating: 5,
  },
];

interface HostCardProps {
  host: Host;
}

 const handleBookNow = () => {
   router.push("./booknowfour");
 };

const HostCard: React.FC<HostCardProps> = ({ host }) => (
  <TouchableOpacity style={styles.card}>
    <View style={styles.cardContent}>
      <Image source={host.image} style={styles.avatar} />
      <View style={styles.hostInfo}>
        <Text style={styles.hostName}>{host.name}</Text>
        <Text style={styles.location}>{host.location}</Text>
      </View>
      <View style={styles.ratingContainer}>
        <View style={styles.stars}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={16} fill="#FDD00D" color="#FDD00D" />
          ))}
        </View>
        <TouchableOpacity>
          <Text style={styles.knowMore}>know more</Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

export default function BookingScreenThree() {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          router.push("/(drawer)/(tabs)/booknow/booknowtwo");
        }}
      >
        <View style={styles.boardingboxtwo}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              router.push("/(drawer)/(tabs)/booknow/booknowtwo");
            }}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerboardingbox}>Boarding</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Select the Host for your pet</Text>

      <ScrollView style={styles.scrollView}>
        {hosts.map((host) => (
          <HostCard key={host.id} host={host} />
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.confirmButton} onPress={handleBookNow}>
        <Text style={styles.confirmButtonText}>Confirm Booking</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 190,
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B4A",
    padding: 16,
    borderRadius: 8,
    margin: 16,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 16,
    marginBottom: 20,
    marginTop: 20,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: "#FF6B4A",
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 24,
    marginRight: 12,
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: "#666",
  },
  ratingContainer: {
    alignItems: "flex-end",
  },
  stars: {
    flexDirection: "row",
    marginBottom: 4,
  },
  knowMore: {
    color: "#FF6B4A",
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: "#FF6B4A",
    marginTop: 30,
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
