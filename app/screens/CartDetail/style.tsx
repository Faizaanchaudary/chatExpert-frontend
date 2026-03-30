import {StyleSheet} from 'react-native';
import {COLORS} from '../../utils/colors';
import {hp, rfs, rwp, wp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';

export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.backgroundColor,
    flex: 1,
  },
  innerContainer: {
    paddingHorizontal: wp(4),
  },
  barStyle: {
    paddingVertical: rwp(0.7),
    backgroundColor: COLORS.orBarColor,
    // backgroundColor:'red',
    borderRadius: rwp(8),
    marginTop: hp(2),
    marginBottom: hp(3),
    marginHorizontal: wp(4),
  },
  oddContainerStyle: {
    backgroundColor: COLORS.backgroundColor,
    borderWidth: rwp(1),
    borderColor: COLORS.buttonBlackClr,
  },
  oddTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.SFPRODISPLAY.Medium,
    color: COLORS.textBlack,
    paddingVertical: hp(0.3),
  },
  subtotalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(1.7),
    // borderWidth:wp(0.5),
    borderBottomWidth: wp(0.3),
    paddingBottom: hp(1.5),
    borderColor: COLORS.orBarColor,
  },
  subtotalTextStyle: {
    fontSize: rfs(20),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.buttonBlackClr,
    flex: 1,
  },
  priceTextStyle: {
    fontSize: rfs(20),
    fontFamily: fonts.POPPINS.Bold,
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
    marginBottom: hp(12),
  },
  pricingMainContainer: {
    backgroundColor: COLORS.white4,
    // backgroundColor: 'red',
    flex: 1,
    justifyContent: 'flex-end',
    // alignSelf:'flex-end',
    paddingHorizontal: wp(5),
  },
  customButtonContainer: {
    // flex: 1,
    justifyContent: 'flex-end',
    // paddingVertical: hp(1),
    paddingBottom: hp(2),
  },
  buyNowTextStyle: {
    fontFamily: fonts.SFPRODISPLAY.Medium,
    paddingVertical: hp(0.3),
  },
});
