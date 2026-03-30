import {StyleSheet} from 'react-native';
import {rfs, hp, wp, rwp, rhp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';
import {COLORS} from '../../utils/colors';

export const styles = StyleSheet.create({
  titleAndTileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: wp(0.3),
    borderColor: COLORS.orBarColor,
    paddingVertical: hp(0.5),
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
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    borderRadius: rwp(8),
    marginVertical: hp(2),
  },
  totalPriceInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: hp(1),
  },
});
