import {StyleSheet} from 'react-native';
import {hp, rfs, rhp, rwp, wp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';
import {COLORS} from '../../utils/colors';

export const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  iconStyle: {
    height: rhp(24),
    width: rwp(24),
    resizeMode: 'contain',
  },
  textStyle: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.buttonBlackClr,
    flex: 1,
    paddingLeft: wp(2),
  },
  priceTextStyle: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.buttonBlackClr,
  },
});
