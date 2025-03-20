import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useRouter } from "expo-router";
import useUser from "@/hooks/auth/useUser";
import { RectButton } from "react-native-gesture-handler";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

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
        <RectButton style={styles.backButton} onPress={()=>router.push("/")}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </RectButton>
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
    paddingHorizontal: "5%",
    paddingTop: "5%",
    marginTop: "4%",
  },
  backButton: {
    padding: "2%",
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 50,
  },
  logo: {
    width: "30%",
    height: "10%",
    marginLeft: "5%",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: "10%",
    marginTop: "5%",
  },
  checkmarkContainer: {
    width: "50%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: "5%",
  },
  checkmark: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    alignItems: "center",
    marginTop: "5%",
  },
  awesomeContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: "6%",
    paddingVertical: "1%",
    marginBottom: "5%",
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
    marginTop: "34%",
    width: "100%",
  },
  viewProfileButton: {
    backgroundColor: "#FDCF00",
    borderRadius: 10,
    paddingVertical: "3%",
    paddingHorizontal: "5%",
    width: "100%",
    alignItems: "center",
    marginBottom: "2.5%",
  },
  viewProfileText: {
    color: "#000",
    fontFamily: "Nunito_700Bold",
    fontWeight: "bold",
  },
  homePageButton: {
    borderColor: "#00D1C1",
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: "3%",
    paddingHorizontal: "5%",
    width: "100%",
    alignItems: "center",
  },
  homePageText: {
    color: "#00D1C1",
    fontWeight: "bold",
  },
});
