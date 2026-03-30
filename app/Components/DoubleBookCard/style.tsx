import {StyleSheet} from 'react-native';
import {hp, rfs, rhp, rwp, wp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';
import {COLORS} from '../../utils/colors';
export const styles = StyleSheet.create({
  bookImgStyle: {
    height: rhp(290.5),
    width: rwp(325),
    paddingVertical: hp(5.5),

    // backgroundColor:"#FF6F61",
    // backgroundColor: 'red',

    // overflow:'hidden',
  },
  dotedIcnStyle: {
    height: rwp(60),
    width: rwp(60),
    resizeMode: 'contain',
    marginBottom: hp(3),
  },
  plusIcnStyle: {
    height: rhp(14),
    width: rwp(22),
    resizeMode: 'contain',
  },
  upperTouchableContainer: {
    alignItems: 'center',
    borderWidth: wp(0.3),
    borderStyle: 'dashed',
    paddingVertical: hp(0.2),
    width: rwp(110),
  },
  middleTouchableStyle: {
    alignItems: 'center',
    borderWidth: wp(0.3),
    borderStyle: 'dashed',
    paddingVertical: hp(6),
    marginVertical: hp(2),
    resizeMode: 'cover',
    width: rwp(110),
  },
  bottomTouchableContainer: {
    alignItems: 'center',
    borderWidth: wp(0.3),
    borderStyle: 'dashed',
    paddingVertical: hp(0.2),
    width: rwp(110),
  },
  commonContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flex: 1,
  },
  lastNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',

    width: rwp(325),
  },
  lastNumberTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.darkBlack,
  },
  lastNumberText2Style: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.darkBlack,
    paddingLeft: hp(5),
  },
  simpleLockIcnStyle: {
    height: rhp(48),
    width: rwp(48),
    resizeMode: 'contain',
    // backgroundColor: 'red',
  },
  commonContainerLockIcn: {
    alignItems: 'center',
    width: rwp(110),
  },
  dotedLockIcnStyle: {
    width: rwp(60),
    height: rhp(60),
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: hp(3),
    marginBottom: hp(1.5),
    // backgroundColor: 'red',
  },
  upperTextStateStyle: {
    fontSize: rfs(13),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.buttonBlackClr,
  },

  //
  // Odd Styling
  //

  oddBookImgStyle: {
    height: rhp(123),
    width: rwp(153),
    // paddingTop: hp(1.5),
  },
  OddUpperTouchableContainer: {
    alignItems: 'center',
    borderWidth: wp(0.3),
    borderStyle: 'dashed',
    // paddingVertical: hp(0.1),

    width: rwp(50),
  },
  OddPlusIcnStyle: {
    height: rhp(6),
    width: rwp(16),
    resizeMode: 'contain',
    marginVertical: hp(0.1),
  },
  OddMiddleTouchableStyle: {
    alignItems: 'center',
    borderWidth: wp(0.3),
    borderStyle: 'dashed',
    paddingVertical: hp(2.8),
    marginVertical: hp(1),
    resizeMode: 'cover',
    width: rwp(50),
  },
  oddBottomTouchableContainer: {
    alignItems: 'center',
    borderWidth: wp(0.3),
    borderStyle: 'dashed',
    // paddingVertical: hp(0.1),

    width: rwp(50),
  },
  oddSimpleLockIcnStyle: {
    height: rhp(28),
    width: rwp(28),
    resizeMode: 'contain',
    // backgroundColor: 'red',
    alignSelf: 'center',
  },
  OddCommonContainerLockIcn: {
    alignItems: 'center',
    width: rwp(50),
  },
  OddLastNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    // backgroundColor: 'red',
    width: rwp(153.22),
  },
  OddLastNumberTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.darkBlack,
    // paddingRight: hp(2.2),
  },
  upperTextStateOddStyle: {
    fontSize: rfs(7),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.buttonBlackClr,
    // backgroundColor:"red"
  },
});
