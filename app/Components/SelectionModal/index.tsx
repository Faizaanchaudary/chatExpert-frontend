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
import DatePicker from "react-native-date-picker";
import DateRangePicker from "../RangeDatePicker";
interface SelectionModalProps {
  setShowSelectionModal?: any;
  showSelectionModal?: any;
  setSearchBarState?: any;
  onPressSelectAll: any;
  onPressDeselectAll: any;
  returnFromDate: (val: any) => void;
  returnToDate: (val: any) => void;
}
const SelectionModal: React.FC<SelectionModalProps> = ({
  setShowSelectionModal,
  showSelectionModal,
  setSearchBarState,
  onPressSelectAll,
  onPressDeselectAll,
  returnFromDate,
  returnToDate,
}) => {
  const [dateModal, setDateModal] = useState(false);
  const [selectionData, setSelectionData] = useState([
    {
      icon: true,
      title: "Select All",
      // check: true,
    },
    {
      icon: true,
      title: "Deselect All",
      // check: false,
    },
    {
      icon: true,
      title: "Select By Date",
      image: icn.calenderIcn,
    },
    {
      icon: true,
      title: "Select By Search",
      image: icn.searchIcn,
    },
  ]);
  const itemPress = (item, index) => {
    console.log("🚀 ~ itemPress ~ item:", item);

    if (item.checkBox) {
      checkBoxPress(index);
    }
    if (item.icon) {
      if (item.title == "Select By Date") {
        // setShowSelectionModal(false);
        setDateModal(true);
      }
      if (item.title == "Select By Search") {
        setShowSelectionModal("");
        setSearchBarState(true);
      }
      if (item.title == "Select All") {
        setShowSelectionModal("");
        onPressSelectAll();
      }
      if (item.title == "Deselect All") {
        setShowSelectionModal("");
        onPressDeselectAll();
      }
    }
  };

  const checkBoxPress = (index: number) => {
    const updatedArr = selectionData.map((item, idx) => ({
      ...item,
      check: idx === index ? !item.check : false,
    }));
    setSelectionData(updatedArr);
    setShowSelectionModal(false);
  };
  return (
    <Modal transparent={true} visible={showSelectionModal} animationType="fade">
      <TouchableWithoutFeedback onPress={() => setShowSelectionModal(false)}>
        <View style={styles.mainContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.innerContainer}>
              {/* <DatePicker
                modal
                open={dateModal}
                date={new Date()}
                mode="date"
                onConfirm={(date) => {
                  setDateModal(false);
                  returnDate(date);
                  setShowSelectionModal(false);
                }}
                onCancel={() => {
                  setDateModal(false);
                }}
              /> */}
              {dateModal ? (
                <DateRangePicker
                  onFromDateChange={() => {}}
                  onToDateChange={() => {}}
                  onSubmit={(date: any) => {
                    console.log("Date", date);
                    setDateModal(false);
                    returnFromDate(date?.fromDate);
                    returnToDate(date?.date);
                    setShowSelectionModal(false);
                  }}
                  containerStyle={styles.dateRangeContainer}
                  onCancel={() => setDateModal(false)}
                />
              ) : null}
              <Text style={styles.selectTextStyle}>Select</Text>
              <View style={styles.barStyle}></View>
              <View style={styles.paddingStyle}>
                {selectionData.map((item, index) => {
                  if (item.checkBox) {
                    return (
                      <View key={index} style={styles.checkBoxContainer}>
                        <Text style={styles.titleTextStyle}>{item.title}</Text>
                        <TouchableOpacity
                          onPress={() => itemPress(item, index)}
                        >
                          <Image
                            style={styles.checkBoxStyle}
                            source={
                              item.check
                                ? icn.blackCheckBox
                                : icn.blackUnFillCheckBox
                            }
                          />
                        </TouchableOpacity>
                      </View>
                    );
                  }
                  if (item.icon) {
                    return (
                      <TouchableOpacity
                        onPress={() => itemPress(item, index)}
                        key={index}
                        style={styles.checkBoxContainer}
                      >
                        <Text style={styles.titleTextStyle}>{item.title}</Text>
                        <Image source={item.image} style={styles.iconStyle} />
                      </TouchableOpacity>
                    );
                  }
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default SelectionModal;
