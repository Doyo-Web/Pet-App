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
  },

  sparkle: {
    position: "absolute",
    left: "70%",
    top: "20%",
  },

  logobox: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },

  logo: {
    width: wp("75%"),
    height: hp("15%"),
    objectFit: 'contain',
  },

  logotext: {
    fontSize: hp("3%"),
  },

  btnbox: {
    gap: 15,
    position: "absolute",
    bottom: "8%",
  },

  button: {
    backgroundColor: "#F96247",
    width: responsiveWidth(88),
    height: responsiveHeight(9.5),
    justifyContent: "center",
    alignItems: "center",
  },

  btntext: {
    color: "#fff",
    fontWeight: "bold",
  },

  buttonlogin: {
    backgroundColor: "#fff",
    width: responsiveWidth(88),
    height: responsiveHeight(9.5),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F96247",
  },

  loginbtntext: {
    color: "#F96247",
    fontWeight: "bold",
    fontFamily: "OtomanopeeOne",
  },
});

