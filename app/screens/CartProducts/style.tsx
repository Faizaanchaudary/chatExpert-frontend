import { StyleSheet } from "react-native";
import { COLORS } from "../../utils/colors";
import { hp, rfs, rwp, wp } from "../../utils/reponsiveness";
import fonts from "../../utils/fonts";

export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.white4,
    flex: 1,
    paddingHorizontal: wp(5),
  },
  innerViewContainer: {
    backgroundColor: COLORS.blue,
    paddingVertical: hp(2),
    paddingHorizontal: wp(3),
    borderRadius: rwp(8),
  },
  subTotalContainer: {
    paddingVertical: hp(3),
    borderTopWidth: hp(0.2),
    borderBottomWidth: hp(0.2),
    borderColor: COLORS.orBarColor,
    marginTop: hp(1),
    marginBottom: hp(3),
    // marginHorizontal:wp(2),
  },
  customButtonOddConStyle: {
    backgroundColor: COLORS.white4,
    borderColor: COLORS.buttonBlackClr,
    borderWidth: wp(0.3),
  },
  customButtonOddTxtStyle: {
    color: COLORS.buttonBlackClr,
    fontFamily: fonts.POPPINS.Medium,
  },
  subtotalInnerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(1.5),
  },
  subtotalTextStyle: {
    fontSize: rfs(20),
    fontFamily: fonts.SFPRODISPLAY.Regular,
    color: COLORS.buttonBlackClr,
    marginBottom: 10,
    flex: 1,
  },
  priceTextStyle: {
    fontSize: rfs(20),
    fontFamily: fonts.SFPRODISPLAY.Bold,
    color: COLORS.buttonBlackClr,
  },
  shippingTextStyle: {
    fontFamily: fonts.POPPINS.Medium,

    paddingHorizontal: 15,
  },
  discountCardContainer: {
    marginBottom: hp(3),
  },
  discountCodeTextStyle: {
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.buttonBlackClr,
    paddingLeft: wp(1),
  },
  discountCodeContainerStyle: {
    backgroundColor: COLORS.white4,
    borderWidth: wp(0.3),
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(4),
  },
  deliverDateContainer: {
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  deliveryDateTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.buttonBlackClr,
  },
  addAnotherTextStyle: {
    textAlign: "center",
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.skyBlue,
    fontSize: rfs(16),
    textDecorationLine: "underline",
    marginTop: hp(2),
    marginBottom: hp(2),
  },
});
