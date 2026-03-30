import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {styles} from './style';
interface ToggleButtonProps {
  oddContainerStyle?: any;
  oddTextStyle?: any;
  onPress?: () => void;
  title?: any;
}
const ToggleButton: React.FC<ToggleButtonProps> = ({
  oddContainerStyle,
  oddTextStyle,
  onPress,
  title,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.touchableContainerStyle, oddContainerStyle]}>
      <Text style={[styles.textStyle, oddTextStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default ToggleButton;
