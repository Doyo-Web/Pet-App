import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router, useRouter } from "expo-router";

const BookSuccessScreen = () => {

  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Image
        style={styles.backgroundimage}
        source={require("@/assets/images/hostsuccessbackground.png")}
      />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Image
          source={require("@/assets/images/whitedoyo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.checkmarkContainer}>
          <Image
            source={require("@/assets/images/checkmark.png")}
            style={styles.checkmark}
          />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.awesomeContainer}>
            <Text style={styles.awesomeText}>Awesome!</Text>
          </View>
          <Text style={styles.descriptionText}>
            Your Host Profile{"\n"}is successfully created!
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.viewProfileButton}>
            <Text style={styles.viewProfileText}>View your Host Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.homePageButton}
            onPress={() => router.push("/")}
          >
            <Text style={styles.homePageText}>Go to Homepage</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default BookSuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundimage: {
    position: "absolute",
    top: 0,
    left: 0,
    borderRadius: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    marginTop: 15,
  },
  backButton: {
    padding: 5,
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 50,
  },
  logo: {
    width: 100,
    height: 40,
    marginLeft: 20,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: 20,
  },
  checkmarkContainer: {
    width: 200, // Adjusted size
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  checkmark: {
    width: 200, // Adjusted size to match the UI
    height: 200,
    objectFit: "cover",
  },
  textContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  awesomeContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 4,
    marginBottom: 20,
    borderColor: "#000", // Slight border color to make it pop
    borderWidth: 2,
    shadowColor: "#F96247", // Shadow color like in the UI (reddish-orange)
    shadowOffset: { width: 4, height: 4 }, // Light shadow
    shadowOpacity: 0.5,
    shadowRadius: 8, // Blurring the shadow to make it smooth
    elevation: 6, // Slight elevation for Android
  },
  awesomeText: {
    color: "#000", // Black text like the UI
    fontSize: 18,
    fontFamily: "OtomanopeeOne",
  },
  descriptionText: {
    color: "#000", // Text is in black, matching UI
    fontSize: 18,
    textAlign: "center",
    lineHeight: 25, // To better handle the text spacing
    marginTop: 20,
    fontFamily: "Nunito_600SemiBold",
  },
  buttonContainer: {
    marginTop: 68, // Adjusted to move buttons upward as per UI
    width: "100%",
  },
  viewProfileButton: {
    backgroundColor: "#00D1C1", // Matches button background color
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
    marginBottom: 10, // Adjusted for spacing
  },
  viewProfileText: {
    color: "#000",
    fontFamily: "Nunito_700Bold",
    fontSize: 18,
    fontWeight: "bold",
  },
  homePageButton: {
    borderColor: "#00D1C1", // Matches border color
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
  },
  homePageText: {
    color: "#00D1C1", // Text color matches UI button
    fontSize: 18,
    fontWeight: "bold",
  },
});
