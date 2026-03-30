import { Platform, StyleSheet } from "react-native";
import { COLORS } from "../../utils/colors";
import { hp, rhp, rwp, wp } from "../../utils/reponsiveness";

export const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    paddingHorizontal: wp(4),
    paddingTop: Platform.OS == "ios" ? hp(4) : undefined,
  },
  profileImageStyle: {
    height: rwp(154),
    width: rwp(154),
    alignSelf: "center",
    // backgroundColor: 'red',
    borderRadius: wp(100),
    marginVertical: hp(2),
  },
  cameraIcnStyle: {
    height: rwp(28.5),
    width: rwp(28.5),
    resizeMode: "contain",
  },
  cameraIcnContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
  },
  oddInputFieldContainer: {
    backgroundColor: COLORS.backgroundColor,
    // borderColor: COLORS.reasonModalBar,
  },
});
