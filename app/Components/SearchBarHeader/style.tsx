import { StyleSheet } from "react-native";
import { hp, rfs, rhp, rwp, wp } from "../../utils/reponsiveness";
import { COLORS } from "../../utils/colors";
import fonts from "../../utils/fonts";

export const styles = StyleSheet.create({
  backArrowStyle: {
    height: rhp(24),
    width: rwp(24),
    resizeMode: "contain",
  },
  searchIcnStyle: {
    height: rhp(24),
    width: rwp(24),
    resizeMode: "contain",
  },
  searchBarInputStyle: {
    flex: 1,
    // paddingLeft: wp(2),
    padding: hp(1),
    color: COLORS.textBlack,
    fontSize: rfs(14.5),
    fontFamily: fonts.POPPINS.Regular,
    marginTop: hp(0.4),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: rwp(0.4),
    borderColor: "red",
    borderRadius: rwp(12),
    paddingHorizontal: wp(3),
    marginTop: hp(2),
  },
  upWardBtnStyle: {
    height: rwp(25),
    width: rwp(25),
    resizeMode: "contain",
  },
  matchCountText: {
    fontSize: rfs(12),
    color: COLORS.textBlack,
    fontFamily: fonts.POPPINS.Medium,
    marginRight: wp(2),
  },
  disabledButton: {
    opacity: 0.3,
  },
});
