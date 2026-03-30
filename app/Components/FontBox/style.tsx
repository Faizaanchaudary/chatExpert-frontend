import {StyleSheet} from 'react-native';
import {COLORS} from '../../utils/colors';
import {hp, rfs, rwp, wp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';

export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.textWhite,
    borderWidth: rwp(0.3),
    borderColor: COLORS.fontsBox,
    // paddingVertical: hp(1),
    width: rwp(43),
    alignItems: 'center',
    borderRadius: rwp(4),
    marginRight: wp(3),
    // paddingVertical: hp(0.1),
  },
  textStyle: {
    fontSize: rfs(24),
    color: COLORS.skyBlue,
  },
});
