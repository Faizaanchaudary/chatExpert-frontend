import { Platform, StyleSheet } from "react-native";
import { hp, rfs, rhp, rwp, wp } from "../../../utils/reponsiveness";
import fonts from "../../../utils/fonts";
import { COLORS } from "../../../utils/colors";
export const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    // paddingHorizontal: wp(5),
    paddingTop: Platform.OS == "ios" ? hp(4) : undefined,
  },
  profileImageStyle: {
    height: rwp(152),
    width: rwp(152),
    resizeMode: "contain",
    borderRadius: wp(100),
  },
  goodMorningTextStyle: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.buttonBlackClr,
  },
  nameTextStyle: {
    fontSize: rfs(24),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.buttonBlackClr,
  },
  editTextStyle: {
    fontSize: rfs(16),
    // fontFamily: fonts.POPPINS.Medium,
    color: COLORS.textWhite,
    paddingVertical: hp(0.4),
    fontWeight: "500",
  },
  editTextContainerStyle: {
    width: rwp(95),
    borderRadius: rwp(32),
    // paddingVertical: hp(0.2),
    // paddingHorizontal: wp(0),
    backgroundColor: COLORS.buttonBlackClr,
    alignItems: "center",
    // fontFamily: fonts.POPPINS.Medium,
  },
  oddTextStyle: {
    fontFamily: fonts.POPPINS.Medium,
    fontSize: rfs(16),
    // padding: hp(0.1),
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(4),
    paddingHorizontal: wp(5),
  },
  profileInnerCon: {
    paddingLeft: wp(5),
  },
  barColor: {
    marginVertical: hp(3),
    backgroundColor: COLORS.orBarColor,
    height: rhp(1.5),
  },
  profileCardContainer: {
    paddingHorizontal: wp(5),
  },
  rateUsTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.buttonBlackClr,
    paddingVertical: hp(1),
  },
  rateUsMainContainer: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: hp(2),
  },
  rateUsInnerContainer: {
    alignItems: "center",
    backgroundColor: COLORS.backgroundColor,
    borderRadius: rwp(8),
    marginHorizontal: wp(5),
    justifyContent: "flex-end",
    paddingVertical: hp(1),
    borderWidth: wp(0.1),
    borderColor: "#0000001A",
  },
  rateUsOddTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Medium,
  },
  rateUsOddContainer: { width: rwp(101), paddingVertical: hp(0.4) },
});
