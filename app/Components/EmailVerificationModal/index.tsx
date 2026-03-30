import React from "react";
import { Modal, Text, TouchableWithoutFeedback, View } from "react-native";
import CustomButton from "../CustomButton";
import CustomInputField from "../CustomInputField";
import { styles } from "./style";
interface EmailVerificationModalProps {
  value?: any;
  onChangeText?: any;
  visible?: any;
  resendTime?: any;
  confirmOnPress?: () => void;
  withOutFeedback?: () => void;
  sendAgain: () => void;
  loading?: boolean;
  testId?: any;
}
const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  value,
  onChangeText,
  visible,
  resendTime,
  confirmOnPress,
  withOutFeedback,
  sendAgain,
  loading,
  testId,
}) => {
  return (
    <Modal transparent={true} visible={visible} testID="modalOutside">
      <TouchableWithoutFeedback onPress={withOutFeedback}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.modalInnerContainer}>
              <Text style={styles.verifyEmailTextStyle}>Verify your Email</Text>
              <View style={styles.barViewStyle}></View>
              <View style={styles.paddingView}>
                <CustomInputField
                  testID={testId}
                  placeHolder={"Code here"}
                  value={value}
                  onChangeText={onChangeText}
                  keyboardType={"numeric"}
                />
                <View style={styles.codeHereContainer}>
                  <Text style={styles.timerTextStyle}>00:{resendTime} Sec</Text>
                  <CustomButton
                    animating={loading}
                    text="confirm"
                    oddContainerStyle={styles.customBtnOddStyle}
                    oddTextStyle={styles.customBtnOddText}
                    onPress={confirmOnPress}
                  />
                </View>
                {resendTime == 0 ? (
                  <Text style={styles.doNotHaveAccountStyle}>
                    Didn’t receive the code?
                    <Text
                      onPress={() => sendAgain()}
                      style={styles.signUpTextStyle}
                    >
                      {" "}
                      Send again
                    </Text>
                  </Text>
                ) : null}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default EmailVerificationModal;
