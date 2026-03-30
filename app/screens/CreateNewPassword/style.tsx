import { Platform, StyleSheet } from "react-native";
import { hp, rfs, rwp, wp } from "../../utils/reponsiveness";
import fonts from "../../utils/fonts";
import { COLORS } from "../../utils/colors";

export const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingHorizontal: wp(4),
    backgroundColor: COLORS.backgroundColor,
    paddingTop: Platform.OS == "ios" ? hp(4) : undefined,
  },
  enterStrongPassword: {
    fontSize: rfs(23),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.darkBlack,
    marginTop: hp(5),
    marginBottom: hp(2.5),
  },
  mustHaveTextStyle: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.textWhite,
    textAlign: "center",
    paddingVertical: hp(0.6),
  },
  mustHaveTxtCon: {
    backgroundColor: COLORS.skyBlue,
    borderRadius: rwp(8),
    marginTop: hp(10),
  },
  customBtnContainer: {
    flex: 1,
    justifyContent: "flex-end",
    marginVertical: hp(6),
  },
  oddContainerStyle: {
    backgroundColor: "#00000050",
  },
});
