import {StyleSheet} from 'react-native';
import fonts from '../../utils/fonts';
import {hp, rfs, rhp, rwp, wp} from '../../utils/reponsiveness';
import {COLORS} from '../../utils/colors';
import CustomButton from '../../Components/CustomButton';

export const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  innerContainer: {
    backgroundColor: COLORS.gradientBlack,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3.8),
  },
  turnChatTextStyle: {
    fontSize: rfs(23),
    color: COLORS.textWhite,
    textAlign: 'center',
    fontFamily: fonts.POPPINS.SemiBold,
  },
  rawTextStyle: {
    fontSize: rfs(15),
    color: COLORS.textWhite,
    textAlign: 'center',
    fontFamily: fonts.POPPINS.ExtraLight,
    paddingTop: hp(0.5),
  },
  splashImageStyle: {
    flex: 1,
    resizeMode: 'contain',
  },
  forwardIcnStyle: {
    height: rwp(56),
    width: rwp(56),
    resizeMode: 'contain',
  },
  buttonContainerStyle: {
    alignSelf: 'center',
    paddingTop: hp(3.5),
  },
});
