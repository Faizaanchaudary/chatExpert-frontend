import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { styles } from "./style";
import { COLORS } from "../../utils/colors";
import Slider from "@react-native-community/slider";
import { wp } from "../../utils/reponsiveness";
import { icn } from "../../assets/icons";
interface EditModalProps {
  setShowEditModal?: any;
  showEditModal?: any;
  setShowSortMessageModal?: any;
  setShowFormatDateModal?: any;
  setShowColorEditModal?: any;
  setShowFontsModal?: any;
  returnFontSize?: (val: any) => void;
  returnHideName?: (val: any) => void;
  colors: any;
  sortOrder: any;
  dateFormat: any;
}
const EditModal: React.FC<EditModalProps> = ({
  setShowEditModal,
  showEditModal,
  setShowSortMessageModal,
  setShowFormatDateModal,
  setShowColorEditModal,
  setShowFontsModal,
  returnHideName,
  returnFontSize,
  dateFormat,
  sortOrder,
  colors,
}) => {
  const [sliderVal, setSliderVal] = useState(10);
  const [hideName, setHideName] = useState(false);
  const [editModalData, setEditModalData] = useState<any>([]);
  useEffect(() => {
    if (returnHideName) returnHideName(hideName);
  }, [hideName]);

  useEffect(() => {
    setEditModalData([
      {
        id: 1,
        textAndSquare: true,
        title: "Chat Background",
        squareColor: colors?.cb,
      },
      // {
      //   id: 2,
      //   textAndSquare: true,
      //   title: "Header Color",
      //   squareColor: COLORS.skyBlue,
      // },
      {
        id: 3,
        textAndText: true,
        title: "Font",
        otherText: "See",
      },
      {
        id: 4,
        textAndText: true,
        title: "Sort Messages",
        otherText: sortOrder == "of" ? "Old First" : "New First",
      },
      {
        id: 5,
        slider: true,
      },
      // {
      //   id: 6,
      //   checkBox: true,
      //   checkBoxImage: true,
      //   title: "Profile Photo Visible",
      // },
      {
        id: 7,
        checkBox: true,
        checkBoxImage: true,
        title: "Remove the Name on Messages",
      },
      {
        id: 8,
        textAndSquare: true,
        title: "Received Message Background",
        squareColor: colors?.rb,
      },
      {
        id: 9,
        textAndSquare: true,
        title: "Received Message Color",
        squareColor: colors?.rt,
      },
      {
        id: 6,
        textAndSquare: true,
        title: "Sent Message Background",
        squareColor: colors?.sb,
      },
      {
        id: 10,
        textAndSquare: true,
        title: "Sent Message Color",
        squareColor: colors?.st,
      },
      {
        id: 11,
        textAndText: true,
        title: "Date Format",
        otherText: dateFormat == "DD/MM/YYYY hh:mm A" ? "French" : "German",
      },
    ]);
  }, [colors, sortOrder, dateFormat]);

  const onPressWithSquare = (item, index) => {
    if (item.textAndSquare) {
      setShowEditModal(false);
      setShowColorEditModal(item?.title);
    }
    if (item.textAndText) {
      if (item.title == "Sort Messages") {
        setShowEditModal(false);
        setShowSortMessageModal(true);
      }
      if (item.title == "Date Format") {
        setShowFormatDateModal(true);
        setShowEditModal(false);
      }
      if (item.title == "Font") {
        setShowFontsModal(true);
        setShowEditModal(false);
      }
    }
    if (item.checkBox) {
      console.log(item.title);
      NameOnMessage();
    } else {
      null;
    }
  };
  const NameOnMessage = () => {
    setHideName(!hideName);
  };
  return (
    <Modal transparent={true} visible={showEditModal} animationType="fade">
      <TouchableWithoutFeedback onPress={() => setShowEditModal(false)}>
        <View style={styles.mainContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.innerContainer}>
              <Text style={styles.editChatTextStyle}>Edit Chat</Text>
              <View style={styles.barStyle}></View>
              <View style={styles.paddingStyle}>
                {editModalData.map((item, index) => {
                  {
                    if (item.textAndSquare) {
                      return (
                        <TouchableOpacity
                          onPress={() => onPressWithSquare(item, index)}
                          key={index}
                          style={styles.squareTextContainer}
                        >
                          <Text style={styles.squareTextColor}>
                            {item.title}
                          </Text>
                          <View
                            style={[
                              styles.squareColor,
                              { backgroundColor: item.squareColor },
                            ]}
                          />
                        </TouchableOpacity>
                      );
                    }
                    if (item.textAndText) {
                      return (
                        <TouchableOpacity
                          onPress={() => onPressWithSquare(item, index)}
                          key={index}
                          style={styles.squareTextContainer}
                        >
                          <Text style={styles.squareTextColor}>
                            {item.title}
                          </Text>
                          <Text style={styles.otherTextStyle}>
                            {item.otherText}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                    if (item.slider) {
                      return (
                        <View style={styles.squareTextContainer} key={index}>
                          <Text style={styles.sliderTextStyle}>Text Size</Text>
                          <Slider
                            style={styles.sliderStyle}
                            minimumValue={8}
                            maximumValue={25}
                            value={sliderVal}
                            onValueChange={(val) => {
                              setSliderVal(val);
                              if (returnFontSize) returnFontSize(val);
                            }}
                            minimumTrackTintColor={COLORS.brown}
                            maximumTrackTintColor={COLORS.brown}
                            thumbTintColor={COLORS.textBlack}
                          />
                          <Text style={styles.otherTextStyle}>
                            {sliderVal.toFixed()}
                          </Text>
                        </View>
                      );
                    }
                    if (item.checkBox) {
                      return (
                        <View key={index} style={styles.squareTextContainer}>
                          <Text style={styles.squareTextColor}>
                            {item.title}
                          </Text>
                          <TouchableOpacity
                            onPress={() => onPressWithSquare(item, index)}
                          >
                            <Image
                              style={styles.checkBoxStyle}
                              source={hideName ? icn.checkOn : icn.checkOff}
                            />
                          </TouchableOpacity>
                        </View>
                      );
                    }
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

export default EditModal;
