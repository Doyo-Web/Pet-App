import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export const styles = StyleSheet.create({
  container: {
    paddingTop: 180,
    paddingHorizontal: 50,
    backgroundColor: "#FFFFFF",
    height: "100%",
    display: "flex",
    alignItems: "center",
  },

  gif: {
    width: 360,
    height: 360,
  },

  text: {
    fontSize: hp("2%"),
    textAlign: "center",
    marginBottom: 50,
    fontFamily: "OtomanopeeOne",
  },
});
