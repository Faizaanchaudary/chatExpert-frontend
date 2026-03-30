import {StyleSheet} from 'react-native';
import {COLORS} from '../../utils/colors';
import {hp, rfs, rhp, rwp, wp} from '../../utils/reponsiveness';
import fonts from '../../utils/fonts';

const CHAT_BG = '#E5DDD5';

export const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: CHAT_BG,
    flex: 1,
    paddingHorizontal: wp(4),
  },
  customButtonOddContainer: {
    minWidth: rwp(80),
    backgroundColor: CHAT_BG,
    borderWidth: rwp(1),
    borderColor: COLORS.buttonBlackClr,
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(3),
  },
  loaderContainer: {
    position: 'absolute',
    top: hp(45),
    alignSelf: 'center',
    padding: wp(3),
    backgroundColor: '#D2D2D2',
    borderRadius: wp(20),
  },
  imgPlus: {
    width: wp(50),
    height: wp(50),
    alignSelf: 'center',
    marginTop: hp(4),
  },
  imgPlusText: {
    paddingVertical: 10,
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  oddTextStyle: {
    fontSize: rfs(16),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.buttonBlackClr,
  },
  bottomButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    paddingLeft: wp(3),
    paddingRight: wp(5),
    paddingVertical: hp(1),
    marginBottom: hp(1.5),
    backgroundColor: CHAT_BG,
  },
  messageRow: {
    width: '100%',
  },
  contentContainerStyle: {
    backgroundColor: CHAT_BG,
    paddingHorizontal: wp(1),
    paddingRight: wp(2.5),
    paddingBottom: hp(8),
  },
  scrollbarContainer: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Scrollbar track
    borderRadius: 4,
  },
  scrollbarThumb: {
    width: '100%',
    height: 20,
    backgroundColor: 'blue', // Custom scrollbar color
    borderRadius: 4,
  },
  scrollbar: {
    width: '100%',
    height: 20, // Custom scrollbar height
    backgroundColor: 'blue', // Custom scrollbar color
    borderRadius: 4,
  },
  threeDotIcnContainer: {
    position: 'absolute',
    bottom: hp(9),
    right: wp(4),
  },
  threeDotIcnStyle: {
    height: rhp(48),
    width: rwp(48),
    resizeMode: 'contain',
  },
  flatListStyle: {flexGrow: 1, marginTop: hp(1.5), marginBottom: hp(9)},
  seeFontStyle: {
    backgroundColor: 'red',
    borderRadius: rwp(10),
    alignItems: 'center',
  },
  customButtonOddContainerForSearch: {
    width: rwp(165),
    backgroundColor: CHAT_BG,
    borderWidth: rwp(1),
    borderColor: COLORS.buttonBlackClr,
    paddingVertical: hp(1),
    alignSelf: 'center',
    marginBottom: hp(1.5),
    position: 'absolute',
    bottom: 0,
  },
  bottomRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  doneButton: {
    flexShrink: 0,
  },
  chatReadyRow: {
    marginBottom: 0,
  },
  chatReadyText: {
    fontSize: rfs(12),
    fontFamily: fonts.POPPINS.Regular,
    color: COLORS.textBlack,
    opacity: 0.8,
  },
  chatReadyError: {
    fontSize: rfs(12),
    fontFamily: fonts.POPPINS.Medium,
    color: COLORS.skyBlue,
  },
});
