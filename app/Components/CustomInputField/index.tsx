import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { COLORS } from "../../utils/colors";
import { icn } from "../../assets/icons";
import { styles } from "./style";
interface CustomInputFieldProps {
  placeHolder?: any;
  value?: any;
  onChangeText?: any;
  keyboardType?: any;
  rightIcn?: any;
  editable?: any;
  source?: any;
  oddInputFieldContainer?: any;
  multiLine?: any;
  rightIcnOnPress?: () => void;
  blurPlaceHolder?: any;
  disabled?: any;
  secureTextEntry?: any;
  textAlignVertical?: any;
  testID?: any;
}
const CustomInputField: React.FC<CustomInputFieldProps> = ({
  placeHolder,
  value,
  onChangeText,
  keyboardType,
  rightIcn,
  editable,
  source,
  oddInputFieldContainer,
  multiLine,
  rightIcnOnPress,
  blurPlaceHolder,
  disabled,
  secureTextEntry,
  textAlignVertical,
  testID,
}) => {
  return (
    <View style={[styles.inputFieldContainer, oddInputFieldContainer]}>
      <TextInput
        testID={testID}
        placeholder={placeHolder}
        value={value}
        textAlignVertical={textAlignVertical}
        onChangeText={onChangeText}
        style={styles.inputFieldStyle}
        placeholderTextColor={
          blurPlaceHolder ? COLORS.greyish : COLORS.textBlack
        }
        keyboardType={keyboardType}
        editable={editable}
        multiline={multiLine}
        secureTextEntry={secureTextEntry}
      />
      {rightIcn && (
        <TouchableOpacity onPress={rightIcnOnPress} disabled={disabled}>
          <Image source={source} style={styles.tickIcnStyle} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default CustomInputField;
