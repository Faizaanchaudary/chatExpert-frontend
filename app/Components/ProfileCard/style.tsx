import {StyleSheet} from 'react-native';
import {hp, rfs, rhp, rwp, wp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';
import {COLORS} from '../../utils/colors';

export const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white2,
    paddingVertical: hp(2),
    paddingHorizontal: wp(3),
    borderRadius: rwp(12),
    marginBottom: hp(2),
  },
  iconStyle: {
    height: rhp(24),
    width: rwp(24),
    resizeMode: 'contain',
  },
  textStyle: {
    fontSize: rfs(14.5),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.skyBlue,
    height: hp(2.5),
    flex: 1,
    paddingLeft: wp(2),
    // backgroundColor: 'red',
  },
  textStyle2: {
    fontSize: rfs(14.5),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.red,
    height: hp(2.5),
    flex: 1,
    paddingLeft: wp(2),
    // backgroundColor: 'red',
  },
  arrowIcnStyle: {
    height: rhp(24),
    width: rwp(24),
    resizeMode: 'contain',
  },
});
