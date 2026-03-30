import { Platform, StyleSheet } from "react-native";
import { COLORS } from "../../utils/colors";
import { hp, wp } from "../../utils/reponsiveness";
export const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    paddingHorizontal: wp(4.5),
    paddingTop: Platform.OS == "ios" ? hp(4) : undefined,
  },
  innerContainer: {
    marginTop: hp(3),
  },
});
