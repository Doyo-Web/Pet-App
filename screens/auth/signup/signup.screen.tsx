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
  AntDesign,
  Entypo,
  FontAwesome,
  Fontisto,
  Ionicons,
  SimpleLineIcons,
  EvilIcons,
  MaterialCommunityIcons,
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
import AsyncStorage from "@react-native-async-storage/async-storage";

import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import { Toast } from "react-native-toast-notifications";
import SelectDropdown from "react-native-select-dropdown";
import { Linking } from "react-native";
import { json } from "stream/consumers";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import React from "react";


export default function SignUpScreen() {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [userInfo, setUserInfo] = useState({
    fullname: "",
    phonenumber: "",
    email: "",
    password: "",
    hearaboutus: "",
    role: "pet parents",
  });
  const [required, setRequired] = useState("");
  const [error, setError] = useState({
    password: "",
  });


  const data = [
    { title: "social media" },
  ];


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

  const handleSignup = async () => {
    // Check if all the required fields are filled
    if (
      !userInfo.fullname ||
      !userInfo.phonenumber ||
      !userInfo.email ||
      !userInfo.password
    ) {
      Toast.show("Please fill all the details", {
        type: "danger",
      });
      return;
    }
    
    setButtonSpinner(true);
    await axios
      .post(`${SERVER_URI}/registration`, {
        fullname: userInfo.fullname,
        phonenumber: userInfo.phonenumber,
        email: userInfo.email,
        password: userInfo.password,
        hearaboutus: userInfo.hearaboutus,
        role: userInfo.role,
      })
      .then(async (res) => {
        await AsyncStorage.setItem(
          "activation_token",
          res.data.activationToken
        );
        Toast.show(res.data.message, {
          type: "success",
        });
        setUserInfo({
          fullname: "",
          phonenumber: "",
          email: "",
          password: "",
          hearaboutus: "",
          role: "pet parents",
        });
        setButtonSpinner(false);
        router.push("/(routes)/verify");
      })
      .catch((error: any) => {
        setButtonSpinner(false);
        Toast.show(error.message, {
          type: "danger",
        });
      });
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.signInImage}
        source={require("@/assets/images/shape.png")}
      />
      <Text style={[styles.welcomeText, { fontFamily: "OtomanopeeOne" }]}>
        Create an account
      </Text>
      <Text style={styles.learningText}>Join us!</Text>
      <View style={styles.inputContainer}>
        <View>
          <TextInput
            style={[styles.input, { paddingLeft: 10 }]}
            keyboardType="default"
            value={userInfo.fullname}
            placeholder="Full Name"
            placeholderTextColor="#000000"
            onChangeText={(value) =>
              setUserInfo({ ...userInfo, fullname: value })
            }
          />

          <Image
            style={{
              position: "absolute",
              right: 12,
              top: 20,
              width: 18,
              height: 18,
              objectFit: "contain",
            }}
            source={require("@/assets/icons/fullnameicon.png")}
          />
          {/* <AntDesign
            style={{ position: "absolute", right: 12, top: 14 }}
            name="user"
            size={20}
            color={"#000000"}
          /> */}
        </View>

        <View>
          <TextInput
            style={[styles.input, { paddingLeft: 10 }]}
            keyboardType="numeric"
            value={userInfo.phonenumber}
            placeholder="Phone Number"
            placeholderTextColor="#000000"
            onChangeText={(value) =>
              setUserInfo({ ...userInfo, phonenumber: value })
            }
          />

          <Image
            style={{
              position: "absolute",
              right: 12,
              top: 20,
              width: 18,
              height: 18,
              objectFit: "contain",
            }}
            source={require("@/assets/icons/phonenumbericon.png")}
          />

          {/* <Ionicons
            style={{ position: "absolute", right: 12, top: 14 }}
            name="location-outline"
            size={24}
            color="#000"
          /> */}
        </View>

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
              top: 20,
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
            color={"#000"}
          /> */}

          {required && (
            <View style={commonStyles.errorContainer}>
              <Entypo name="cross" size={18} color={"red"} />
            </View>
          )}

          <View>
            <TextInput
              style={[styles.input, { paddingLeft: 10, marginTop: 10 }]}
              keyboardType="default"
              secureTextEntry={!isPasswordVisible}
              placeholder="Create a password"
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
                // <Ionicons name="eye-off-outline" size={23} color={"#000"} />
                <Image
                  style={{
                    position: "absolute",
                    right: 2,
                    top: 8,
                    width: 22,
                    height: 22,
                    objectFit: "contain",
                  }}
                  source={require("@/assets/icons/eyecuticon.png")}
                />
              ) : (
                <Ionicons
                  style={{ position: "absolute", right: 2, top: 8 }}
                  name="eye-outline"
                  size={22}
                  color={"#000"}
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

          <SelectDropdown
            data={data}
            onSelect={(selectedItem, index) => {
              setUserInfo({ ...userInfo, hearaboutus: selectedItem.title });
            }}
            renderButton={(selectedItem: any, isOpen: any) => {
              return (
                <View style={styles.dropdownButtonStyle}>
                  <Text style={styles.dropdownButtonTxtStyle}>
                    {(selectedItem && selectedItem.title) ||
                      "How did you hear about us ?"}
                  </Text>
                  <MaterialCommunityIcons
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    style={styles.dropdownButtonArrowStyle}
                  />
                </View>
              );
            }}
            renderItem={(item, index, isSelected) => {
              return (
                <View
                  style={{
                    ...styles.dropdownItemStyle,
                    ...(isSelected && { backgroundColor: "#fff" }),
                  }}
                >
                  <Text style={styles.dropdownItemTxtStyle}>{item.title}</Text>
                </View>
              );
            }}
            showsVerticalScrollIndicator={false}
            dropdownStyle={styles.dropdownMenuStyle}
          />

          <TouchableOpacity
            style={{
              padding: 16,
              borderRadius: 8,
              backgroundColor: "#00D0C3",
              marginTop: 15,
              width: responsiveWidth(90),
              height: responsiveHeight(8),
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={handleSignup}
          >
            {buttonSpinner ? (
              <ActivityIndicator size="small" color={"white"} />
            ) : (
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: hp("2.2%"),
                  fontFamily: "OtomanopeeOne",
                }}
              >
                Sign Up
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.bottomtext}>
            By signing in or signing up, I agree to Doyopets.com’s{" "}
            <Text
              style={{ color: "#206FF2" }}
              onPress={() => {
                () => router.push("/(routes)/signup");
              }}
            >
              Terms of service
            </Text>{" "}
            and{" "}
            <Text
              style={{ color: "#206FF2" }}
              onPress={() => {
                () => router.push("/(routes)/signup");
              }}
            >
              Privacy Policy
            </Text>
            , confirm that I am 18 years of age or older, and consent to
            receiving email communication.
          </Text>

          <View
            style={{
              borderBottomColor: "black",
              borderBottomWidth: StyleSheet.hairlineWidth,
              marginVertical: 10,
            }}
          />

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
              style={{ fontSize: hp("2%"), fontFamily: "Nunito_500Medium" }}
            >
              Already have a Doyo account?
            </Text>

            <Text
              style={{
                fontSize: 16,
                color: "#33D9CF",
                marginLeft: 2,
                fontFamily: "Nunito_500Medium",
                textDecorationLine: "underline",
              }}
              onPress={() => router.push("/(routes)/login")}
            >
              Sign in now.
            </Text>

            {/* <TouchableOpacity onPress={() => router.push("/(routes)/login")}>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "Raleway_600SemiBold",
                    color: "#2467EC",
                    marginLeft: 5,
                  }}
                >
                  Sign In
                </Text>
              </TouchableOpacity> */}
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  signInImage: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  welcomeText: {
    textAlign: "center",
    fontSize: hp("3%"),
  },
  learningText: {
    textAlign: "center",
    color: "#575757",
    fontSize: hp("2.2%"),
    marginTop: 5,
    fontFamily: "Nunito_400Regular",
  },

  inputContainer: {
    marginTop: 30,
    rowGap: 10,
  },
  input: {
    width: responsiveWidth(92),
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
    top: 24,
  },
  icon2: {
    position: "absolute",
    left: 23,
    top: 17.8,
    marginTop: -2,
  },
  forgotSection: {
    marginHorizontal: 16,
    textAlign: "right",
    fontSize: 16,
    marginTop: 10,
  },
  signupRedirect: {
    flexDirection: "row",
    marginHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },

  dropdownButtonStyle: {
    width: responsiveWidth(92),
    height: responsiveHeight(8),
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#000",
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "400",
    color: "#000",
  },
  dropdownButtonArrowStyle: {
    fontSize: 38,
    position: "absolute",
    right: 7,
    top: 14,
  },
  dropdownButtonIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
  dropdownMenuStyle: {
    backgroundColor: "#E9ECEF",
    borderRadius: 8,
  },
  dropdownItemStyle: {
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "500",
    color: "#151E26",
  },
  dropdownItemIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },

  bottomtext: {
    fontSize: hp("1.5%"),
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
});
