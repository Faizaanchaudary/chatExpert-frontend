import {StyleSheet} from 'react-native';
import {hp, rfs, rhp, rwp, wp} from '../../utils/reponsiveness';
import {COLORS} from '../../utils/colors';
import fonts from '../../utils/fonts';

export const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.textWhite,
  },
  backGroundImgStyle: {
    height: rhp(500),
    width: wp(100),
  },
  innerContainerView: {
    backgroundColor: COLORS.textWhite,
    // flex: 1,
    borderTopRightRadius: rwp(20),
    borderTopLeftRadius: rwp(20),
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.2),
    borderWidth: wp(0.2),
    borderColor: COLORS.borderBlueCLr,
  },
  barStyle: {
    backgroundColor: COLORS.barColor,
    height: rhp(8),
    width: rwp(108),
    alignSelf: 'center',
    marginBottom: hp(3),
    borderRadius: rwp(8),
  },
  customButtonContainer: {
    paddingHorizontal: wp(14.5),
    marginVertical: hp(1.5),
  },
  doNotHaveAccountStyle: {
    fontSize: rfs(16),
    color: COLORS.buttonBlackClr,
    fontFamily: fonts.POPPINS.Regular,
    textAlign: 'center',
    marginVertical: hp(1),
  },
  signUpTextStyle: {
    fontSize: rfs(16),
    color: COLORS.skyBlue,
    fontFamily: fonts.POPPINS.Medium,
    textAlign: 'center',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  orBarStyle: {
    height: hp(0.2),
    backgroundColor: COLORS.orBarColor,
    flex: 1,
    borderRadius: rwp(8),
  },
  orTextStyle: {
    fontSize: rfs(16),
    color: COLORS.buttonBlackClr,
    fontFamily: fonts.POPPINS.Regular,
    paddingHorizontal: wp(2),
  },
  customBtnTextStyle: {
    color: COLORS.buttonBlackClr,
    fontFamily: fonts.POPPINS.Medium,
  },
  customBtnContainerStyle: {
    backgroundColor: COLORS.textWhite,
    borderWidth: wp(0.2),
    borderColor: COLORS.buttonBlackClr,
  },
  lostPasswordTextStyle: {
    fontSize: rfs(16),
    color: COLORS.darkBlack,
    fontFamily: fonts.POPPINS.Medium,
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: hp(2.7),
    marginBottom: hp(0.5),
  },
});
