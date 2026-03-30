import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React from "react";
import { styles } from "./style";
import { icn } from "../../assets/icons";
interface ChooseImportModalProps {
  importChatPress?: () => void;
  importPhotoPress?: () => void;
  addTextPress?: () => void;
  withOutFeedBackPress?: () => void;
  visible?: any;
}
const ChooseImportModal: React.FC<ChooseImportModalProps> = ({
  importChatPress,
  importPhotoPress,
  addTextPress,
  withOutFeedBackPress,
  visible,
}) => {
  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={withOutFeedBackPress}>
        <View style={styles.mainContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.innerContainer}>
              <Text style={styles.chooseImportTextStyle}>Choose to Import</Text>
              <View style={styles.barStyle}></View>
              <View style={styles.paddingStyle}>
                <TouchableOpacity
                  style={styles.touchableCOntainerStyle}
                  onPress={importChatPress}
                >
                  <Image source={icn.whatsAppIcn} style={styles.icnStyle} />
                  <Text style={styles.formWhatsAppTextStyle}>
                    Import Chat from WhatsApp
                  </Text>
                  <Image
                    source={icn.forwardBlackArrow}
                    style={styles.icnStyle}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.touchableCOntainerStyle}
                  onPress={importPhotoPress}
                >
                  <Image source={icn.galleryIcn} style={styles.icnStyle} />
                  <Text style={styles.formWhatsAppTextStyle}>
                    Import Photos
                  </Text>
                  <Image
                    source={icn.forwardBlackArrow}
                    style={styles.icnStyle}
                  />
                </TouchableOpacity>
                {/*  <TouchableOpacity
                  style={styles.touchableCOntainerStyle}
                  onPress={addTextPress}>
                  <Image source={icn.fontIcn} style={styles.icnStyle} />
                  <Text style={styles.formWhatsAppTextStyle}>Add Text</Text>
                  <Image
                    source={icn.forwardBlackArrow}
                    style={styles.icnStyle}
                  />
                </TouchableOpacity> */}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ChooseImportModal;
