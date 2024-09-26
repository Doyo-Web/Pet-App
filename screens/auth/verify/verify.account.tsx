import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useRef, useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

export default function VerifyAccountScreen() {
  const [code, setCode] = useState(new Array(4).fill(""));
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [activeInputIndex, setActiveInputIndex] = useState<number | null>(null);

  const inputs = useRef<any>([...Array(4)].map(() => React.createRef()));

  const handleInput = (text: any, index: any) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 3) {
      inputs.current[index + 1].current.focus();
    }

    if (text === "" && index > 0) {
      inputs.current[index - 1].current.focus();
    }
  };

  const handleSumbit = async () => {
    const otp = code.join("");
    const activation_token = await AsyncStorage.getItem("activation_token");

    const otpString = String(otp);
    const activationTokenString = String(activation_token);

    await axios
      .post(`${SERVER_URI}/activate-user`, {
        activation_token: activationTokenString,
        activation_code: otpString,
      })
      .then((res: any) => {
        Toast.show("Your account activated successfully!", {
          type: "success",
        });
        setCode(new Array(4).fill(""));
        router.push("/(routes)/login");
      })
      .catch((error: any) => {
        Toast.show(error.message, {
          type: "danger",
        });
      });
  };

  const handleresendotp = async () => {
    const activation_token = await AsyncStorage.getItem("activation_token");

    await axios
      .post(`${SERVER_URI}/resendotp`, {
        token: activation_token,
      })
      .then(async (res) => {
        await AsyncStorage.setItem(
          "activation_token",
          res.data.activationToken
        );
        Toast.show(res.data.message, {
          type: "success",
        });
      })
      .catch((error: any) => {
        console.log(error);
        Toast.show(error.message, {
          type: "danger",
        });
      });
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.verifyshape}
        source={require("@/assets/images/verify-shape.png")}
      />
      <Text style={[styles.headerText, { fontFamily: "OtomanopeeOne" }]}>
        Enter Verification Code
      </Text>
      <Text style={styles.subText}>
        We have sent a 4-digit One Time Password to your registered mobile
        number.
      </Text>

      <Image
        style={styles.verifypuppyImage}
        source={require("@/assets/images/Verification.png")}
      />

      <View style={styles.inputContainer}>
        {code.map((_, index) => (
          <TextInput
            key={index}
            style={[
              styles.inputBox,
              {
                backgroundColor:
                  code[index] || index === activeInputIndex
                    ? "#00D0C3" // When filled or active
                    : "rgba(0, 208, 195, 0.2)", // Default color with 20% opacity
              },
              { color: code[index] ? "#fff" : "rgba(0, 208, 195, 0.2)" },
            ]}
            keyboardType="number-pad"
            maxLength={1}
            onChangeText={(text) => handleInput(text, index)}
            value={code[index]}
            ref={inputs.current[index]}
            autoFocus={index === 0}
          />
        ))}
      </View>
      <View style={{ marginTop: 10 }}>
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
          onPress={handleSumbit}
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
              Verify
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.resendOtp}>
        <Text style={{ fontSize: hp("2%"), fontFamily: "Nunito_500Medium" }}>
          Didn’t receive the OTP ?
        </Text>

        <TouchableOpacity onPress={handleresendotp}>
          <Text
            style={{
              fontSize: 16,
              color: "#33D9CF",
              marginLeft: 2,
              fontFamily: "Nunito_600SemiBold",
            }}
          >
            RESEND OTP
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },

  verifyshape: {
    position: "absolute",
    top: 0,
    right: 0,
  },

  headerText: {
    fontSize: 24,
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Nunito_500Medium",
  },

  verifypuppyImage: {
    width: wp("75%"),
    height: hp("25%"),
    objectFit: "contain",
    marginBottom: 20,
  },

  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  inputBox: {
    width: 70,
    height: 70,
    borderWidth: 1,
    borderColor: "#00D0C3",
    textAlign: "center",
    marginRight: 10,
    borderRadius: 7,
    fontSize: 20,
  },

  resendOtp: {
    flexDirection: "row",
    marginHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Nunito_500Medium",
    marginTop: 10,
  },

  loginLink: {
    flexDirection: "row",
    marginTop: 30,
  },
  loginText: {
    color: "#3876EE",
    marginLeft: 5,
    fontSize: 16,
  },
  backText: { fontSize: 16 },
});
