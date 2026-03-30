import {StyleSheet} from 'react-native';
import {hp, rfs, rhp, rwp, width, wp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';
import {COLORS} from '../../utils/colors';

export const styles = StyleSheet.create({
  mainContainer: {
    alignItems: 'center',
    borderWidth: rwp(1),
    width: rwp(60),
    // height: rhp(60),
    // paddingVertical: hp(1),
    borderRadius: rwp(8),
    borderColor: COLORS.skyBlue,
    marginRight: wp(2),
    // backgroundColor: 'red',
  },
  filterIcnStyle: {
    height: rhp(20.36),
    width: rwp(21.43),
    resizeMode: 'contain',
  },
  filterTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.SFPRODISPLAY.Medium,
    color: COLORS.skyBlue,
  },
  filterImage: {
    resizeMode: 'cover',
    height: rhp(60),
    width: rwp(60),
    borderRadius: rwp(8),
  },
  textImageContainer: {
    alignItems: 'center',
    paddingVertical: hp(1),
  },
});
