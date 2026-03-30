import {StyleSheet} from 'react-native';
import {hp, rfs, rwp, wp} from '../../../utils/reponsiveness';
import fonts from '../../../utils/fonts';
import {COLORS} from '../../../utils/colors';

export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.backgroundColor,
    flex: 1,
    paddingHorizontal: wp(4),
  },
  textStyle: {
    fontSize: rfs(20),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.buttonBlackClr,
    alignSelf: 'center',
    marginVertical: hp(2),
  },
  innerViewContainer: {
    backgroundColor: COLORS.blue,
    paddingVertical: hp(2),
    paddingHorizontal: wp(3),
    borderRadius: rwp(8),
  },
  oddContainerStyle: {
    backgroundColor: COLORS.backgroundColor,
    borderWidth: rwp(1),
    marginTop: hp(2.5),
  },
  oddTextStyle: {
    color: COLORS.buttonBlackClr,
    fontFamily: fonts.POPPINS.Medium,
  },
  subtotalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(1.5),
    // borderWidth:wp(0.5),
    borderBottomWidth: wp(0.4),
    paddingBottom: hp(1.5),
    borderColor: COLORS.orBarColor,
  },
  subtotalTextStyle: {
    fontSize: rfs(20),
    fontFamily: fonts.SFPRODISPLAY.Regular,
    color: COLORS.buttonBlackClr,
    flex: 1,
  },
  priceTextStyle: {
    fontSize: rfs(20),
    fontFamily: fonts.SFPRODISPLAY.Bold,
    color: COLORS.buttonBlackClr,
  },
  deliverDateContainer: {
    backgroundColor: COLORS.blurBLue,
    // borderWidth:1,
    borderRadius: rwp(8),
    marginVertical: hp(2.4),
  },
  deliveryDateTextStyle: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.extraBlack,
    textAlign: 'center',
    paddingVertical: hp(0.3),
  },
  addAnotherTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.skyBlue,
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginVertical: hp(1.5),
  },
  titleAndTileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: wp(0.3),
    borderColor: COLORS.orBarColor,
  },
  discountTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.buttonBlackClr,
    flex: 1,
    // paddingVertical: hp(0.5),
  },
  discountPriceTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.buttonBlackClr,
  },
  totalPriceTextStyle: {
    fontSize: rfs(20),
    fontFamily: fonts.SFPRODISPLAY.Regular,
    color: COLORS.buttonBlackClr,
    flex: 1,
  },
  totalPriceNumberTextStyle: {
    fontSize: rfs(20),
    fontFamily: fonts.SFPRODISPLAY.Bold,
    color: COLORS.buttonBlackClr,
  },
  totalPriceContainer: {
    backgroundColor: COLORS.white3,
    borderWidth: rwp(1),
    borderColor: COLORS.orBarColor,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: rwp(8),
    marginVertical: hp(2),
  },
  totalPriceInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: hp(1),
  },
  pricingMainContainer: {
    backgroundColor: COLORS.white4,
    paddingHorizontal: wp(5),
    marginBottom: hp(2),
  },
  customButtonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: hp(2),
  },
  buyNowTextStyle: {
    fontFamily: fonts.SFPRODISPLAY.Medium,
    paddingVertical: hp(0.3),
  },
});
