import React from "react";
import { Text, TouchableOpacity } from "react-native";

import { COLORS } from "../../utils/colors";
import { rfs } from "../../utils/reponsiveness";
import { styles } from "./style";
interface FontBoxProps {
  item?: any;
  oddStyle?: any;
  oddTextStyle?: any;
  onPress?: () => void;
}
const FontBox: React.FC<FontBoxProps> = ({
  item,
  oddStyle,
  onPress,
  oddTextStyle,
}) => {
  return (
    <TouchableOpacity
      testID="fontBox"
      onPress={onPress}
      style={[styles.mainContainer, oddStyle]}
    >
      <Text
        style={[
          {
            fontFamily: item.fontStyle,
            fontSize: rfs(24),
            color: COLORS.skyBlue,
          },
          oddTextStyle,
        ]}
      >
        {item.letter}
      </Text>
    </TouchableOpacity>
  );
};

export default FontBox;
