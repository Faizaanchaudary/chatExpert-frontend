import {StyleSheet} from 'react-native';
import {COLORS} from '../../utils/colors';
import {hp, rfs, rhp, rwp, wp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';

export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.white4,
    flex: 1,
    paddingHorizontal: wp(5),
  },
  imageStyle: {
    height: rhp(330),
    width: rwp(335),
    borderRadius: rwp(20),
    alignSelf: 'center',
    resizeMode: 'cover',
    marginTop: hp(2),
  },
  bottomContainer: {
    position: 'absolute',
    width: wp(100),
    backgroundColor: COLORS.textWhite,
    bottom: 0,
    paddingTop: hp(2),
    paddingHorizontal: wp(5),
    paddingBottom: hp(1),
  },
  flatListContentContainerStyle: {
    justifyContent: 'space-evenly',
    flex: 1,
    marginHorizontal: wp(3),
    marginBottom: hp(3),
  },
  reSetTextStyle: {
    fontSize: rfs(13),
    fontFamily: fonts.POPPINS.Bold,
    color: COLORS.skyBlue,
    alignSelf: 'flex-end',
    marginBottom: hp(3),
  },
  customButtonOddTextStyle: {
    fontFamily: fonts.SFPRODISPLAY.Medium,
    color: COLORS.textWhite,
    paddingVertical:hp(0.3)
  },
});
