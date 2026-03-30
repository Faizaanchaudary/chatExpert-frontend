import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React from 'react';
import Slider from '@react-native-community/slider';
import {COLORS} from '../../utils/colors';
import {hp, rwp, wp} from '../../utils/reponsiveness';
import {icn} from '../../assets/icons';
import {styles} from './style';
interface SliderModalProps {
  setShowSliderModal?: any;
  visible: any;
}
const SliderModal: React.FC<SliderModalProps> = ({
  setShowSliderModal,
  visible,
}) => {
  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={() => setShowSliderModal(false)}>
        <View style={styles.mainContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.innerContainer}>
              <Image source={icn.circle} style={styles.icnStyle} />

              <Slider
                style={{width: rwp(289.68)}}
                minimumValue={0}
                maximumValue={1}
                value={0.3}
                minimumTrackTintColor="#7B6151"
                maximumTrackTintColor="#7B6151"
                thumbTintColor={COLORS.buttonBlackClr}
              />
              <Image source={icn.solar} style={styles.icnStyle} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default SliderModal;
