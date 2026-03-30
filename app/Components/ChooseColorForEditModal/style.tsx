import {StyleSheet} from 'react-native';
import {COLORS} from '../../utils/colors';
import {hp, rfs, rwp, wp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';

export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#00000050',
    flex: 1,
    justifyContent: 'flex-end',
  },
  innerContainer: {
    backgroundColor: COLORS.textWhite,
    paddingTop: hp(2.5),
    // paddingHorizontal: wp(4),
    borderTopLeftRadius: rwp(10),
    borderTopRightRadius: rwp(10),
  },
  chooseColorTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.buttonBlackClr,
    paddingLeft: wp(4),
  },
  barStyle: {
    backgroundColor: COLORS.reasonModalBar,
    paddingVertical: hp(0.1),
    marginVertical: hp(1.7),
  },
  flatListContentContainer: {
    paddingHorizontal: wp(7),
    marginBottom: hp(4),
  },
});
