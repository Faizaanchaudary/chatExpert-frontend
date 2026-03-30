import {StyleSheet} from 'react-native';
import {COLORS} from '../../utils/colors';
import {hp, rfs, rhp, rwp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';

export const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: 'center',
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    alignItems: 'center',
    marginTop: hp(10),
  },
  blueBagStyle: {
    width: rwp(105.09),
    height: rhp(146.5),
    resizeMode: 'contain',
    marginBottom: hp(1),
  },
  successfulTextStyle: {
    fontSize: rfs(20),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.buttonBlackClr,
  },
  deliveredTextStyle: {
    fontSize: rfs(20),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.brown,
  },
  receivedAtEmailTextStyle: {
    fontSize: rfs(20),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.grey,
  },
});
