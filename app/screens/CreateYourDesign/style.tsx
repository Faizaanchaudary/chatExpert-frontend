import { Platform, StyleSheet } from "react-native";
import { hp, rfs, rhp, rwp, wp } from "../../utils/reponsiveness";
import fonts from "../../utils/fonts";
import { COLORS } from "../../utils/colors";

export const styles = StyleSheet.create({
  customHeaderContainer: {
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
    paddingTop: Platform.OS == "ios" ? hp(4) : undefined,
  },
  imageStyle: {
    resizeMode: "contain",
    height: rhp(260),
    width: rwp(380),
  },
  InnerContainer: {
    borderTopLeftRadius: rwp(20),
    borderTopRightRadius: rwp(20),
    backgroundColor: COLORS.textWhite,
    flex: 1,
    borderColor: COLORS.borderBlueCLr,
    borderWidth: wp(0.3),
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  scrollViewStyle: { flex: 1, backgroundColor: COLORS.textWhite },
  hardCoverTextStyle: {
    fontSize: rfs(24),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.buttonBlackClr,
  },
  priceTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.buttonBlackClr,
  },
  detailTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.buttonBlackClr,
  },
  whatWillTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.buttonBlackClr,
    paddingTop: hp(2.5),
    paddingBottom: hp(1),
  },
  pointContainer: {
    backgroundColor: COLORS.pink,
    borderRadius: rwp(20),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  pointTextStyle: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.textWhite,
  },
  deliverTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.buttonBlackClr,
    marginTop: hp(2.5),
    marginBottom: hp(0.5),
  },
  oddTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.textWhite,
  },
  customButtonContainer: {
    marginVertical: hp(3),
  },
  solarIcnStyle: {
    height: rwp(26),
    width: rwp(26),
    resizeMode: "contain",
  },
  solarIcnContainer: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: wp(10),
    paddingVertical: hp(2),
  },
  freeDeliveriesTextStyle: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.textWhite,
    height: hp(2),
  },
  shoppingBagImgStyle: {
    height: rhp(88),
    width: rwp(67.07),
    resizeMode: "contain",
    position: "absolute",
    right: wp(6),
    top: hp(-0.7),
  },
});
