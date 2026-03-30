import {StyleSheet} from 'react-native';
import {COLORS} from '../../utils/colors';
import fonts from '../../utils/fonts';
import {hp, rfs, rhp, rwp} from '../../utils/reponsiveness';
export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.white4,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleTextStyle: {
    color: COLORS.darkBlack,
    fontSize: rfs(20),
    fontFamily: fonts.POPPINS.Medium,
  },
  cloudImageStyle: {
    height: rhp(100),
    width: rwp(102),
    resizeMode: 'contain',
  },
  savingTextStyle: {
    color: COLORS.buttonBlackClr,
    fontSize: rfs(18),
    fontFamily: fonts.POPPINS.Medium,
    marginTop: hp(4),
  },
  moreThanTextStyle: {
    fontSize: rfs(18),
    color: COLORS.grey,
    fontFamily: fonts.POPPINS.Medium,
  },
  oneMinTextStyle: {
    color: COLORS.buttonBlackClr,
    fontSize: rfs(18),
    fontFamily: fonts.POPPINS.Medium,
  },
});
