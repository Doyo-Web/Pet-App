import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFonts,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_400Regular,
} from "@expo-google-fonts/nunito";
import { router } from "expo-router";
import { Fontisto } from "@expo/vector-icons";
import { useState } from "react";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import { Toast } from "react-native-toast-notifications";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import React from "react";

export default function ForgotPassword() {

  const [email, setEmail] = useState("");

  let [fontsLoaded, fontError] = useFonts({
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_400Regular,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const handleforgotpassword = async () => {
    await axios
      .post(`${SERVER_URI}/forgot-password`, {
        email: email
      })
      .then(async (res) => {
        Toast.show(res.data.message, {
          type: "success",
        });
        router.push("/(routes)/login");
      })
      .catch((error) => {
        console.log(error);
        Toast.show("Email or password is not correct!", {
          type: "danger",
        });
      });
  }

  return (
    <View style={styles.container}>
      <Image
        style={styles.forgotImage}
        source={require("@/assets/images/forgotshape.png")}
      />
      <Text
        style={{
          fontSize: hp("3%"),
          textAlign: "center",
          marginBottom: 10,
          fontFamily: "OtomanopeeOne",
        }}
      >
        Forgot your password?
      </Text>

      <Text
        style={{
          fontFamily: "Nunito_400Regular",
          textAlign: "center",
          fontSize: hp("1.8%"),
        }}
      >
        To reset your password, type the full email address you used to sign up
        for Doyopets.com and we’ll send you an e-mail to walk you through
        resetting your password.
      </Text>

      <Image
        style={styles.teddyImage}
        source={require("@/assets/images/forgot_password_image.png")}
      />


      <View style={styles.emailcontainer}>
        <TextInput
          style={[styles.input, { fontFamily: "Nunito_400Regular" }]}
          placeholder="Email"
          keyboardType="email-address"
          placeholderTextColor="#000000"
          onChangeText={(value) => {
            setEmail(value);
          }}
        />

        <Image
          style={{
            position: "absolute",
            right: 12,
            top: 22,
            width: 20,
            height: 16,
            objectFit: "contain",
          }}
          source={require("@/assets/icons/emailicon.png")}
        />

        {/* <Fontisto
          style={{ position: "absolute", right: 12, top: 17.8 }}
          name="email"
          size={20}
          color={"#A1A1A1"}
        /> */}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleforgotpassword}>
        <Text style={[styles.buttonText, { fontFamily: "OtomanopeeOne" }]}>
          Login
        </Text>
      </TouchableOpacity>
      <View style={styles.loginLink}>
        <Text
          style={[
            styles.backText,
            { fontFamily: "Nunito_600SemiBold", fontSize: hp("2.2%") },
          ]}
        >
          Already have a Doyo account
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text
            style={[
              styles.loginText,
              {
                fontFamily: "Nunito_600SemiBold",
                fontSize: hp("2.2%"),
                textDecorationLine: "underline",
              },
            ]}
          >
            Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  forgotImage: {
    position: "absolute",
    top: 0,
    right: 0,
  },

  headerText: {
    fontSize: hp("25%"),
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
    fontFamily: "OtomanopeeOne",
  },

  teddyImage: {
    width: wp("75%"),
    height: hp("28%"),
    objectFit: "contain",
    marginVertical: 20,
  },

  emailcontainer: {
    width: responsiveWidth(90),
    height: responsiveHeight(8),
  },

  input: {
    width: responsiveWidth(90),
    height: responsiveHeight(8),
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
    color: "#000",
    padding: 10,
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#F96247",
    width: responsiveWidth(90),
    height: responsiveHeight(8),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 80,
  },

  buttonText: {
    color: "white",
    fontSize: hp("2.2%"),
  },
  loginLink: {
    flexDirection: "row",
    marginTop: 30,
  },
  loginText: {
    color: "#F96247",
    marginLeft: 5,
    fontSize: 16,
  },

  backText: {
    fontSize: 16,
    color: "#303030",
  },
});
