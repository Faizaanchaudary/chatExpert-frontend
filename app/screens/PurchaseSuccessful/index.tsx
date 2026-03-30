import { Image, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { styles } from "./style";
import { img } from "../../assets/img";
interface PurchaseSuccessfulProps {
  navigation?: any;
  route?: any;
}
const PurchaseSuccessful: React.FC<PurchaseSuccessfulProps> = ({
  navigation,
  route,
}) => {
  const isEBook = route?.params?.isEBook;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate("WaitLoader");
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigation]);
  return (
    <View style={styles.mainContainer}>
      <Image source={img.blueBag} style={styles.blueBagStyle} />
      <Text style={styles.successfulTextStyle}>Successfully Purchased</Text>
      <Text
        style={
          isEBook ? styles.receivedAtEmailTextStyle : styles.deliveredTextStyle
        }
      >
        {isEBook
          ? "Will be received at email in 1 Hour"
          : "Will be delivered in 12-18 May"}
      </Text>
    </View>
  );
};

export default PurchaseSuccessful;
