import {StyleSheet} from 'react-native';
import {hp, rfs, rhp, rwp, wp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';
import {COLORS} from '../../utils/colors';

export const styles = StyleSheet.create({
  mainContainer: {
    alignItems: 'center',
  },
  dotedIcnStyle: {
    height: rwp(60),
    width: rwp(60),
    resizeMode: 'contain',
    marginBottom: hp(3),
  },
  singleBookImageStyle: {
    height: rhp(254.32),
    width: rwp(212),
    paddingTop: hp(2.3),
    // backgroundColor:'red'
    // backgroundColor: 'grey',
    // marginVertical:hp(10),
  },
  plusIcnStyle: {
    height: rhp(16),
    width: rwp(22),
    resizeMode: 'contain',
  },
  backImgInnerContainer: {paddingHorizontal: wp(10)},
  upperTouchableContainer: {
    alignItems: 'center',
    borderWidth: wp(0.3),
    borderStyle: 'dashed',
    paddingVertical: hp(0.2),
  },
  middleTouchableStyle: {
    alignItems: 'center',
    borderWidth: wp(0.3),
    borderStyle: 'dashed',
    paddingVertical: hp(7),
    marginVertical: hp(2),
    resizeMode: 'cover',
  },
  bottomTouchableContainer: {
    alignItems: 'center',
    borderWidth: wp(0.3),
    borderStyle: 'dashed',
    paddingVertical: hp(0.2),
  },
  touchableTextStyle: {
    fontSize: rfs(12),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.buttonBlackClr,
  },
  plusTextStyle: {
    fontSize: rfs(13),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.buttonBlackClr,
  },
  deleteIcnStyle: {
    height: rhp(48),
    width: rwp(48),
    resizeMode: 'contain',
  },
  deleteIcnViewStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginBottom: hp(3),
  },
  //
  //ODD Styling
  //
  oddSingleBookImageStyle: {
    height: rhp(110),
    width: rwp(85.72),
    paddingTop: hp(1),

    marginBottom: hp(2.2),
  },
  oddPlusIcnStyle: {
    height: rhp(6),
    width: rwp(12),
    resizeMode: 'contain',
  },
  oddBackImgInnerContainer: {paddingHorizontal: wp(4)},
  oddMiddleTouchableStyle: {
    alignItems: 'center',

    borderWidth: wp(0.3),
    borderStyle: 'dashed',
    paddingVertical: hp(2.8),
    marginVertical: hp(1.2),
    resizeMode: 'cover',
  },
  oddUpperTouchableContainer: {
    alignItems: 'center',
    borderWidth: wp(0.3),
    borderStyle: 'dashed',
    paddingVertical: hp(0.1),
  },
  oddBottomTouchableContainer: {
    alignItems: 'center',
    borderWidth: wp(0.3),
    borderStyle: 'dashed',
    paddingVertical: hp(0.1),
  },
});
