import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { styles } from "./style";
import { icn } from "../../assets/icons";
interface CustomButtonProps {
  text?: string;
  oddContainerStyle?: any;
  oddTextStyle?: any;
  onPress?: () => void;
  disable?: any;
  source?: any;
  leftIconStyle?: any;
  source2?: any;
  animating?: boolean;
  testId?: any;
}
const CustomButton: React.FC<CustomButtonProps> = ({
  text,
  onPress,
  oddContainerStyle,
  oddTextStyle,
  disable,
  source,
  leftIconStyle,
  source2,
  animating,
  testId,
}) => {
  return (
    <TouchableOpacity
      testID={testId}
      onPress={onPress}
      disabled={disable}
      style={[styles.mainContainer, oddContainerStyle]}
    >
      {animating ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ActivityIndicator />
          {text ? <Text style={[styles.textStyle, oddTextStyle]}>{text}</Text> : null}
        </View>
      ) : (
        <>
          {source && (
            <Image source={source} style={[styles.icnStyle, leftIconStyle]} />
          )}
          {text && <Text style={[styles.textStyle, oddTextStyle]}>{text}</Text>}
          {source2 && (
            <Image source={icn.applePayIcn} style={styles.applePayIcn} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
