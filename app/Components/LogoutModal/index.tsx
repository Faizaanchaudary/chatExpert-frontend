import {
  Modal,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React from 'react';
import {styles} from './style';
import CustomButton from '../CustomButton';
import {hp, wp} from '../../utils/reponsiveness';
interface LogoutModalProps {
  withOutFeedBackPress?: () => void;
  yesOnPress?: () => void;
  noOnPress?: () => void;
  visible?: any;
}
const LogoutModal: React.FC<LogoutModalProps> = ({
  yesOnPress,
  noOnPress,
  withOutFeedBackPress,
  visible,
}) => {
  return (
    <Modal transparent={true} visible={visible}>
      <TouchableWithoutFeedback onPress={withOutFeedBackPress}>
        <View style={styles.mainContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.innerContainer}>
              <Text style={styles.logoutTextStyle}>Log out</Text>
              <View style={styles.logoutModalBarStyle}></View>
              <View style={styles.textAndBtnContainer}>
                <Text style={styles.areYourSureTextStyle}>
                  Are you sure, you want to Logout?
                </Text>
                <View style={styles.buttonContainer}>
                  <CustomButton
                    text="Yes"
                    oddContainerStyle={styles.yesOddContainerStyle}
                    oddTextStyle={styles.yesOddTextStyle}
                    onPress={yesOnPress}
                  />
                  <CustomButton
                    text="No"
                    oddContainerStyle={styles.noOddContainerStyle}
                    oddTextStyle={styles.noOddTextStyle}
                    onPress={noOnPress}
                  />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default LogoutModal;
