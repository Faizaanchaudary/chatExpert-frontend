import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useState } from "react";
import CustomHeader from "../CustomHeader";
import { styles } from "./style";
import { hp, rfs, rhp, rwp, wp } from "../../utils/reponsiveness";
import { COLORS } from "../../utils/colors";
import CustomButton from "../CustomButton";
import CustomInputField from "../CustomInputField";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
interface AddTextModalProps {
  visible?: any;
  onChangeText?: any;
  value?: any;
  headerPress?: () => void;
  withOutFeedbackPress?: () => void;
  onSubmitPress?: (val: any) => void;
  characters?: any;
  alterView?: any;
}
const AddTextModal: React.FC<AddTextModalProps> = ({
  visible,
  onChangeText,
  value,
  headerPress,
  withOutFeedbackPress,
  onSubmitPress,
  characters,
  alterView,
}) => {
  const [text, setText] = useState("");
  return (
    <Modal transparent={true} visible={visible}>
      <TouchableWithoutFeedback onPress={withOutFeedbackPress}>
        <View style={styles.mainContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.innerContainer}>
              <CustomHeader text="Add Text" onPress={headerPress} />
              <KeyboardAwareScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                extraHeight={-90}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: hp(1) }}
              >
                <Text style={styles.writeHereTextStyle}>Write here</Text>
                <TextInput
                  style={
                    alterView
                      ? styles.alterViewStyle
                      : styles.customFieldInputFieldCon
                  }
                  multiline={alterView && true}
                  textAlignVertical={alterView && "top"}
                  value={text}
                  maxLength={characters ? characters : 1500}
                  onChangeText={setText}
                  placeholder="Type Here"
                />

                <Text style={styles.characterTextStyle}>
                  {characters ? characters : 1500} characters
                </Text>
                <View style={styles.customButtonContainer}>
                  <CustomButton
                    text="Submit"
                    onPress={() => {
                      onSubmitPress(text);
                      setText("");
                    }}
                  />
                </View>
              </KeyboardAwareScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AddTextModal;
