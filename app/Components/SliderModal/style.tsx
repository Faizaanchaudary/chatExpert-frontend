import {StyleSheet} from 'react-native';
import {hp, rhp, rwp, wp} from '../../utils/reponsiveness';
import {COLORS} from '../../utils/colors';

export const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#00000050',
    justifyContent: 'center',
  },
  innerContainer: {
    backgroundColor: COLORS.textWhite,
    flexDirection: 'row',
    paddingVertical: hp(3.5),
    borderWidth: rwp(1),
    alignItems: 'center',
    justifyContent: 'center',
    // paddingHorizontal:wp(4),
    borderRadius: rwp(20),
    borderColor: COLORS.creamColor,
  },
  icnStyle: {
    height: rhp(14.22),
    width: rwp(14.22),
    resizeMode: 'contain',
  },
});
