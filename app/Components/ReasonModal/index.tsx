import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React from 'react';
import {styles} from './style';
import {icn} from '../../assets/icons';
import {wp} from '../../utils/reponsiveness';
interface ReasonModalProps {
  flowDifficultPress?: () => void;
  screenResponsivePress?: () => void;
  withoutFeedBackPress?: () => void;
  visible?: any;
}
const ReasonModal: React.FC<ReasonModalProps> = ({
  flowDifficultPress,
  screenResponsivePress,
  withoutFeedBackPress,
  visible,
}) => {
  return (
    <Modal transparent={true} animationType="fade" visible={visible}>
      <TouchableWithoutFeedback onPress={withoutFeedBackPress}>
        <View style={styles.mainContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.innerContainer}>
              <Text style={styles.reasonTextStyle}>Reasons</Text>
              <View style={styles.reasonModalBarStyle}></View>
              <View style={styles.touchableMainContainer}>
                <TouchableOpacity
                  style={styles.touchableContainer}
                  onPress={flowDifficultPress}>
                  <Text style={styles.flowWasDifficultTextStyle}>
                    Flow was difficult
                  </Text>
                  <Image
                    source={icn.forwardBlackArrow}
                    style={styles.forwardBlackArrowStyle}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.touchableContainer}
                  onPress={screenResponsivePress}>
                  <Text style={styles.flowWasDifficultTextStyle}>
                    Screen was not responsive
                  </Text>
                  <Image
                    source={icn.forwardBlackArrow}
                    style={styles.forwardBlackArrowStyle}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ReasonModal;
