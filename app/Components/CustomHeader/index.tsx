import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {icn} from '../../assets/icons';
import {styles} from './style';
import {wp} from '../../utils/reponsiveness';
interface CustomHeaderProps {
  text?: string;
  rightText?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  onPressRight?: () => void;
}
const CustomHeader: React.FC<CustomHeaderProps> = ({
  text,
  onPress,
  onPressRight,
  rightText,
  rightElement,
}) => {
  return (
    <View style={styles.mainContainer} testID="customHeader">
      <TouchableOpacity onPress={onPress} testID="back">
        <Image source={icn.backArrowIcn} style={styles.icnStyle} />
      </TouchableOpacity>
      <Text style={styles.textStyle}>{text}</Text>
      <TouchableOpacity onPress={onPressRight} style={{paddingRight: wp(3)}}>
        {rightElement ? rightElement : null}
        {rightText && <Text style={styles.rightText}>{rightText}</Text>}
      </TouchableOpacity>
    </View>
  );
};

export default CustomHeader;
