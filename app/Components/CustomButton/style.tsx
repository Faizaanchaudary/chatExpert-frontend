import {StyleSheet} from 'react-native';
import {hp, rfs, rhp, rwp} from '../../utils/reponsiveness';
import {COLORS} from '../../utils/colors';
import fonts from '../../utils/fonts';
export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.buttonBlackClr,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.4),
    borderRadius: rwp(47),
  },
  textStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.textWhite,
  },
  icnStyle: {
    height: rhp(24),
    width: rwp(24),
    resizeMode: 'contain',
  },
  applePayIcn: {
    height: rhp(16.1),
    width: rwp(39.21),
    resizeMode: 'contain',
  },
});
