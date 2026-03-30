import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {icn} from '../../assets/icons';
import {styles} from './style';
interface IconTitleProps {
  text?: any;
  price?: any;
  source?: any;
}
const IconTitle: React.FC<IconTitleProps> = ({text, price, source}) => {
  return (
    <View style={styles.mainContainer}>
      <Image source={source} style={styles.iconStyle} />
      <Text style={styles.textStyle}>{text}</Text>
      <Text style={styles.priceTextStyle}>{price}</Text>
    </View>
  );
};

export default IconTitle;
