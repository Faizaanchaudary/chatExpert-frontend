import { Platform, StyleSheet } from "react-native";
import { COLORS } from "../../utils/colors";
import { hp, rfs, wp } from "../../utils/reponsiveness";
import fonts from "../../utils/fonts";

export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.backgroundColor,
    paddingHorizontal: wp(5),
    flex: 1,
    paddingTop: Platform.OS == "ios" ? hp(4) : undefined,
  },
  innerContainer: {
    marginTop: hp(2),
  },
  noAddressText: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 18,
  },
  addAnotherText: {
    textAlign: "center",
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.skyBlue,
    fontSize: rfs(16),
    textDecorationLine: "underline",
    marginTop: hp(2),
  },
  chooseAddressTextStyle: {
    fontSize: rfs(20),
    color: COLORS.buttonBlackClr,
    fontFamily: fonts.SFPRODISPLAY.Regular,
  },
});
