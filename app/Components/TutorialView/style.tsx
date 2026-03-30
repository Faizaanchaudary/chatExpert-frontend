import {StyleSheet} from 'react-native';
import {COLORS} from '../../utils/colors';
import {hp, rfs, rhp, rwp, wp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';

export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.white3,
    flexDirection: 'row',
    borderWidth: wp(0.4),
    borderRadius: rwp(8),
    paddingHorizontal: wp(3),
    borderColor: COLORS.orBarColor,
  },
  addressTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.buttonBlackClr,
  },
  mainAddressTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.buttonBlackClr,
  },
  deleteIcnStyle: {
    height: rhp(24),
    width: rwp(24),
    resizeMode: 'contain',
    alignSelf: 'flex-end',
  },
  textContainerStyle: {flex: 1, paddingVertical: hp(1.5)},
  deleteContainerStyle: {paddingTop: hp(1)},
});
