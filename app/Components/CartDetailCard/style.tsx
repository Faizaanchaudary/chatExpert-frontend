import {StyleSheet} from 'react-native';
import {rwp, hp, rfs, rhp, wp} from '../../utils/reponsiveness';
import {COLORS} from '../../utils/colors';
import fonts from '../../utils/fonts';

export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.white2,
    borderWidth: rwp(0.5),
    borderRadius: rwp(8),
    paddingHorizontal: wp(4),
    flexDirection: 'row',
    borderColor: COLORS.white2,
    marginTop: hp(2),
  },
  imgStyle: {
    height: rhp(82),
    width: rwp(82),
    resizeMode: 'contain',
    borderRadius: rwp(15),
  },
  imgTextContainer: {
    paddingVertical: hp(2.5),
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: wp(2),
  },
  photoBookTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.buttonBlackClr,
    marginBottom: hp(1),
  },
  priceTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.buttonBlackClr,
  },
  heightCmTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.lightColor,
  },
  deleteIcnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteIcnStyle: {
    height: rhp(24),
    width: rwp(24),
    resizeMode: 'contain',
    alignSelf: 'flex-end',
  },
  touchAbleContainer: {marginTop: hp(1)},
  previewTextStyle: {
    fontSize: rfs(14),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.skyBlue,
    textDecorationLine: 'underline',
  },
  addButtonIcn: {
    height: rwp(20),
    width: rwp(20),
    resizeMode: 'contain',
  },
  numberTextContainer: {
    borderWidth: rwp(1.5),
    borderColor: COLORS.buttonBlackClr,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(2.8),
    borderRadius: rwp(8),
    marginHorizontal: wp(2),
  },
  numberTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.buttonBlackClr,
  },
  addMinusBtnCon: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: hp(2.5),
  },
  previewTextContainer: {alignSelf: 'flex-end', marginTop: hp(1.7)},
});
