import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { styles } from "./style";
import CustomHeader from "../../Components/CustomHeader";
import { icn } from "../../assets/icons";
import { COLORS } from "../../utils/colors";
import { hp, rwp } from "../../utils/reponsiveness";
import CustomInputField from "../../Components/CustomInputField";
import CustomButton from "../../Components/CustomButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
interface PayMentMethodProps {
  navigation?: any;
  route?: any;
}
const PayMentMethod: React.FC<PayMentMethodProps> = ({ navigation, route }) => {
  const isEBook = route?.params?.isEBook;

  const [buttonCheck, setButtonCheck] = useState(true);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [savePaymentCheck, setSavePaymentCheck] = useState(true);
  const HeaderOnPress = () => {
    if (isEBook) {
      navigation.goBack();
    } else {
      navigation.navigate("BottomTab", { screen: "ShopTab" });
    }
  };

  return (
    <View style={styles.mainContainer}>
      <CustomHeader text="Payment Method" onPress={() => HeaderOnPress()} />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraHeight={-90}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: hp(0.5),
        }}
      >
        <View style={styles.checkAbleContainer}>
          <Text style={styles.payWithCardTextStyle}>Pay with Card</Text>
          <TouchableOpacity onPress={() => setButtonCheck(!buttonCheck)}>
            <Image
              source={
                buttonCheck ? icn.buttonFilledCheckMark : icn.buttonCheckMark
              }
              style={styles.buttonCheckMarkStyle}
            />
          </TouchableOpacity>
        </View>
        <CustomInputField
          placeHolder={"Card Number *"}
          value={cardNumber}
          onChangeText={(txt: any) => setCardNumber(txt)}
          rightIcn={cardNumber !== "" && true}
          source={icn.tickIcn}
          disabled={true}
          keyboardType={"numeric"}
        />
        <CustomInputField
          placeHolder={"Expiry Date *"}
          value={expiryDate}
          onChangeText={(txt: any) => setExpiryDate(txt)}
          keyboardType={"numeric"}
        />
        <CustomInputField
          placeHolder={"CVV *"}
          value={cvv}
          onChangeText={(txt: any) => setCvv(txt)}
          keyboardType={"numeric"}
        />
        <CustomInputField
          placeHolder={"Name on card*"}
          value={nameOnCard}
          onChangeText={(txt: any) => setNameOnCard(txt)}
          // keyboardType={'numeric'}
        />
        {isEBook && (
          <View>
            <View style={styles.textCheckBoxContainer}>
              <Text style={styles.saveForNextTextStyle}>
                Save for Next Payment
              </Text>
              <TouchableOpacity
                onPress={() => setSavePaymentCheck(!savePaymentCheck)}
              >
                <Image
                  source={savePaymentCheck ? icn.checkOn : icn.checkOff}
                  style={styles.checkOnIcnStyle}
                />
              </TouchableOpacity>
            </View>
            <CustomButton
              text="Pay 29 $"
              oddTextStyle={styles.payNowTextStyle}
              onPress={() =>
                navigation.navigate("PurchaseSuccessful", { isEBook: true })
              }
            />
            <Text style={styles.orTextStyle}>OR</Text>
            <CustomButton
              source={icn.gPayIcn}
              leftIconStyle={styles.gPayIcnStyle}
              oddContainerStyle={styles.gPayOddContainerStyle}
            />
            <CustomButton
              text="Pay with"
              source2={true}
              oddContainerStyle={styles.applePayContainerStyle}
              oddTextStyle={styles.applePyaTextStyle}
            />
          </View>
        )}
        {!isEBook && (
          <View style={styles.customButtonContainer}>
            <View style={styles.textCheckBoxContainer}>
              <Text style={styles.saveForNextTextStyle}>
                Save for Next Payment
              </Text>
              <TouchableOpacity
                onPress={() => setSavePaymentCheck(!savePaymentCheck)}
              >
                <Image
                  source={savePaymentCheck ? icn.checkOn : icn.checkOff}
                  style={styles.checkOnIcnStyle}
                />
              </TouchableOpacity>
            </View>
            <CustomButton
              text="Pay 29 $"
              oddTextStyle={styles.oddTextStyle}
              onPress={() => navigation.navigate("PurchaseSuccessful")}
            />
          </View>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
};

export default PayMentMethod;
