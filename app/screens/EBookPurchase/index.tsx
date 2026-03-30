import {StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {styles} from './style';
import CustomHeader from '../../Components/CustomHeader';
import CustomInputField from '../../Components/CustomInputField';
import {hp, wp} from '../../utils/reponsiveness';
import DiscountCard from '../../Components/DiscountCard';
import CustomButton from '../../Components/CustomButton';
import {COLORS} from '../../utils/colors';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
interface EBookPurchaseProps {
  navigation?: any;
}
const EBookPurchase: React.FC<EBookPurchaseProps> = ({navigation}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  return (
    <View style={styles.mainContainer}>
      <View style={styles.commonPadding}>
        <CustomHeader
          text="E book Purchase"
          onPress={() => navigation.navigate('CartProducts')}
        />
      </View>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraHeight={-90}
        contentContainerStyle={{
          flexGrow: 1,
        }}>
        <View style={styles.commonPadding}>
          <Text style={styles.receiverDesignTextStyle}>
            Where you want to receive the Design?
          </Text>
          <CustomInputField
            placeHolder={'Email *'}
            value={email}
            onChangeText={(txt: any) => setEmail(txt)}
          />
          <CustomInputField
            placeHolder={'Name *'}
            value={name}
            onChangeText={(txt: any) => setName(txt)}
          />
          <CustomInputField
            placeHolder={'Phone Number *'}
            keyboardType={'numeric'}
            value={phoneNumber}
            onChangeText={(txt: any) => setPhoneNumber(txt)}
          />
        </View>
        <View style={styles.discountCardContainer}>
          <DiscountCard
            discountPrice={'-$1.5'}
            yourSaving={'-$1.5'}
            totalPrice={'$10'}
          />
          <CustomButton
            text="Buy Now"
            oddTextStyle={styles.buyNowBtnStyle}
            oddContainerStyle={styles.buyNowOddConStyle}
            onPress={() =>
              navigation.navigate('PayMentMethod', {isEBook: true})
            }
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default EBookPurchase;
