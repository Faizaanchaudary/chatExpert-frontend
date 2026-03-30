import {StyleSheet} from 'react-native';
import {COLORS} from '../../utils/colors';
import {hp, rfs, rhp, rwp, wp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';

export const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#00000050',
    justifyContent: 'flex-end',
  },
  innerContainer: {
    backgroundColor: COLORS.textWhite,
    paddingVertical: hp(2),
    // borderRadius:rwp(10)
    borderTopLeftRadius: rwp(10),
    borderTopRightRadius: rwp(10),
  },
  editChatTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.textBlack,
    paddingLeft: wp(4),
  },

  barStyle: {
    backgroundColor: '#00000017',
    paddingVertical: hp(0.1),
    marginVertical: hp(2),
  },
  paddingStyle: {
    paddingHorizontal: wp(4),
  },
  squareTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  squareTextColor: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.skyBlue,
    flex: 1,
  },
  squareColor: {
    height: rwp(24),
    width: rwp(24),
    borderRadius: rwp(4),
  },
  otherTextStyle: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textBlack,
  },
  sliderTextStyle: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.skyBlue,
    // flex: 1,
  },
  sliderStyle: {
    // height: 40,
    flex: 1,
    marginHorizontal: wp(1),
    // marginBottom:hp(1.5)
  },
  checkBoxStyle: {
    height: rhp(24),
    width: rwp(24),
    resizeMode: 'contain',
  },
});
