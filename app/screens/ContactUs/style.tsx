import { Platform, StyleSheet } from "react-native";
import { hp, rfs, rhp, rwp, wp } from "../../utils/reponsiveness";
import { COLORS } from "../../utils/colors";
import fonts from "../../utils/fonts";

export const styles = StyleSheet.create({
  mainContainer: {
    paddingHorizontal: wp(4),
    backgroundColor: COLORS.backgroundColor,
    flex: 1,
    paddingTop: Platform.OS == "ios" ? hp(4) : undefined,
  },
  innerContainer: {
    marginTop: hp(3),
  },
  oddInputFieldContainer: {
    height: rhp(159),
    flexWrap: "wrap",
  },
  oddTextStyle: {
    fontFamily: fonts.SFPRODISPLAY.Medium,
    fontSize: rfs(17),
    paddingVertical: hp(0.3),
  },
  customButtonContainer: {
    flex: 1,
    justifyContent: "center",
    marginVertical: hp(8),
    paddingBottom: hp(8),
    // backgroundColor: 'red',
  },
});
