import {StyleSheet} from 'react-native';
import {hp, rfs, rhp, rwp, wp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';
import {COLORS} from '../../utils/colors';

export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#00000050',
    flex: 1,
    justifyContent: 'flex-end',
  },
  innerContainer: {
    backgroundColor: COLORS.textWhite,
    paddingVertical: hp(3),
    borderTopLeftRadius: rwp(10),
    borderTopRightRadius: rwp(10),
  },
  reasonTextStyle: {
    fontSize: rfs(17.5),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.buttonBlackClr,
    paddingLeft: wp(4),
  },
  reasonModalBarStyle: {
    paddingVertical: hp(0.1),
    backgroundColor: COLORS.reasonModalBar,
    marginVertical: hp(2),
  },
  flowWasDifficultTextStyle: {
    fontSize: rfs(16),
    color: COLORS.skyBlue,
    fontFamily: fonts.POPPINS.Regular,
    flex: 1,
  },
  forwardBlackArrowStyle: {
    height: rhp(24),
    width: rwp(24),
    resizeMode: 'contain',
  },
  touchableContainer: {
    flexDirection: 'row',
    paddingVertical: hp(1),
    // backgroundColor:'red',
    // alignItems:'center',
  },
  touchableMainContainer: {
    paddingHorizontal: wp(4),
  },
});
