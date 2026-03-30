import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useEffect, useState } from "react";
import { styles } from "./style";
import { icn } from "../../assets/icons";
interface DateFormatModalProps {
  setShowFormatDateModal?: any;
  showFormatDateModal?: any;
  setShowEditModal?: any;
  setDateFormat?: any;
}
const DateFormatModal: React.FC<DateFormatModalProps> = ({
  setShowFormatDateModal,
  showFormatDateModal,
  setShowEditModal,
  setDateFormat,
}) => {
  const [formatDateData, setFormatDateData] = useState([
    {
      text: "French dd/mm/yyyy",
      checkBox: true,
    },
    {
      text: "Germany yyy-mm-dd",
      checkBox: false,
    },
  ]);
  const sortDatePress = (index: number) => {
    const updatedArr = formatDateData.map((item, idx) => ({
      ...item,
      checkBox: idx === index ? !item.checkBox : false,
    }));
    setFormatDateData(updatedArr);
    setShowFormatDateModal(false);
    setShowEditModal(true);
  };

  useEffect(() => {
    if (formatDateData[0]?.checkBox) {
      setDateFormat("DD/MM/YYYY hh:mm A");
    } else {
      setDateFormat("YYYY/MM/DD hh:mm A");
    }
  }, [formatDateData]);

  return (
    <Modal
      transparent={true}
      visible={showFormatDateModal}
      animationType="fade"
    >
      <TouchableWithoutFeedback onPress={() => setShowFormatDateModal(false)}>
        <View style={styles.mainContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.innerContainer}>
              <Text style={styles.dateFormatTextStyle}>Date Format</Text>
              <View style={styles.barStyle}></View>
              {formatDateData.map((item, index) => {
                return (
                  <View key={index} style={styles.container}>
                    <Text style={styles.newestTextColor}>{item.text}</Text>
                    <TouchableOpacity onPress={() => sortDatePress(index)}>
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

export default DateFormatModal;
