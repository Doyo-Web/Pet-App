import { View, Text, Image, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import { styles } from '@/styles/welcome/welcome';
import { router, SplashScreen } from "expo-router";
import { useFonts } from 'expo-font';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const WelcomeScreen = () => {

    return (
      <View style={styles.container}>
          <Image
                style={styles.welcomeImage}
                source={require("@/assets/images/welcome_shape.png")}
              />
        <Image
          style={styles.sparkle}
          source={require("@/assets/images/sparkle.png")}
        />

        <View style={styles.logobox}>
          <Image
            style={styles.logo}
            source={require("@/assets/images/logo.png")}
          />
          <Text style={[styles.logotext, { fontFamily: "OtomanopeeOne" }]}>
            Your Pet’s Second home
          </Text>
        </View>

        <View style={styles.btnbox}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/(routes)/signup")}
          >
            <Text
              style={{
                color: "#FFF",
                textAlign: "center",
                fontSize: hp("2.2%"),
                fontFamily: "OtomanopeeOne",
              }}
            >
              I am new here
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonlogin}
            onPress={() => router.push("/(routes)/login")}
          >
            <Text
              style={{
                color: "#F96247",
                textAlign: "center",
                fontSize: hp("2.2%"),
                fontFamily: "OtomanopeeOne",
              }}
            >
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
}

export default WelcomeScreen