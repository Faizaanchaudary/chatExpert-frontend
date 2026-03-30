import {StyleSheet} from 'react-native';
import {COLORS} from '../../utils/colors';
import {hp, rfs, rhp, rwp, wp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';

export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.backgroundColor,
    paddingHorizontal: wp(4),
    flex: 1,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp(2),
    marginVertical: hp(3),
  },
  icnStyle: {
    height: rhp(25),
    width: rwp(25),
    resizeMode: 'contain',
  },
  textStyle: {
    fontSize: rfs(19),
    marginTop: hp(0.4),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.textBlack,
  },
  helpTextStyle: {
    fontSize: rfs(16),
    marginTop: hp(0.4),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.skyBlue,
  },
  orderTextStyle: {
    fontSize: rfs(19),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.textBlack,
    marginVertical: hp(2.5),
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(4),
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.textBlack,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(6),
  },
  emptyText: {
    fontSize: rfs(18),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.textBlack,
  },
  emptySubtext: {
    marginTop: hp(1),
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textBlack,
    opacity: 0.7,
  },
  buttonSecondary: {
    marginTop: hp(3),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    backgroundColor: COLORS.skyBlue,
    borderRadius: 8,
  },
  buttonSecondaryText: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.white2 || '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(4),
  },
});
