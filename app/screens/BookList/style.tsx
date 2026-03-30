import { Platform, StyleSheet } from "react-native";
import { COLORS } from "../../utils/colors";
import { hp, rfs, rhp, rwp, wp } from "../../utils/reponsiveness";
import fonts from "../../utils/fonts";
export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.white4,
    flex: 1,
    paddingTop: Platform.OS == "ios" ? hp(4) : undefined,
  },
  paddingStyle: {
    // paddingHorizontal: wp(5),
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: hp(2),
  },
  backIcnStyle: {
    height: rhp(25),
    width: rwp(25),
    resizeMode: "contain",
  },
  headerTitleTextStyle: {
    fontSize: rfs(19),
    marginTop: hp(0.4),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.textBlack,
    paddingLeft: wp(7),
  },
  pagesTextStyle: {
    fontSize: rfs(19),
    marginTop: hp(0.4),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.textBlack,
  },
  selectedButtonStyle: {
    backgroundColor: COLORS.buttonBlackClr,
  },
  selectedTextStyle: {
    color: COLORS.textWhite,
  },
  toggleButtonContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.barColor,
    borderRadius: rwp(40),
    marginTop: hp(3),
    // paddingHorizontal: wp(4),
    marginHorizontal: wp(5),
    alignSelf: "center",
    // width: wp(90),
  },
  customBtnTextStyle: {
    fontFamily: fonts.SFPRODISPLAY.Medium,
    paddingVertical: hp(0.4),
  },
  bottomIcnMainContainer: {
    paddingBottom: hp(1),
    backgroundColor: COLORS.textWhite,
    position: "absolute",
    bottom: 0,
    width: wp(100),
  },
  bottomIcnContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: wp(17),
    paddingVertical: hp(3),
  },
  bottomIcnStyle: {
    height: rhp(24),
    width: rwp(24),
    resizeMode: "contain",
  },
  deleteIcnStyle: {
    tintColor: COLORS.skyBlue,
  },
  customButtonContainer: {
    paddingHorizontal: wp(5),
  },
  customBtnOddContainerStyle: {
    backgroundColor: "#E3E3E3",
  },
  extendedViewContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: hp(2.2),
  },
  scrollViewContainer: {
    // paddingBottom: hp(42),
    // marginTop: hp(2),
  },
  deletedArrContainerStyle: {
    marginTop: hp(2),
  },
  tooltipContainer: {
    position: "absolute",
    bottom: hp(5),
    left: -wp(22),
    width: wp(50),
    alignItems: "center",
    zIndex: 1000,
    elevation: 5,
  },
  tooltip: {
    backgroundColor: COLORS.buttonBlackClr,
    padding: wp(3),
    borderRadius: wp(4),
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tooltipText: {
    color: COLORS.textWhite,
    fontFamily: fonts.SFPRODISPLAY.Medium,
    fontSize: rfs(14),
    textAlign: "center",
  },
  // tooltipArrow: {
  //   width: 0,
  //   height: 0,
  //   borderLeftWidth: wp(2.5),
  //   borderRightWidth: wp(2.5),
  //   borderTopWidth: wp(2.5),
  //   borderStyle: "solid",
  //   backgroundColor: "transparent",
  //   borderLeftColor: "transparent",
  //   borderRightColor: "transparent",
  //   borderTopColor: COLORS.buttonBlackClr,
  // },
});
