import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { styles } from "./style";
import { icn } from "../../assets/icons";
interface MyAddressCardProps {
  item?: any;
  disabled?: any;
  cardOnPress?: () => void;
  onRemovePress?: () => void;
}
const MyAddressCard: React.FC<MyAddressCardProps> = ({
  item,
  disabled,
  cardOnPress,
  onRemovePress,
}) => {
  return (
    <TouchableOpacity
      style={styles.mainContainer}
      // disabled={disabled}
      onPress={cardOnPress}
    >
      <View style={{ flex: 1 }}>
        <View style={styles.iconTextContainer}>
          <Image source={icn.addressShadowIcn} style={styles.addressIcnStyle} />
          <Text style={styles.addressTextStyle}>Address</Text>
        </View>
        <Text style={styles.rawTextStyle}>
          {`${item?.first_name + " " + item?.last_name}\n${item.phone_no}\n${
            item.address_one
          }, ${item.country}, ${item.city}`}
        </Text>
      </View>
      <TouchableOpacity onPress={onRemovePress}>
        <Image source={icn.deleteIcn} style={styles.deleteIcnStyle} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default MyAddressCard;
