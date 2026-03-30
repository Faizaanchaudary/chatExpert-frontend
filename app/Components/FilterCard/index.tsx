import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { icn } from "../../assets/icons";
import { styles } from "./style";
import { img } from "../../assets/img";
import { hp, rwp } from "../../utils/reponsiveness";
interface FilterCardProps {
  item?: any;
  onPress?: any;
  filter?: any;
}
const FilterCard: React.FC<FilterCardProps> = ({ item, onPress }) => {
  return (
    <View>
      <TouchableOpacity style={styles.mainContainer} onPress={onPress}>
        {item?.textImage && (
          <View style={styles.textImageContainer}>
            <Image source={icn.filtersIcon} style={styles.filterIcnStyle} />
            <Text style={styles.filterTextStyle}>Filters</Text>
          </View>
        )}
        {item?.source && (
          <Image source={item.source} style={styles.filterImage} />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default FilterCard;
