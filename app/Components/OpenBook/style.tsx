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
    paddingTop: hp(3),
    // paddingHorizontal: wp(4),
    borderTopLeftRadius: rwp(10),
    borderTopRightRadius: rwp(10),
    paddingBottom: hp(6),
  },
  applyCodeTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.buttonBlackClr,
    paddingLeft: wp(4),
  },
  barStyle: {
    backgroundColor: COLORS.reasonModalBar,
    paddingVertical: hp(0.1),
    marginVertical: hp(2),
  },
  inputFieldContainer: {
    paddingHorizontal: wp(4),
  },
  redeemTextStyle: {
    fontFamily: fonts.POPPINS.Medium,
  },
  redeemContainerStyle: {
    width: rwp(89),
    alignSelf: 'flex-end',
    paddingVertical: hp(0.7),
    marginBottom: hp(2.2),
  },
  successfullyAppliedContainer: {
    borderRadius: rwp(8),
    backgroundColor: COLORS.skyBlue,
    paddingVertical: hp(0.8),
  },
  successfullyAppliedTextStyle: {
    fontSize: rfs(14),
    color: COLORS.textWhite,
    fontFamily: fonts.POPPINS.Medium,
    paddingLeft: wp(6),
  },
});
