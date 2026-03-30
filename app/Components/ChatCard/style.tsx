import { StyleSheet } from "react-native";
import { hp, rfs, rhp, rwp, wp } from "../../utils/reponsiveness";
import fonts from "../../utils/fonts";
import { COLORS } from "../../utils/colors";

export const styles = StyleSheet.create({
  checkIcn: {
    height: rhp(32),
    width: rwp(29),
    resizeMode: "contain",
    marginTop: hp(2.1),
  },
  oddContainerStyle: {
    flex: 1,
    // backgroundColor: "red",
  },
  todayDateTextStyle: {
    fontSize: rfs(17),
    fontFamily: fonts.ROBOTO.Medium,
    color: COLORS.brown,
    textAlign: "center",
    marginTop: hp(3),
    marginBottom: hp(1.5),
  },
  chatContainer: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "red",
    paddingBottom: hp(1),
  },
  chatContainerReceiver: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1),
    // flex:1,
  },
  nameTextStyle: {
    fontSize: rfs(14),
    fontFamily: fonts.ROBOTO.Regular,
    color: COLORS.buttonBlackClr,
  },
  touchableContainer: {
    flex: 1,
  },
  dateTextStyle: {
    fontSize: rfs(12),
    fontFamily: fonts.ROBOTO.Light,
    color: COLORS.darkBlack,
  },
  senderTextStyle: {
    fontSize: rfs(17),
    fontFamily: fonts.ROBOTO.Medium,
    color: COLORS.darkBlack,
    // paddingRight: wp(1),
  },
  senderTextContainer: {
    backgroundColor: COLORS.blue,
    paddingVertical: hp(1),
    borderRadius: rwp(12),
    paddingLeft: wp(4),
    width: wp(55),
    alignSelf: "flex-start",
  },
  receiverTextTextStyle: {
    fontSize: rfs(14),
    fontFamily: fonts.ROBOTO.Regular,
    color: COLORS.buttonBlackClr,
    alignSelf: "flex-end",
    // marginRight: wp(1.5),
  },
  receiverTextContainer: {
    backgroundColor: COLORS.yellow2,
    paddingVertical: hp(1),
    borderRadius: rwp(12),
    paddingLeft: wp(4),
    width: wp(55),
    alignSelf: "flex-end",
    justifyContent: "flex-end",
  },
  receiverTextStyle: {
    fontFamily: fonts.ROBOTO.Medium,
    color: COLORS.textWhite,
    // paddingRight: wp(1),
  },
  receiverCheckIcn: {
    height: rhp(32),
    width: rwp(29),
    resizeMode: "contain",
    flex: 1,
  },
  editImageStyle: {
    height: rhp(180),
    width: rwp(155),
    marginLeft: wp(3.6),
    alignItems: "center",
    justifyContent: "center",
  },
  checkIcnForQR: {
    height: rhp(32),
    width: rwp(29),
    resizeMode: "contain",
    marginRight: wp(2),
  },
  playPauseIcnStyle: {
    height: rwp(50),
    width: rwp(50),
    resizeMode: "contain",
    // marginLeft: wp(2),
  },
  editImageContainer: {
    borderRadius: rwp(12),
    // backgroundColor: "red",
  },
  soundIcnStyle: {
    height: rwp(48),
    width: rwp(48),
    resizeMode: "contain",
    marginRight: wp(9),
    // marginTop: hp(3),
  },
  VoiceReceiverTextTextStyle: {
    fontSize: rfs(14),
    fontFamily: fonts.ROBOTO.Regular,
    color: COLORS.buttonBlackClr,
    alignSelf: "flex-end",
    marginTop: hp(1),
  },
  senderVoiceTextTextStyle: {
    fontSize: rfs(14),
    fontFamily: fonts.ROBOTO.Regular,
    color: COLORS.buttonBlackClr,
    // alignSelf: 'flex-end',
    marginTop: hp(1),
  },
  receiverVoiceContainer: {
    backgroundColor: COLORS.yellow2,
    paddingVertical: hp(0.7),
    paddingLeft: wp(4),
    width: rwp(180),
    borderBottomLeftRadius: rwp(8),
    borderBottomRightRadius: rwp(8),
    alignSelf: "flex-end",
    // marginTop:hp(1),
  },
  senderVoiceContainer: {
    backgroundColor: COLORS.blue,
    paddingVertical: hp(0.7),
    paddingLeft: wp(4),
    width: rwp(180),
    borderBottomLeftRadius: rwp(8),
    borderBottomRightRadius: rwp(8),
    alignSelf: "flex-end",
  },
  voiceQrContainer: { marginVertical: hp(1.5) },
  commonPadding: {
    paddingLeft: wp(2),
  },
  voiceMainContainer: {
    alignItems: "center",
    marginBottom: hp(1),
  },
  voiceInnerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
