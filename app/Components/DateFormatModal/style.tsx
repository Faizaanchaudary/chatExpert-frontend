import {StyleSheet} from 'react-native';
import {hp, rfs, rhp, rwp, wp} from '../../utils/reponsiveness';
import {COLORS} from '../../utils/colors';
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
  dateFormatTextStyle: {
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
  newestTextColor: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.skyBlue,
    flex: 1,
    // marginBottom: hp(2),
  },
  blackCheckIcn: {
    height: rhp(24),
    width: rwp(24),
    resizeMode: 'contain',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
  },
});
