import {
  Modal,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React from 'react';
import {styles} from './style';
import CustomInputField from '../CustomInputField';
import CustomButton from '../CustomButton';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {icn} from '../../assets/icons';
interface ApplyCodeModalProps {
  tickIcn?: any;
  showSuccessBar?: any;
  redeemPress?: () => void;
  visible?: any;
  withOutFeedbackPress?: () => void;
  value?: any;
  onChangeText?: any;
}
const ApplyCodeModal: React.FC<ApplyCodeModalProps> = ({
  tickIcn,
  showSuccessBar,
  redeemPress,
  visible,
  withOutFeedbackPress,
  value,
  onChangeText,
}) => {
  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={withOutFeedbackPress}>
        <View style={styles.mainContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.innerContainer}>
              <KeyboardAwareScrollView>
                <Text style={styles.applyCodeTextStyle}>Apply Code</Text>
                <View style={styles.barStyle}></View>
                <View style={styles.inputFieldContainer}>
                  <CustomInputField
                    placeHolder={'Code here'}
                    keyboardType={'numeric'}
                    rightIcn={true}
                    disabled={true}
                    source={tickIcn}
                    value={value}
                    onChangeText={onChangeText}
                  />
                  <CustomButton
                    text="Redeem"
                    oddTextStyle={styles.redeemTextStyle}
                    oddContainerStyle={styles.redeemContainerStyle}
                    onPress={redeemPress}
                  />
                  {showSuccessBar && (
                    <View style={styles.successfullyAppliedContainer}>
                      <Text style={styles.successfullyAppliedTextStyle}>
                        • Successful Applied
                      </Text>
                    </View>
                  )}
                </View>
              </KeyboardAwareScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ApplyCodeModal;
