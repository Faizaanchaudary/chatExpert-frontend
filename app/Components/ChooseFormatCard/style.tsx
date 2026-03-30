import {StyleSheet} from 'react-native';
import {hp, rfs, rhp, rwp, wp} from '../../utils/reponsiveness';
import {COLORS} from '../../utils/colors';
import fonts from '../../utils/fonts';

export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.textWhite,
    // backgroundColor:"red",
    borderRadius: rwp(20),
    marginBottom: hp(2.5),
  },
  imageStyle: {
    height: rhp(196.3),
    width: rwp(341.2),
    // flex: 1,
    resizeMode: 'cover',
    borderTopLeftRadius: rwp(20),
    borderTopRightRadius: rwp(20),
  },
  textMainContainer: {
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(1.2),
    backgroundColor: COLORS.textBlack,
    borderBottomLeftRadius: rwp(20),
    borderBottomRightRadius: rwp(20),
  },
  standardText: {
    fontSize: rfs(20),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.textWhite,
    flex: 1,
  },
  centMeterTextStyle: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textWhite,
  },
  standardBookCon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.textWhite,
  },
});
