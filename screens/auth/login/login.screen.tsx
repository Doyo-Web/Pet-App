import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  Entypo,
  FontAwesome,
  Fontisto,
  Ionicons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFonts,
  Raleway_700Bold,
  Raleway_600SemiBold,
} from "@expo-google-fonts/raleway";
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_700Bold,
  Nunito_600SemiBold,
} from "@expo-google-fonts/nunito";
import { useState } from "react";
import { commonStyles } from "@/styles/common/common.styles";
import { router } from "expo-router";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import { Toast } from "react-native-toast-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import React from "react";

export default function LoginScreen() {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [userInfo, setUserInfo] = useState({
    email: "",
    password: "",
  });
  const [required, setRequired] = useState("");
  const [error, setError] = useState({
    password: "",
  });

  let [fontsLoaded, fontError] = useFonts({
    Raleway_600SemiBold,
    Raleway_700Bold,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_700Bold,
    Nunito_600SemiBold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  // const handlePasswordValidation = (value: string) => {
  //   const password = value;
  //   const passwordSpecialCharacter = /(?=.*[!@#$&*])/;
  //   const passwordOneNumber = /(?=.*[0-9])/;
  //   const passwordSixValue = /(?=.{6,})/;

  //   if (!passwordSpecialCharacter.test(password)) {
  //     setError({
  //       ...error,
  //       password: "Write at least one special character",
  //     });
  //     setUserInfo({ ...userInfo, password: "" });
  //   } else if (!passwordOneNumber.test(password)) {
  //     setError({
  //       ...error,
  //       password: "Write at least one number",
  //     });
  //     setUserInfo({ ...userInfo, password: "" });
  //   } else if (!passwordSixValue.test(password)) {
  //     setError({
  //       ...error,
  //       password: "Write at least 6 characters",
  //     });
  //     setUserInfo({ ...userInfo, password: "" });
  //   } else {
  //     setError({
  //       ...error,
  //       password: "",
  //     });
  //     setUserInfo({ ...userInfo, password: value });
  //   }
  // };

  const handleSignIn = async () => {
    await axios
      .post(`${SERVER_URI}/login`, {
        email: userInfo.email,
        password: userInfo.password,
      })
      .then(async (res) => {
        await AsyncStorage.setItem("access_token", res.data.accessToken);
         await AsyncStorage.setItem("refresh_token", res.data.refreshToken);
        router.push("/(tabs)");
      })
      .catch((error) => {
        console.log(error);
        Toast.show("Email or password is not correct!", {
          type: "danger",
        });
      });
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.signInImage}
        source={require("@/assets/images/loginshape.png")}
      />
      <Text style={[styles.welcomeText, { fontFamily: "OtomanopeeOne" }]}>
        Log in
      </Text>
      <Text style={styles.learningText}>Hello, Welcome back!</Text>

      <Image
        style={styles.puppyImage}
        source={require("@/assets/images/Log_In_Image.png")}
      />

      <View style={styles.inputContainer}>
        <View>
          <TextInput
            style={[styles.input, { paddingLeft: 10 }]}
            keyboardType="email-address"
            value={userInfo.email}
            placeholder="Email"
            placeholderTextColor="#000000"
            onChangeText={(value) => setUserInfo({ ...userInfo, email: value })}
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
          {required && (
            <View style={commonStyles.errorContainer}>
              <Entypo name="cross" size={18} color={"red"} />
            </View>
          )}
          <View style={{ marginTop: 15 }}>
            <TextInput
              style={[styles.input, { paddingLeft: 10 }]}
              keyboardType="default"
              secureTextEntry={!isPasswordVisible}
              defaultValue=""
              placeholder="Password"
              placeholderTextColor="#000000"
              onChangeText={(value) =>
                setUserInfo({ ...userInfo, password: value })
              }
              // onChangeText={handlePasswordValidation}
            />
            <TouchableOpacity
              style={styles.visibleIcon}
              onPress={() => setPasswordVisible(!isPasswordVisible)}
            >
              {isPasswordVisible ? (
                <Image
                  style={{
                    position: "absolute",
                    right: 2,
                    top: 5,
                    width: 22,
                    height: 22,
                    objectFit: "contain",
                  }}
                  source={require("@/assets/icons/eyecuticon.png")}
                />
              ) : (
                // <Ionicons name="eye-off-outline" size={23} color={"#747474"} />
                <Ionicons
                  style={{ position: "absolute", right: 2, top: 5 }}
                  name="eye-outline"
                  size={23}
                  color={"#747474"}
                />
              )}
            </TouchableOpacity>
          </View>
          {error.password && (
            <View style={[commonStyles.errorContainer, { top: 145 }]}>
              <Entypo name="cross" size={18} color={"red"} />
              <Text style={{ color: "red", fontSize: 11, marginTop: -1 }}>
                {error.password}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={{
              padding: 16,
              borderRadius: 8,
              backgroundColor: "#FDCF00",
              marginTop: 35,
              width: responsiveWidth(90),
              height: responsiveHeight(8),
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={handleSignIn}
          >
            {buttonSpinner ? (
              <ActivityIndicator size="small" color={"white"} />
            ) : (
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: 16,
                  fontFamily: "OtomanopeeOne",
                }}
              >
                Log In
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.signinbtnbox}>
            <TouchableOpacity
              onPress={() => router.push("/(routes)/forgotpassword")}
            >
              <Text
                style={[
                  styles.forgotSection,
                  { fontFamily: "Nunito_500Medium", color: "#FDCF00" },
                ]}
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 20,
              gap: 10,
            }}
          >
            <TouchableOpacity>
              <FontAwesome name="google" size={30} />
            </TouchableOpacity>
            <TouchableOpacity>
              <FontAwesome name="github" size={30} />
            </TouchableOpacity>
          </View> */}

            <View style={styles.signupRedirect}>
              <Text
                style={{ fontSize: hp("2.2%"), fontFamily: "Nunito_500Medium" }}
              >
                Don’t have a Doyo account?
              </Text>
              <TouchableOpacity onPress={() => router.push("/(routes)/signup")}>
                <Text
                  style={{
                    fontSize: hp("2.2%"),
                    fontFamily: "Nunito_500Medium",
                    color: "#FDCF00",
                    marginLeft: 2,

                    textDecorationLine: "underline",
                  }}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    paddingTop: 120,
  },

  signInImage: {
    position: "absolute",
    top: 10,
    right: 0,
  },
  welcomeText: {
    textAlign: "center",
    fontSize: hp("3%"),
  },
  learningText: {
    textAlign: "center",
    color: "#575757",
    fontSize: hp("2%"),
    marginTop: 5,
    fontFamily: "Nunito_400Regular",
  },

  puppyImage: {
    width: wp("75%"),
    height: hp("25%"),
    objectFit: "contain",
    marginTop: 20,
  },

  inputContainer: {
    marginHorizontal: 16,
    marginTop: 30,
    rowGap: 30,
  },
  input: {
    width: responsiveWidth(90),
    height: responsiveHeight(8),
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "white",
    color: "#A1A1A1",
    borderWidth: 1,
    borderColor: "#000",
  },
  visibleIcon: {
    position: "absolute",
    right: 12,
    top: 15,
  },
  icon2: {
    position: "absolute",
    left: 23,
    top: 17.8,
    marginTop: -2,
  },
  forgotSection: {
    textAlign: "center",
    fontSize: hp("2.2%"),
    marginTop: 10,
  },

  signinbtnbox: {
    marginTop: 20,
  },

  signupRedirect: {
    flexDirection: "row",
    marginHorizontal: 16,
    justifyContent: "center",
    marginBottom: 20,
  },
});
