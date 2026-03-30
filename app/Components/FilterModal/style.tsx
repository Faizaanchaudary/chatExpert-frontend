import {StyleSheet} from 'react-native';
import {hp, rwp, wp} from '../../utils/reponsiveness';
import {COLORS} from '../../utils/colors';

export const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#00000050',
  },
  innerContainer: {
    backgroundColor: COLORS.textWhite,
    // backgroundColor: 'red',
    borderWidth: rwp(0.5),
    // borderRadius: rwp(18),
    paddingVertical: hp(1.3),
    borderColor: COLORS.creamColor,
  },
  flatListStyle: {paddingHorizontal: wp(4), flexGrow: 1},
});
