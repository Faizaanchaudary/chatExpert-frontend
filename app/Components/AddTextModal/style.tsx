import {StyleSheet} from 'react-native';
import {COLORS} from '../../utils/colors';
import {hp, rfs, rhp, rwp, wp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';

export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#00000050',
    flex: 1,
    // justifyContent: 'flex-end',
  },
  innerContainer: {
    marginTop: hp(30),
    borderTopRightRadius: rwp(10),
    borderTopLeftRadius: rwp(10),
    backgroundColor: COLORS.white4,
    paddingHorizontal: wp(5),
    flex: 1,
  },
  textInputStyle: {
    borderWidth: wp(0.1),
    borderRadius: rwp(8),
    backgroundColor: COLORS.white4,
    color: COLORS.textBlack,
    flex: 1,
    fontSize: rfs(14.5),
    fontFamily: fonts.POPPINS.Regular,
  },
  writeHereTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.buttonBlackClr,
    marginTop: hp(3),
  },
  characterTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.SFPRODISPLAY.Regular,
    color: COLORS.brown,
    alignSelf: 'flex-end',
  },
  customButtonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: hp(20),
    marginTop: hp(12),
    paddingHorizontal: wp(12),
  },
  customFieldInputFieldCon: {
    borderWidth: wp(0.4),
    backgroundColor: COLORS.white2,
    borderColor: COLORS.barColor,
    borderRadius: rwp(8),
    paddingLeft: wp(3),
    color: COLORS.textBlack,
    fontSize: rfs(14.5),
    fontFamily: fonts.POPPINS.Regular,
  },
  alterViewStyle: {
    borderWidth: wp(0.4),
    backgroundColor: COLORS.white2,
    borderColor: COLORS.barColor,
    borderRadius: rwp(8),
    paddingLeft: wp(3),
    color: COLORS.textBlack,
    fontSize: rfs(14.5),
    fontFamily: fonts.POPPINS.Regular,
    height: rhp(127),
  },
});
