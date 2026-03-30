import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {img} from '../../assets/img';
import {styles} from './style';
interface ChooseFormatCardProps {
  title?: any;
  price?: any;
  text?: any;
  onPress?: () => void;
}
const ChooseFormatCard: React.FC<ChooseFormatCardProps> = ({
  title,
  price,
  text,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.mainContainer} onPress={onPress}>
      <Image source={img.photoBookOrigin} style={styles.imageStyle} />
      <View style={styles.textMainContainer}>
        <View style={styles.standardBookCon}>
          <Text style={styles.standardText}>{title}</Text>
          <Text style={styles.priceTextStyle}>{price}</Text>
        </View>
        <Text style={styles.centMeterTextStyle}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ChooseFormatCard;
