import { StyleSheet } from "react-native";
import { COLORS } from "../../utils/colors";
import { hp, rfs, rhp, rwp, wp } from "../../utils/reponsiveness";
import fonts from "../../utils/fonts";

export const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#00000050",
    justifyContent: "flex-end",
  },
  innerContainer: {
    backgroundColor: COLORS.textWhite,
    paddingVertical: hp(2),
    // borderRadius:rwp(10)
    borderTopLeftRadius: rwp(10),
    borderTopRightRadius: rwp(10),
  },
  dateRangeContainer: {
    backgroundColor: "#1E293B", // Darker futuristic container
  },
  selectTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.textBlack,
    paddingLeft: wp(4),
  },

  barStyle: {
    backgroundColor: "#00000017",
    paddingVertical: hp(0.1),
    marginVertical: hp(2),
  },
  paddingStyle: {
    paddingHorizontal: wp(4),
  },
  checkBoxStyle: {
    height: rhp(24),
    width: rwp(24),
    resizeMode: "contain",
  },
  titleTextStyle: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.skyBlue,
    flex: 1,
  },
  checkBoxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1.7),
  },
  iconStyle: {
    height: rhp(24),
    width: rwp(24),
    resizeMode: "contain",
  },
});
