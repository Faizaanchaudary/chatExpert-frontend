import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useState } from "react";
import { styles } from "./style";
import { icn } from "../../assets/icons";
import { wp } from "../../utils/reponsiveness";
interface SortMessageModalProps {
  setShowSortMessageModal?: any;
  showSortMessageModal?: any;
  setShowEditModal?: any;
  returnSorted: (val: any) => void;
}
const SortMessageModal: React.FC<SortMessageModalProps> = ({
  setShowSortMessageModal,
  showSortMessageModal,
  setShowEditModal,
  returnSorted,
}) => {
  const [sortMessageData, setSortMessageData] = useState([
    {
      text: "Newest First",
      checkBox: false,
    },
    {
      text: "Oldest First",
      checkBox: true,
    },
  ]);
  const sortMessagePress = (index: number) => {
    const updatedArr = sortMessageData.map((item, idx) => ({
      ...item,
      checkBox: idx === index ? !item.checkBox : false,
    }));
    setSortMessageData(updatedArr);
    setShowSortMessageModal(false);
    setShowEditModal(true);

    returnSorted(updatedArr);
  };
  return (
    <Modal
      visible={showSortMessageModal}
      transparent={true}
      animationType="fade"
    >
      <TouchableWithoutFeedback onPress={() => setShowSortMessageModal(false)}>
        <View style={styles.mainContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.innerContainer}>
              <Text style={styles.sortMessageTextStyle}>Sort Messages</Text>
              <View style={styles.barStyle}></View>
              {sortMessageData.map((item, index) => {
                return (
                  <View key={index} style={styles.container}>
                    <Text style={styles.newestTextColor}>{item.text}</Text>
                    <TouchableOpacity onPress={() => sortMessagePress(index)}>
                      <Image
                        source={
                          item.checkBox
                            ? icn.blackCheckBox
                            : icn.blackUnFillCheckBox
                        }
                        style={styles.blackCheckIcn}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default SortMessageModal;
