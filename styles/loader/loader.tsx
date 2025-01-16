import { Dimensions, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: width * 0.05,
  },

  gif: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: height * 0.05,
  },

  text: {
    fontSize: hp("2.0%"),
    textAlign: "center",
    marginBottom: height * 0.03,
    color: "#333333",
    fontFamily: "OtomanopeeOne",
    lineHeight: 22,
  },

  progressBar: {
    marginTop: height * 0.02,
  },
});
