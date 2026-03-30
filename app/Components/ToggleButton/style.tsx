import {StyleSheet} from 'react-native';
import {COLORS} from '../../utils/colors';
import {hp, rfs, rwp, wp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';

export const styles = StyleSheet.create({
  touchableContainerStyle: {
    paddingVertical: hp(1.4),
    alignItems: 'center',
    borderRadius: rwp(40),
    flex: 1,
  },
  textStyle: {
    fontSize: rfs(15),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.buttonBlackClr,
  },
});
