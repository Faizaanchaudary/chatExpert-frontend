import {StyleSheet} from 'react-native';
import {COLORS} from '../../utils/colors';
import {hp, rfs, rhp, rwp, wp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';

export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.white4,
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    borderRadius: rwp(8),
    marginBottom: hp(2),
  },
  deliveryPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliverTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.buttonBlackClr,
    flex: 1,
  },
  priceTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Light,
    color: COLORS.buttonBlackClr,
  },
  numberTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.buttonBlackClr,
  },
  sizeCmTextStyle: {
    fontSize: rfs(12),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.buttonBlackClr,
    marginTop: hp(0.5),
    // paddingLeft:wp(1.5),
  },
  sizeCmText2Style: {
    fontSize: rfs(12),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.buttonBlackClr,
    // paddingLeft:wp(1.5),
  },
  mapIcnStyle: {
    height: rhp(24),
    width: rwp(24),
    resizeMode: 'contain',
    // backgroundColor: 'red',
    alignSelf: 'flex-start',
  },
  addressTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.buttonBlackClr,
    paddingLeft: wp(1),
  },
  mapIcnContainer: {
    flexDirection: 'row',
    // alignItems: 'center',
    paddingVertical: hp(2.5),
  },
  blackCircleStyle: {
    height: rwp(5),
    width: rwp(5),
    borderRadius: rwp(100),
    backgroundColor: COLORS.buttonBlackClr,
  },
  orderDateTextStyle: {
    fontSize: rfs(13),
    fontFamily: fonts.POPPINS.Light,
    color: COLORS.buttonBlackClr,
  },
  deliverAndOrderDateTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.buttonBlackClr,
    // backgroundColor: 'grey',
    flex: 1,
  },
  orderDateAndBarContainer: {
    flexDirection: 'row',
    paddingRight: wp(7),
  },
  blackDotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: wp(1),
  },
  blackBarStyle: {
    flex: 1,
    paddingVertical: rhp(0.7),
    backgroundColor: COLORS.buttonBlackClr,
  },
  realTimeDateContainer: {
    flexDirection: 'row',
    paddingRight: wp(4.7),
  },
  deliveryDateTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.buttonBlackClr,
  },
});
