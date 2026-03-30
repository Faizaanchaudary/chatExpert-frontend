import {StyleSheet} from 'react-native';
import {hp, rfs, wp} from '../../utils/reponsiveness';
import {COLORS} from '../../utils/colors';
import fonts from '../../utils/fonts';

export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.backgroundColor,
    paddingHorizontal: wp(4),
    flex:1,
  },
  customButtonContainer: {
    // backgroundColor: 'red',
    justifyContent: 'flex-end',
    flex: 1,
    marginVertical: hp(2),
  },
  oddTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.SFPRODISPLAY.Medium,
    paddingVertical: hp(0.3),
  },
});
