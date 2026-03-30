import { StyleSheet } from "react-native";
import { COLORS } from "../../utils/colors";
import { hp, rfs, rhp, rwp, wp } from "../../utils/reponsiveness";
import fonts from "../../utils/fonts";

export const styles = StyleSheet.create({
  mainContainer: {
    paddingHorizontal: wp(2.3),
    borderRadius: rwp(8),
    marginBottom: hp(2),
  },
  innerViewContainer: {
    backgroundColor: COLORS.white2,
    borderWidth: rwp(0.5),
    borderRadius: rwp(8),
    paddingHorizontal: wp(2.5),
    flexDirection: "row",
    borderColor: COLORS.white2,
    marginBottom: hp(2),
  },
  circleCheckBox: {
    height: rwp(20),
    width: rwp(20),
    resizeMode: "contain",
    marginRight: wp(2),
  },
  imgStyle: {
    height: rhp(82),
    width: rwp(82),
    resizeMode: "contain",
    borderRadius: rwp(15),
  },
  imgTextContainer: {
    paddingVertical: hp(2.5),
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  textContainer: {
    marginLeft: wp(2),
  },
  photoBookTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.buttonBlackClr,
    marginBottom: hp(1),
  },
  priceTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.buttonBlackClr,
  },
  heightCmTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.lightColor,
  },
  deleteIcnContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteIcnStyle: {
    height: rhp(24),
    width: rwp(24),
    resizeMode: "contain",
    alignSelf: "flex-end",
  },
  touchAbleContainer: { marginTop: hp(1) },
  previewTextStyle: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.skyBlue,
    textDecorationLine: "underline",
  },
  addButtonIcn: {
    height: rwp(18),
    width: rwp(18),
    resizeMode: "contain",
  },
  numberTextContainer: {
    borderWidth: rwp(1.5),
    borderColor: COLORS.buttonBlackClr,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(2.2),
    borderRadius: rwp(6),
    marginHorizontal: wp(2),
  },
  numberTextStyle: {
    fontSize: rfs(13),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.buttonBlackClr,
  },
  addMinusBtnCon: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: hp(2.5),
  },
  previewTextContainer: { alignSelf: "flex-end", marginTop: hp(1.7) },
  squareCheckBoxStyle: {
    height: rhp(20),
    width: rwp(20),
    resizeMode: "contain",
  },
  squareCheckBoxContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: hp(2),
    borderWidth: rwp(1),
    backgroundColor: COLORS.textWhite,
    borderRadius: rwp(47),
    paddingVertical: hp(2),
    marginBottom: hp(2),
  },
  squareCheckBoxTouchableStyle: {
    flex: 1,
  },
  includeEbookTextStyle: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.buttonBlackClr,
  },
  ebookContainerOnly: {
    flexDirection: "row",
    backgroundColor: COLORS.white2,
    paddingVertical: hp(3),
    paddingHorizontal: wp(4),
    borderRadius: rwp(8),
    // alignItems: 'center',
  },
  ebooKTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.buttonBlackClr,
    marginLeft: wp(4),
    flex: 1,
    // backgroundColor: 'red',
    // height: wp(5.3),
  },
  ebookPriceTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.buttonBlackClr,
  },
});
