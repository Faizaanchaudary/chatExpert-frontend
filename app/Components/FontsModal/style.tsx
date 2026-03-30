import {StyleSheet} from 'react-native';
import {hp, rfs, rwp, wp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';
import {COLORS} from '../../utils/colors';

export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#00000050',
    flex: 1,
    justifyContent: 'flex-end',
  },
  innerContainer: {
    backgroundColor: COLORS.textWhite,
    paddingTop: hp(2.5),
    // paddingHorizontal: wp(4),
    borderTopLeftRadius: rwp(10),
    borderTopRightRadius: rwp(10),
  },
  chooseFontsTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.SemiBold,
    color: COLORS.buttonBlackClr,
    paddingLeft: wp(4),
  },
  barStyle: {
    backgroundColor: COLORS.reasonModalBar,
    paddingVertical: hp(0.1),
    marginVertical: hp(1.7),
  },
  chooseFontWeight: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.buttonBlackClr,
    paddingLeft: wp(4),
  },
  fontStyleFlatListContainer: {
    paddingLeft: wp(4),
    marginBottom: hp(1.6),
  },
  fontWeightFlatListContainer: {
    paddingLeft: wp(4),
    marginBottom: hp(5),
    marginTop: hp(2.4),
  },
  oddFontBox: {
    backgroundColor: COLORS.buttonBlackClr,
  },
  oddFontBoxTextStyle: {
    color: COLORS.textWhite,
  },
  availableFontStyle: (item, selectFont, seeFontStyle) => ({
    fontSize: selectFont.name == item.name ? rfs(29.5) : rfs(24),
    fontFamily: item.name,
    color:
      seeFontStyle && selectFont.name == item.name
        ? COLORS.textWhite
        : COLORS.skyBlue,
    marginRight: wp(4),
    backgroundColor:
      seeFontStyle && selectFont.name == item.name
        ? COLORS.buttonBlackClr
        : null,
    paddingHorizontal:
      seeFontStyle && selectFont.name == item.name ? wp(4) : null,
    borderRadius: rwp(10),
  }),
});
