import {StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import React from 'react';
import {styles} from './style';
import {img} from '../../assets/img';
import {icn} from '../../assets/icons';

interface CartDetailCardProps {
  item?: any;
  minusOnPress?: () => void;
  plusOnPress?: any;
}
const CartDetailCard: React.FC<CartDetailCardProps> = ({
  item,
  minusOnPress,
  plusOnPress,
}) => {
  return (
    <View>
      <View style={styles.mainContainer}>
        <View style={styles.imgTextContainer}>
          <Image source={img.draftImg} style={styles.imgStyle} />
          <View style={styles.textContainer}>
            <Text style={styles.photoBookTextStyle}>
              {item?.bookTitle}
              <Text style={styles.heightCmTextStyle}>{`\n${item?.size}`}</Text>
            </Text>
            <Text style={styles.priceTextStyle}>{item?.price}</Text>
          </View>
        </View>

        <View style={styles.touchAbleContainer}>
          <TouchableOpacity>
            <Image source={icn.deleteIcn} style={styles.deleteIcnStyle} />
          </TouchableOpacity>
          <View style={styles.addMinusBtnCon}>
            <TouchableOpacity onPress={minusOnPress}>
              <Image source={icn.minusButton} style={styles.addButtonIcn} />
            </TouchableOpacity>
            <View style={styles.numberTextContainer}>
              <Text style={styles.numberTextStyle}>{item?.quantity}</Text>
            </View>
            <TouchableOpacity onPress={plusOnPress}>
              <Image source={icn.addButton} style={styles.addButtonIcn} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.previewTextContainer}>
            <Text style={styles.previewTextStyle}>Preview</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CartDetailCard;
