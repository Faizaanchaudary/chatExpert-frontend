import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import CustomHeader from '../../Components/CustomHeader';
import {styles} from './style';
import CartDetailCard from '../../Components/CartDetailCard';
import CustomButton from '../../Components/CustomButton';
import AddressCard from '../../Components/AddressCard';
import DiscountCard from '../../Components/DiscountCard';
import {hp} from '../../utils/reponsiveness';
interface CartDetailProps {
  navigation?: any;
}
const CartDetail: React.FC<CartDetailProps> = ({navigation}) => {
  const [cartDetailData, setCartDetailData] = useState([
    {
      bookTitle: 'Photo Book #1',
      size: '1*21*21cm',
      price: '$29',
      quantity: 1,
    },
  ]);
  const [addressCardData, setAddressCardData] = useState([
    {
      country: 'UAE',
      city: 'Alnayab',
      name: 'Jason Roy',
      phoneNumber: '+23567899456566',
      addressLine: 'Address line 1',
    },
  ]);
  const changeQuantity = (type?: any, index?: number) => {
    const updatedArr = [...cartDetailData];

    updatedArr[index] = {
      ...updatedArr[index],
      quantity:
        type == 'plus'
          ? updatedArr[index].quantity + 1
          : updatedArr[index].quantity > 0
          ? updatedArr[index].quantity - 1
          : 0,
    };

    setCartDetailData(updatedArr);
  };
  const addressCardOnPress = item => {
    navigation.navigate('Addresses', {isProfileTab: false});
  };
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexGrow: 1,
      }}>
      <View style={styles.mainContainer}>
        <View style={styles.innerContainer}>
          <CustomHeader
            text="Cart"
            onPress={() =>
              navigation.navigate('BottomTab', {screen: 'ShopTab'})
            }
          />
          {cartDetailData.map((item, index) => {
            return (
              <CartDetailCard
                item={item}
                key={index}
                plusOnPress={() => changeQuantity('plus', index)}
                minusOnPress={() => changeQuantity('minus', index)}
              />
            );
          })}
          <View style={styles.barStyle}></View>
          <CustomButton
            text="Add another Product"
            oddContainerStyle={styles.oddContainerStyle}
            oddTextStyle={styles.oddTextStyle}
            onPress={() =>
              navigation.navigate('BottomTab', {screen: 'ShopTab'})
            }
          />
          <View style={styles.subtotalContainer}>
            <Text style={styles.subtotalTextStyle}>Subtotal</Text>
            <Text style={styles.priceTextStyle}>$29</Text>
          </View>
          <View style={styles.deliverDateContainer}>
            <Text style={styles.deliveryDateTextStyle}>
              • Estimated delivery date 18-22 May
            </Text>
          </View>
          {addressCardData.map((item, index) => {
            return (
              <AddressCard
                item={item}
                key={index}
                cardOnPress={() => addressCardOnPress(item)}
              />
            );
          })}
          <TouchableOpacity onPress={() => navigation.navigate('Addresses')}>
            <Text style={styles.addAnotherTextStyle}>Add another Address</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.pricingMainContainer}>
          <DiscountCard
            discountPrice={'-$1.5'}
            yourSaving={'-$1.5'}
            totalPrice={'$29'}
          />
          <View style={styles.customButtonContainer}>
            <CustomButton
              text="Buy Now"
              oddTextStyle={styles.buyNowTextStyle}
              onPress={() => navigation.navigate('PayMentMethod')}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default CartDetail;
