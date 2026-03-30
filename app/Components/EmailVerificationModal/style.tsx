import {StyleSheet} from 'react-native';
import {COLORS} from '../../utils/colors';
import {hp, rfs, rwp, wp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';

export const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#00000050',
  },
  modalInnerContainer: {
    backgroundColor: COLORS.textWhite,
    // paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderTopLeftRadius: rwp(10),
    borderTopRightRadius: rwp(10),
  },
  verifyEmailTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.textBlack,
    paddingLeft: wp(5),
  },
  codeHereContainer: {flexDirection: 'row', alignItems: 'center'},
  barViewStyle: {
    backgroundColor: COLORS.lightBlack,
    height: hp(0.2),
    marginVertical: hp(2),
  },
  customBtnOddStyle: {
    width: rwp(89),
  },
  customBtnOddText: {
    fontFamily: fonts.POPPINS.Medium,
  },
  timerTextStyle: {
    flex: 1,
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.skyBlue,
  },
  doNotHaveAccountStyle: {
    fontSize: rfs(16),
    color: COLORS.buttonBlackClr,
    fontFamily: fonts.POPPINS.Regular,
    textAlign: 'center',
    alignItems: 'center',
    marginTop: hp(3),
  },
  signUpTextStyle: {
    fontSize: rfs(16),
    color: COLORS.skyBlue,
    fontFamily: fonts.POPPINS.Medium,
    textAlign: 'center',
  },
  paddingView: {
    paddingHorizontal: wp(4),
  },
});
