import {StyleSheet} from 'react-native';
import {COLORS} from '../../utils/colors';
import {hp, rhp, rwp, wp} from '../../utils/reponsiveness';

export const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#00000050',
    justifyContent: 'center',
  },
  innerContainer: {
    backgroundColor: COLORS.textWhite,
    // backgroundColor: 'red',
    borderWidth: rwp(0.5),
    borderRadius: rwp(18),
    paddingVertical: hp(1.3),
    borderColor: COLORS.creamColor,
  },
  rotateIcnStyle: curr => ({
    height: rhp(24),
    width: rwp(24),
    resizeMode: 'contain',
    tintColor: curr ? COLORS.textWhite : COLORS.textBlack,
  }),
  touchableContainerStyle: curr => ({
    borderWidth: rwp(1),
    paddingVertical: hp(2),
    width: rwp(60),
    alignItems: 'center',
    borderRadius: rwp(8),
    borderColor: curr ? null : COLORS.skyBlue,
    backgroundColor: curr ? COLORS.buttonBlackClr : null,
  }),
  flatListContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: wp(4.5),
  },
});
