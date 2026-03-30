import {StyleSheet} from 'react-native';
import {COLORS} from '../../utils/colors';
import {hp, rfs, rhp, rwp, wp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';
export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.white2,
    borderWidth: rwp(0.5),
    borderRadius: rwp(8),
    paddingHorizontal: wp(3),
    flexDirection: 'row',
    borderColor: COLORS.white2,
    marginBottom: hp(2),
  },
  imgStyle: {
    height: rhp(82),
    width: rwp(82),
    resizeMode: 'contain',
    borderRadius: rwp(15),
  },
  textImageContainer: {
    flex: 1,
    paddingVertical: hp(2),
    flexDirection: 'row',
  },
  textContainer: {
    paddingLeft: wp(3),
  },
  photoBookTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.buttonBlackClr,
  },
  pagesTextStyle: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.buttonBlackClr,
  },
  dateTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.lightColor,
    marginTop: hp(1.5),
  },
  deleteIcnStyle: {
    height: rhp(24),
    width: rwp(24),
    resizeMode: 'contain',
    alignSelf: 'flex-end',
  },
  continueTextStyle: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.skyBlue,
    textDecorationLine: 'underline',
  },
  touchableContainer: {
    justifyContent: 'space-between',
    marginVertical: hp(1.5),
  },
});
