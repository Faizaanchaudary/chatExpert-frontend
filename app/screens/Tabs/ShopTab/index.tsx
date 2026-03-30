import {
  Image,
  ImageBackground,
  NativeEventEmitter,
  NativeModules,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {styles} from './style';
import {img} from '../../../assets/img';
import {useSelector} from 'react-redux';
interface ShopTabProps {
  navigation?: any;
}
const ShopTab: React.FC<ShopTabProps> = ({navigation}) => {
  const user = useSelector((state: any) => state?.user?.user);

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.textStyle}>
        {'Welcome to Chat Book\n'}
        <Text style={styles.nameTextStyle}>Hi! {user?.fullName}</Text>{' '}
      </Text>
      <View style={styles.photoBookMainCon}>
        <View style={styles.photoBookInnerCon}>
          <Text style={styles.firstOrderTextStyle}>
            {'Get 50% off on\nYour First order'}
          </Text>
          <Text style={styles.availBeforeTextStyle}>
            Avail before 20 march, 2024
          </Text>
        </View>
        <Image source={img.photoBookImg} style={styles.photoBookImgStyle} />
        <View style={styles.percentTextCon}>
          <Text style={styles.percentTextStyle}>50%</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.touchableContainer}
        onPress={() => navigation.navigate('ChooseFormat')}>
        <Text style={styles.photoBookTextStyle}>Photo Book</Text>
        <Image source={img.photoBookLessGradient} style={styles.touchAbleImg} />
      </TouchableOpacity>
    </View>
  );
};

export default ShopTab;
