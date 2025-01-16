import React, { useEffect, useState } from "react";
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
import { router, useFocusEffect, useRouter } from "expo-router";
import useUser from "@/hooks/auth/useUser";

const ProfileSuccessScreen = () => {

  const router = useRouter();
  const { loading, user, refetch, setRefetch } = useUser();
  const [firstVisit, setFirstVisit] = useState(true);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     setRefetch(true);
  //     setTimeout(() => {
  //       router.push("/(tabs)");
  //     }, 2000);
  //     return () => {
  //       console.log("ProfileSuccessScreen unfocused");
  //     };
  //   }, [])
  // );

  // useEffect(() => {

  //   if (!loading && firstVisit) {

  //     setTimeout(() => {

  //       if (user) {

  //         const hasRequiredFields = Boolean(
  //           user?.fullname &&
  //             user?.phonenumber &&
  //             user?.email &&
  //             user.profession !== "Freelancer" &&
  //             user?.avatar?.url
  //         );

  //         // Navigate based on field availability
  //         if (hasRequiredFields) {
  //           router.push("/(tabs)");
  //         } else {
  //           router.push("/(tabs)/editprofile");
  //         }
  //       } else {
  //         console.log("No user data available.");
  //       }
  //     }, 2000); // Delay of 2 seconds

  //     setFirstVisit(false); // Set to false after first visit
  //   } else {
  //     console.log("Still loading user data or it's not the first visit...");
  //   }
  // }, [loading, user, router, firstVisit]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Image
        style={styles.backgroundimage}
        source={require("@/assets/images/profilesuccessbackground.png")}
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
            Your Pet Profile{"\n"}is successfully created!
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.viewProfileButton}
            onPress={() => router.push("/petparents")}
          >
            <Text style={styles.viewProfileText}>View your Profile</Text>
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

export default ProfileSuccessScreen;

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
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  checkmark: {
    width: 200,
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
    borderColor: "#000",
    borderWidth: 2,
    shadowColor: "#F96247",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  awesomeText: {
    color: "#000",
    fontSize: 18,
    fontFamily: "OtomanopeeOne",
  },
  descriptionText: {
    color: "#000",
    fontSize: 18,
    textAlign: "center",
    lineHeight: 25,
    marginTop: 20,
    fontFamily: "Nunito_600SemiBold",
  },
  buttonContainer: {
    marginTop: 68,
    width: "100%",
  },
  viewProfileButton: {
    backgroundColor: "#FDCF00",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  viewProfileText: {
    color: "#000",
    fontFamily: "Nunito_700Bold",
    fontSize: 18,
    fontWeight: "bold",
  },
  homePageButton: {
    borderColor: "#00D1C1",
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
  },
  homePageText: {
    color: "#00D1C1",
    fontSize: 18,
    fontWeight: "bold",
  },
});
