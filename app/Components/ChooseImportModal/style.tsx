import {StyleSheet} from 'react-native';
import {COLORS} from '../../utils/colors';
import {hp, rfs, rhp, rwp, wp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';

export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#00000050',
    flex: 1,
    justifyContent: 'flex-end',
  },
  innerContainer: {
    backgroundColor: COLORS.textWhite,
    paddingTop: hp(3),
    // paddingHorizontal: wp(4),
    borderTopLeftRadius: rwp(10),
    borderTopRightRadius: rwp(10),
  },
  chooseImportTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.buttonBlackClr,
    paddingLeft: wp(4),
  },
  barStyle: {
    backgroundColor: COLORS.reasonModalBar,
    paddingVertical: hp(0.1),
    marginVertical: hp(2),
  },
  touchableCOntainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  icnStyle: {
    resizeMode: 'contain',
    height: rhp(24),
    width: rwp(24),
  },
  formWhatsAppTextStyle: {
    fontSize: rfs(15),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.skyBlue,
    flex: 1,
    paddingLeft: wp(1.5),
    marginTop: hp(0.4),
    // marginTop:hp(0.3)
  },
  paddingStyle: {
    paddingHorizontal: wp(4),
  },
});
