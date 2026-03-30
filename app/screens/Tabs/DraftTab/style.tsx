import { StyleSheet } from "react-native";
import { hp, rfs, wp } from "../../../utils/reponsiveness";
import fonts from "../../../utils/fonts";
import { COLORS } from "../../../utils/colors";

export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.backgroundColor,
    flex: 1,
    paddingHorizontal: wp(6),
  },
  textStyle: {
    fontSize: rfs(20),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.buttonBlackClr,
    alignSelf: "center",
    marginVertical: hp(2),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(10),
  },
});
