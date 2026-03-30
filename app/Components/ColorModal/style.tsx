import {StyleSheet} from 'react-native';
import {hp, rfs, rwp, wp} from '../../utils/reponsiveness';
import {COLORS} from '../../utils/colors';
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
  barStyle2: {
    backgroundColor: COLORS.reasonModalBar,
    paddingVertical: hp(0.1),
    marginVertical: hp(3),
    marginHorizontal: wp(7),
  },
  oddContainerStyle: {
    backgroundColor: COLORS.textWhite,
    borderWidth: rwp(0.3),
    borderColor: COLORS.skyBlue,
    marginHorizontal: wp(7),
    marginBottom: hp(2),
  },
  oddTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.skyBlue,
  },
});
