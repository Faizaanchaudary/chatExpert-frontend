import {StyleSheet} from 'react-native';
import {hp, rfs, rhp, rwp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';
import {COLORS} from '../../utils/colors';

export const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp(2),
  },
  icnStyle: {
    height: rhp(25),
    width: rwp(25),
    resizeMode: 'contain',
  },
  textStyle: {
    fontSize: rfs(19),
    marginTop: hp(0.4),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.textBlack,
  },
  rightText: {
    fontSize: rfs(14),
    marginTop: hp(0.4),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.textBlack,
  },
});
