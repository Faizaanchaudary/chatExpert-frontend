import {StyleSheet} from 'react-native';
import {hp, rfs, rhp, rwp, wp} from '../../utils/reponsiveness';
import {COLORS} from '../../utils/colors';
import fonts from '../../utils/fonts';

export const styles = StyleSheet.create({
  mainContainer: (txt, back, img) => ({
    borderWidth: back ? 0 : img ? 0 : rwp(0.3),
    borderColor: COLORS.skyBlue,
    width: rwp(80),
    borderRadius: rwp(8),
    alignItems: 'center',
    paddingVertical: txt ? hp(3.5) : img ? 0 : hp(5),
    backgroundColor: back,
    marginRight: wp(2),
  }),
  noneTextStyle: {
    fontSize: rfs(16),
    color: COLORS.skyBlue,
    fontFamily: fonts.POPPINS.Medium,
  },
  imageStyle: {
    height: rhp(80),
    width: rwp(80),
    resizeMode: 'cover',
    borderRadius: rwp(8),
  },
});
