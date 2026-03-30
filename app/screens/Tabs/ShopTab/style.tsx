import { Platform, StyleSheet } from "react-native";
import { height, hp, rfs, rhp, rwp, wp } from "../../../utils/reponsiveness";
import fonts from "../../../utils/fonts";
import { COLORS } from "../../../utils/colors";

export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.backgroundColor,
    paddingHorizontal: wp(4),
    flex: 1,
    paddingTop: Platform.OS == "ios" ? hp(4) : undefined,
  },
  textStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.textBlack,
    marginVertical: hp(4),
  },
  nameTextStyle: {
    fontSize: rfs(24),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.textBlack,
  },
  photoBookMainCon: {
    flexDirection: "row",
    borderColor: "#000917CC",
    borderRadius: rwp(16),
    backgroundColor: COLORS.textBlack,
    borderWidth: wp(0.2),
  },
  photoBookInnerCon: {
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(5),
  },
  photoBookImgStyle: {
    height: rhp(164),
    width: rwp(141.5),
    resizeMode: "cover",
    borderTopRightRadius: rwp(15),
    borderBottomRightRadius: rwp(15),
    flex: 1,
  },
  firstOrderTextStyle: {
    fontSize: rfs(18),
    fontFamily: fonts.POPPINS.ExtraBold,
    color: COLORS.textWhite,
  },
  availBeforeTextStyle: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.textWhite,
  },
  percentTextStyle: {
    fontSize: rfs(18),
    // fontFamily: fonts.POPPINS.Medium,
    color: COLORS.textWhite,
    fontWeight: "500",
    paddingVertical: hp(0.7),
    paddingHorizontal: wp(2.3),
  },
  percentTextCon: {
    backgroundColor: COLORS.yellow,
    position: "absolute",
    top: hp(1),
    right: wp(2),
    borderRadius: rwp(12),
    // alignItems: 'center',
  },
  touchAbleImg: {
    height: rhp(80),
    width: rwp(80),
    borderRadius: rwp(16),
  },
  touchableContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightBlue,
    borderRadius: rwp(16),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
    marginTop: hp(3),
  },
  photoBookTextStyle: {
    fontSize: rfs(18),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.textBlack,
    flex: 1,
  },
});
