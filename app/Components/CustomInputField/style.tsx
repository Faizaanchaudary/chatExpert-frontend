import { Platform, StyleSheet } from "react-native";
import { hp, rfs, rhp, rwp, wp } from "../../utils/reponsiveness";
import fonts from "../../utils/fonts";
import { COLORS } from "../../utils/colors";
export const styles = StyleSheet.create({
  inputFieldContainer: {
    flexDirection: "row",
    borderWidth: wp(0.2),
    borderColor: COLORS.skyBlue,
    borderRadius: rwp(12),
    alignItems: "center",
    paddingHorizontal: wp(2),
    marginBottom: hp(2),
    backgroundColor: COLORS.white2,
  },
  inputFieldStyle: {
    paddingVertical: Platform.OS == "ios" ? hp(0.9) : undefined,
    flex: 1,
    color: COLORS.textBlack,
    fontSize: rfs(14.5),
    fontFamily: fonts.POPPINS.Regular,
  },
  tickIcnStyle: {
    height: rhp(24),
    width: rwp(24),
    resizeMode: "contain",
    marginRight: wp(1),
  },
});
