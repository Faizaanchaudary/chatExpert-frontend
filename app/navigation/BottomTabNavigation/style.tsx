import { Platform, StyleSheet } from "react-native";
import { hp, rfs, rhp, rwp, wp } from "../../utils/reponsiveness";
import { COLORS } from "../../utils/colors";
import fonts from "../../utils/fonts";

export const styles = StyleSheet.create({
  tabIcnStyle: {
    marginTop: Platform.OS == "ios" ? "35%" : undefined,

    height: rhp(24),
    width: rwp(24),
    resizeMode: "contain",
    tintColor: COLORS.textWhite,
  },
  tabBar: {
    backgroundColor: COLORS.textBlack,
    borderRadius: rwp(36),
    marginHorizontal: wp(4),
    marginBottom: hp(3),
    // paddingTop: hp(2.5),
    // paddingBottom: hp(0.7),
    height: rhp(62),
  },
  tabBarLabelStyle: {
    fontSize: rfs(12),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textWhite,
    marginTop: hp(0.4),
    // paddingBottom: hp(1),
  },
  blueCircleStyle: {
    marginTop: Platform.OS == "ios" ? "35%" : undefined,
    height: rwp(12),
    width: rwp(12),
    resizeMode: "contain",
    // marginBottom:hp(2.5),
  },
  tabBarLabelOddStyle: {
    fontSize: rfs(12),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textBlack,
    // paddingBottom: hp(1),
  },
});
