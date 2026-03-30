import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { styles } from "./style";
interface ColorBoxProps {
  item?: any;
  onPress?: () => void;
}
const ColorBox: React.FC<ColorBoxProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.mainContainer(item.text, item.backgroundColor, item.image)}
    >
      {item.text && <Text style={styles.noneTextStyle}>None</Text>}
      {item.image && <Image source={item.image} style={styles.imageStyle} />}
    </TouchableOpacity>
  );
};

export default ColorBox;
