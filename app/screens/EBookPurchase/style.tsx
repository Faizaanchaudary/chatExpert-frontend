import {StyleSheet} from 'react-native';
import {COLORS} from '../../utils/colors';
import {hp, rfs, wp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';

export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.backgroundColor,
    flex: 1,
    // paddingHorizontal: wp(5),
  },
  receiverDesignTextStyle: {
    fontSize: rfs(15),
    color: COLORS.buttonBlackClr,
    fontFamily: fonts.POPPINS.Bold,
    marginTop: hp(4),
    marginBottom: hp(2),
  },
  buyNowBtnStyle: {
    fontFamily: fonts.SFPRODISPLAY.Medium,
    paddingVertical: hp(0.3),
  },
  discountCardContainer: {
    backgroundColor: COLORS.white4,
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: hp(2),
    marginTop: hp(25.5),
    paddingHorizontal: wp(4),
  },
  buyNowOddConStyle: {
    marginTop: hp(2.5),
  },
  commonPadding: {paddingHorizontal: wp(4)},
});
