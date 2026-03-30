import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {styles} from './style';
import {icn} from '../../assets/icons';
import {rhp, rwp, wp} from '../../utils/reponsiveness';
import {COLORS} from '../../utils/colors';
interface OrderCardProps {
  item?: any;
}
const OrderCard: React.FC<OrderCardProps> = ({item}) => {
  return (
    <View style={styles.mainContainer}>
      <View style={styles.deliveryPriceContainer}>
        <Text style={styles.deliverTextStyle}>{item.deliveryNumber}</Text>
        <Text style={styles.priceTextStyle}>
          Price:
          <Text style={styles.numberTextStyle}> {item.price}</Text>
        </Text>
      </View>
      <View style={{paddingLeft: wp(2)}}>
        <Text style={styles.sizeCmTextStyle}>1. {item.photoBookSize}</Text>
        <Text style={styles.sizeCmText2Style}>2. {item.photoBookSize2}</Text>
      </View>
      <View style={styles.mapIcnContainer}>
        <Image source={icn.mapIcn} style={styles.mapIcnStyle} />
        <Text style={styles.addressTextStyle}>
          {item.addressLine}, {item.country}, {item.city}
        </Text>
      </View>
      <View style={styles.orderDateAndBarContainer}>
        <View>
          <Text style={styles.orderDateTextStyle}>Order date</Text>
        </View>
        <View style={styles.blackDotContainer}>
          <View style={styles.blackCircleStyle}></View>
          <View style={styles.blackBarStyle}></View>
          <View style={styles.blackCircleStyle}></View>
        </View>
        <View>
          <Text style={styles.orderDateTextStyle}>Delivery date</Text>
        </View>
      </View>
      <View style={styles.realTimeDateContainer}>
        <Text style={styles.deliverAndOrderDateTextStyle}>
          {item.orderDate}
        </Text>
        <Text style={styles.deliveryDateTextStyle}>{item.deliveryDate}</Text>
      </View>
    </View>
  );
};

export default OrderCard;
