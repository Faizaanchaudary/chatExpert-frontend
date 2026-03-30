import {StyleSheet} from 'react-native';
import {COLORS} from '../../utils/colors';
import {hp, rfs, rhp, rwp, wp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';

export const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    paddingHorizontal: wp(4),
  },
  buttonCheckMarkStyle: {
    height: rwp(19),
    width: rwp(19),
    resizeMode: 'contain',
  },
  payWithCardTextStyle: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textWhite,
    flex: 1,
  },
  checkAbleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.buttonBlackClr,
    paddingVertical: hp(1.7),
    borderRadius: rwp(47),
    paddingHorizontal: wp(4),
    alignItems: 'center',
    marginVertical: hp(3),
  },
  oddTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.SFPRODISPLAY.Medium,
    paddingVertical: hp(0.3),
  },
  customButtonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginVertical: hp(7),
  },
  checkOnIcnStyle: {
    height: rhp(24),
    width: rwp(24),
    resizeMode: 'contain',
  },
  saveForNextTextStyle: {
    fontSize: rfs(20),
    flex: 1,
    fontFamily: fonts.ROBOTO.Medium,
    color: COLORS.buttonBlackClr,
    // marginBottom: hp(2.5),
  },
  textCheckBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2.3),
    marginTop:hp(3.5),
  },
  payNowTextStyle: {
    fontFamily: fonts.SFPRODISPLAY.Medium,
    paddingVertical: hp(0.3),
  },
  orTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.ROBOTO.Medium,
    color: COLORS.buttonBlackClr,
    textAlign: 'center',
    marginVertical: hp(3.5),
  },
  gPayIcnStyle: {
    height: rhp(23.13),
    width: rwp(58.26),
    resizeMode: 'contain',
  },
  gPayOddContainerStyle: {
    paddingVertical: hp(1.6),
    marginBottom: hp(2.5),
  },
  applePayContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
    paddingVertical: hp(1.6),
  },
  applePyaTextStyle: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Regular,
    paddingRight: wp(1.2),
    marginTop: hp(0.3),
  },
});
