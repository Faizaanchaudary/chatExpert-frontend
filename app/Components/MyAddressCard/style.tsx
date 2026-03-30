import {StyleSheet} from 'react-native';
import {COLORS} from '../../utils/colors';
import {hp, rfs, rhp, rwp, wp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';

export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.white4,
    borderRadius: rwp(8),
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    flexDirection: 'row',
    // marginVertical: hp(3),
    marginTop:hp(2),
  },
  addressIcnStyle: {
    height: rhp(20),
    width: rwp(20),
    resizeMode: 'contain',
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: 'grey',
  },
  addressTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.buttonBlackClr,
    paddingLeft: wp(2),
    // flex: 1,
    paddingTop: hp(0.4),
  },
  deleteIcnStyle: {
    height: rhp(24),
    width: rwp(24),
    resizeMode: 'contain',
  },
  rawTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.buttonBlackClr,
  },
});
