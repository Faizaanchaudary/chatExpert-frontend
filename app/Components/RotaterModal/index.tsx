import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {styles} from './style';
import {icn} from '../../assets/icons';
import {wp} from '../../utils/reponsiveness';

interface RotaterModalProps {
  visible?: any;
  oddStyle?: any;
  setShowRotaterModal?: any;
  setCurrentRotateIcn?: any;
  currentRotateIcn?: any;
}
const RotaterModal: React.FC<RotaterModalProps> = ({
  visible,
  oddStyle,
  setShowRotaterModal,
  setCurrentRotateIcn,
  currentRotateIcn,
}) => {
  const [rotaterIcon, setRotaterIcon] = useState([
    {source: icn.rotateLeft},
    {source: icn.rotateRight},
    {source: icn.rotateUp},
    {source: icn.rotateDown},
  ]);
  const SelectedIcn = item => {
    setCurrentRotateIcn(item);
  };
  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={() => setShowRotaterModal(false)}>
        <View style={styles.mainContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.innerContainer}>
              <FlatList
                data={rotaterIcon}
                contentContainerStyle={styles.flatListContainer}
                renderItem={({item, index}) => {
                  return (
                    <TouchableOpacity
                      onPress={() => SelectedIcn(item)}
                      style={[
                        styles.touchableContainerStyle(
                          item.source == currentRotateIcn.source,
                        ),
                        oddStyle,
                      ]}
                      key={index}>
                      <Image
                        source={item.source}
                        style={styles.rotateIcnStyle(
                          item.source == currentRotateIcn.source,
                        )}
                      />
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default RotaterModal;
