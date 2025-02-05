import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
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

const { width, height } = Dimensions.get("window");

export default function SignUpScreen() {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    { title: "friend" },
    { title: "advertisement" },
    { title: "other" },
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

   const validateEmail = (email: string) => {
     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     return emailRegex.test(email);
   };

   const validatePhoneNumber = (phone: string) => {
     const phoneRegex = /^\d{10}$/;
     return phoneRegex.test(phone);
   };

   const handleSignup = async () => {
     if (!userInfo.fullname.trim()) {
       Toast.show("Please enter your full name", { type: "warning" });
       return;
     }

     if (!validatePhoneNumber(userInfo.phonenumber)) {
       Toast.show("Please enter a valid 10-digit phone number", {
         type: "warning",
       });
       return;
     }

     if (!validateEmail(userInfo.email)) {
       Toast.show("Please enter a valid email address", { type: "warning" });
       return;
     }

     if (userInfo.password.length < 6) {
       Toast.show("Password must be at least 6 characters long", {
         type: "warning",
       });
       return;
     }

     if (!userInfo.hearaboutus) {
       Toast.show("Please select how you heard about us", { type: "warning" });
       return;
     }

     setIsLoading(true);

     try {
       const response = await axios.post(
         `${SERVER_URI}/registration`,
         userInfo
       );
       await AsyncStorage.setItem(
         "activation_token",
         response.data.activationToken
       );
       Toast.show(response.data.message, { type: "success" });
       setUserInfo({
         fullname: "",
         phonenumber: "",
         email: "",
         password: "",
         hearaboutus: "",
         role: "pet parents",
       });
       router.push("/(routes)/verify");
     } catch (error) {
       if (axios.isAxiosError(error)) {
         if (error.response) {
           Toast.show(error.response.data.message || "Registration failed", {
             type: "danger",
           });
         } else if (error.request) {
           Toast.show("Network error. Please check your internet connection.", {
             type: "danger",
           });
         } else {
           Toast.show("An unexpected error occurred. Please try again.", {
             type: "danger",
           });
         }
       } else {
         Toast.show("An unexpected error occurred. Please try again.", {
           type: "danger",
         });
       }
     } finally {
       setIsLoading(false);
     }
   };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
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
          <View style={styles.inputWrapper}>
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
              style={styles.inputIcon}
              source={require("@/assets/icons/fullnameicon.png")}
            />

            {/* <AntDesign
            style={{ position: "absolute", right: 12, top: 14 }}
            name="user"
            size={20}
            color={"#000000"}
          /> */}
          </View>

          <View style={styles.inputWrapper}>
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
              style={styles.inputIcon}
              source={require("@/assets/icons/phonenumbericon.png")}
            />

            {/* <Ionicons
            style={{ position: "absolute", right: 12, top: 14 }}
            name="location-outline"
            size={24}
            color="#000"
          /> */}
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.emailinput, { paddingLeft: 10 }]}
              keyboardType="email-address"
              value={userInfo.email}
              placeholder="Email"
              placeholderTextColor="#000000"
              onChangeText={(value) =>
                setUserInfo({ ...userInfo, email: value })
              }
            />

            <Image
              style={styles.inputIcon}
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

            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.passwordinput,
                  { paddingLeft: 10, marginTop: 10 },
                ]}
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
                    style={{ position: "absolute", right: 2, top: 10 }}
                    source={require("@/assets/icons/eyecuticon.png")}
                  />
                ) : (
                  <Ionicons
                    style={{ position: "absolute", right: 2, top: 8 }}
                    name="eye-outline"
                    size={20}
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

            <View style={styles.inputWrapper}>
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
                      <Text style={styles.dropdownItemTxtStyle}>
                        {item.title}
                      </Text>
                    </View>
                  );
                }}
                showsVerticalScrollIndicator={false}
                dropdownStyle={styles.dropdownMenuStyle}
              />
            </View>

            <TouchableOpacity
              style={[styles.signUpButton, isLoading && styles.disabledButton]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.signUpButtonText}>Sign Up</Text>
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
                style={{
                  fontSize: width * 0.04,
                  fontFamily: "Nunito_500Medium",
                }}
              >
                Already have a Doyo account?
              </Text>

              <Text
                style={{
                  fontSize: width * 0.04,
                  color: "#33D9CF",
                  marginLeft: width * 0.01,
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
  },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.05,
  },

  signInImage: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  welcomeText: {
    textAlign: "center",
    fontSize: width * 0.06,
    fontFamily: "OtomanopeeOne",
    marginBottom: height * 0.001,
    marginTop: height * 0.08,
  },
  learningText: {
    textAlign: "center",
    color: "#575757",
    fontSize: width * 0.04,
    fontFamily: "Nunito_400Regular",
    marginBottom: height * 0.06,
  },

  inputContainer: {
    width: "100%",
    alignItems: "center",
  },

  inputWrapper: {
    width: "100%",
    marginBottom: height * 0.01,
  },

  input: {
    width: "100%",
    height: height * 0.07,
    borderRadius: 8,
    fontSize: width * 0.04,
    backgroundColor: "white",
    color: "#000",
    borderWidth: 1,
    borderColor: "#000",
    paddingLeft: width * 0.03,
    paddingRight: width * 0.1,
  },

  passwordinput: {
    width: "100%",
    height: height * 0.07,
    borderRadius: 8,
    fontSize: width * 0.04,
    backgroundColor: "white",
    color: "#000",
    borderWidth: 1,
    borderColor: "#000",
    paddingLeft: width * 0.03,
    paddingRight: width * 0.1,
    marginTop: height * 0.01,
  },

  emailinput: {
    width: "100%",
    height: height * 0.07,
    borderRadius: 8,
    fontSize: width * 0.04,
    backgroundColor: "white",
    color: "#000",
    borderWidth: 1,
    borderColor: "#000",
    paddingLeft: width * 0.03,
    paddingRight: width * 0.1,
  },

  inputIcon: {
    position: "absolute",
    right: width * 0.03,
    top: height * 0.025,
    width: width * 0.04,
    height: width * 0.04,
    objectFit: "contain",
  },
  visibleIcon: {
    position: "absolute",
    right: width * 0.03,
    top: height * 0.025,
    width: width * 0.05,
    height: width * 0.05,
  },
  icon2: {
    position: "absolute",
    left: 24,
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
    width: "100%",
    height: height * 0.07,
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: height * 0.02,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "400",
    color: "#000",
  },
  dropdownButtonArrowStyle: {
    fontSize: 36,
    position: "absolute",
    right: 7,
    top: 10,
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
    fontSize: width * 0.032,
    textAlign: "center",
    marginBottom: height * 0.02,
  },

  signUpButton: {
    backgroundColor: "#00D0C3",
    borderRadius: 8,
    paddingVertical: height * 0.02,
    alignItems: "center",
    width: "100%",
    marginTop: height * 0.03,
    marginBottom: height * 0.02,
  },
  disabledButton: {
    opacity: 0.5,
  },
  signUpButtonText: {
    color: "white",
    fontSize: width * 0.05,
    fontFamily: "OtomanopeeOne",
  },
});
