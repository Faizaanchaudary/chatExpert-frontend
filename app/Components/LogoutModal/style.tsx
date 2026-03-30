import {StyleSheet} from 'react-native';
import {COLORS} from '../../utils/colors';
import {hp, rfs, rwp, wp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';

export const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#00000050',
  },
  innerContainer: {
    backgroundColor: COLORS.textWhite,
    paddingVertical: hp(3),
    borderTopLeftRadius: rwp(10),
    borderTopRightRadius: rwp(10),
  },
  logoutModalBarStyle: {
    paddingVertical: hp(0.1),
    backgroundColor: COLORS.reasonModalBar,
    marginVertical: hp(1.5),
  },
  logoutTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.buttonBlackClr,
    paddingLeft: wp(4),
  },
  areYourSureTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.buttonBlackClr,
  },
  textAndBtnContainer: {
    paddingHorizontal: wp(4),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(4),
  },
  yesOddContainerStyle: {
    width: rwp(155),
  },
  noOddContainerStyle: {
    width: rwp(155),
    backgroundColor: COLORS.textWhite,
    borderWidth: rwp(1),
  },
  noOddTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.SFPRODISPLAY.Medium,
    color: COLORS.skyBlue,
    paddingVertical: hp(0.3),
  },
  yesOddTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.SFPRODISPLAY.Medium,
    color: COLORS.textWhite,
    paddingVertical: hp(0.3),
  },
});
