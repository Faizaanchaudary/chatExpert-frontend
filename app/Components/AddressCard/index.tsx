import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { styles } from "./style";
import { icn } from "../../assets/icons";
import { hp } from "../../utils/reponsiveness";
interface AddressCardProps {
  item?: any;
  cardOnPress?: any;
  showNoDel?: boolean;
}
const AddressCard: React.FC<AddressCardProps> = ({
  item,
  cardOnPress,
  showNoDel,
}) => {
  return (
    <TouchableOpacity style={styles.mainContainer} onPress={cardOnPress}>
      <View style={styles.textContainerStyle}>
        <Text style={styles.addressTextStyle}>Address</Text>
        <Text style={styles.mainAddressTextStyle}>
          {`${item.country}, ${item.city}\n${
            item.name ? item?.name : item?.first_name + " " + item?.last_name
          }\n${item.phoneNumber ? item.phoneNumber : item?.phone_no}\n${
            item.addressLine ? item.addressLine : item?.address_one
          }`}
        </Text>
      </View>
      {showNoDel ? null : (
        <TouchableOpacity style={styles.deleteContainerStyle}>
          <Image source={icn.deleteIcn} style={styles.deleteIcnStyle} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};
export default AddressCard;
