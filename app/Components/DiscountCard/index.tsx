import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {styles} from './style';
interface DiscountCardProps {
  discountPrice?: any;
  yourSaving?: any;
  totalPrice?: any;
}
const DiscountCard: React.FC<DiscountCardProps> = ({
  discountPrice,
  totalPrice,
  yourSaving,
}) => {
  return (
    <View style={styles.totalPriceContainer}>
      <View style={styles.titleAndTileContainer}>
        <Text style={styles.discountTextStyle}>Discount</Text>
        <Text style={styles.discountPriceTextStyle}>{discountPrice}</Text>
      </View>
      <View style={styles.titleAndTileContainer}>
        <Text style={styles.discountTextStyle}>Your Savings</Text>
        <Text style={styles.discountPriceTextStyle}>{yourSaving}</Text>
      </View>
      <View style={styles.totalPriceInnerContainer}>
        <Text style={styles.totalPriceTextStyle}>Total Price</Text>
        <Text style={styles.totalPriceNumberTextStyle}>{totalPrice}</Text>
      </View>
    </View>
  );
};

export default DiscountCard;
