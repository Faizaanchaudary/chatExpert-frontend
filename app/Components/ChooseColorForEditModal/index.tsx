import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useState } from "react";
import { COLORS } from "../../utils/colors";
import { styles } from "./style";
import ColorBox from "../ColorBox";
import { hp, wp } from "../../utils/reponsiveness";
interface ChooseColorForEditModalProps {
  showColorEditModal?: any;
  setShowColorEditModal?: any;
  setShowEditModal?: any;
  returnColor: (val: any) => void;
}
const ChooseColorForEditModal: React.FC<ChooseColorForEditModalProps> = ({
  showColorEditModal,
  setShowColorEditModal,
  setShowEditModal,
  returnColor,
}) => {
  const [colors, setColors] = useState([
    {
      text: true,
    },
    { backgroundColor: COLORS.lightRed },
    {
      backgroundColor: COLORS.purple,
    },
    {
      backgroundColor: COLORS.creamColor,
    },
    {
      backgroundColor: COLORS.green,
    },
    {
      backgroundColor: COLORS.skyBlue,
    },
  ]);

  const handleColorPress = (item) => {
    setShowColorEditModal(false);
    setShowEditModal(true);
    returnColor({ type: showColorEditModal, color: item });
  };
  return (
    <Modal
      transparent={true}
      visible={showColorEditModal?.length > 0}
      animationType="fade"
    >
      <TouchableWithoutFeedback onPress={() => setShowColorEditModal(false)}>
        <View style={styles.mainContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.innerContainer}>
              <Text style={styles.chooseColorTextStyle}>Choose Color</Text>
              <View style={styles.barStyle}></View>
              <FlatList
                contentContainerStyle={styles.flatListContentContainer}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                data={colors}
                renderItem={({ item, index }) => {
                  return (
                    <ColorBox
                      item={item}
                      key={index}
                      onPress={() => handleColorPress(item)}
                    />
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

export default ChooseColorForEditModal;
