import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";


export const styles = StyleSheet.create({
  container: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  welcomeImage: {
    position: "absolute",
    top: 0,
    left: 0,
  },

  sparkle: {
    position: "absolute",
    right: wp("20%"),
    top: hp("13%"),
    width: wp("14%"),
    height: wp("14%"),
  },

  logobox: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp("24%"),
  },

  logo: {
    width: wp("75%"),
    height: hp("15%"),
    objectFit: "contain",
  },

  logotext: {
    fontSize: hp("3%"),
    fontFamily: "OtomanopeeOne",
    color: "#333",
    marginTop: hp("2%"),
    textAlign: "center",
  },

  btnbox: {
    width: "100%",
    alignItems: "center",
    position: "absolute",
    bottom: hp("8%"),
  },

  button: {
    backgroundColor: "#F96247",
    width: wp("88%"),
    height: hp("7%"),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: wp("2%"),
    marginBottom: hp("2%"),
  },

  btntext: {
    color: "#FFFFFF",
    fontSize: wp("4%"),
    fontFamily: "OtomanopeeOne",
  },

  buttonlogin: {
    backgroundColor: "#FFFFFF",
    width: wp("88%"),
    height: hp("7%"),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: wp("2%"),
    borderWidth: 1,
    borderColor: "#F96247",
  },

  loginbtntext: {
    color: "#F96247",
    fontSize: wp("4%"),
    fontFamily: "OtomanopeeOne",
  },
});

