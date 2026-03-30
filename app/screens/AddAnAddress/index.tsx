import React, { useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { icn } from "../../assets/icons";
import CustomButton from "../../Components/CustomButton";
import CustomHeader from "../../Components/CustomHeader";
import CustomInputField from "../../Components/CustomInputField";
import { hp } from "../../utils/reponsiveness";
import { styles } from "./style";
import { useDispatch } from "react-redux";
import { enableSnackbar } from "../../store/Slice/snackbarSlice";
import { addAddress } from "../../services/calls";
interface AddAnAddressProps {
  navigation?: any;
}
const AddAnAddress: React.FC<AddAnAddressProps> = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [chooseCity, setChooseCity] = useState("");
  const [giveName, setGiveName] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const addAddressCall = async () => {
    try {
      setLoading(true);
      const response = await addAddress({
        first_name: firstName,
        last_name: lastName,
        phone_no: phoneNumber,
        address_one: addressLine,
        address_two: addressLine2,
        city: chooseCity,
        country: country,
        postal_code: postalCode,
        given_name: giveName,
      });
      console.log("Res", response?.data);
      if (response?.status == 200 || response?.status == 201) {
        console.log("Addresses", response?.data);
        dispatch(enableSnackbar("Address added successfully"));
        navigation.goBack();
      } else {
        dispatch(enableSnackbar("Something went wrong"));
      }
    } catch (err: any) {
      console.log("err", err?.response);
      if (err?.response?.data?.errors) {
        dispatch(enableSnackbar(err?.response?.data?.errors));
        Alert.alert("Error", err?.response?.data?.errors);
      } else {
        dispatch(enableSnackbar("Something went wrong"));
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.mainContainer}>
      <CustomHeader text="Add an Address" onPress={() => navigation.goBack()} />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraHeight={-90}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: hp(10),
          marginTop: hp(3),
        }}
      >
        <CustomInputField
          placeHolder={"Country"}
          // editable={false}
          // rightIcn={true}
          value={country}
          onChangeText={(txt: any) => setCountry(txt)}
          source={icn.dropDownIcn}
        />
        <CustomInputField
          placeHolder={"First Name *"}
          value={firstName}
          onChangeText={(txt: any) => setFirstName(txt)}
        />
        <CustomInputField
          placeHolder={"Last Name"}
          value={lastName}
          onChangeText={(txt: any) => setLastName(txt)}
        />
        <CustomInputField
          placeHolder={"Phone Number *"}
          value={phoneNumber}
          onChangeText={(txt: any) => setPhoneNumber(txt)}
          keyboardType={"numeric"}
        />
        <CustomInputField
          placeHolder={"Address Line 1 *"}
          value={addressLine}
          onChangeText={(txt: any) => setAddressLine(txt)}
        />
        <CustomInputField
          placeHolder={"Address Line 2 *"}
          value={addressLine2}
          onChangeText={(txt: any) => setAddressLine2(txt)}
        />
        <CustomInputField
          placeHolder={"Postal code (optional)"}
          value={postalCode}
          onChangeText={(txt: any) => setPostalCode(txt)}
        />
        <CustomInputField
          placeHolder={"City"}
          value={chooseCity}
          onChangeText={(txt: any) => setChooseCity(txt)}
          // editable={true}
          // rightIcn={true}
          source={icn.dropDownIcn}
        />
        <CustomInputField
          placeHolder={"Give a name (optional)"}
          value={giveName}
          onChangeText={(txt: any) => setGiveName(txt)}
        />

        <View style={styles.customButtonContainer}>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <CustomButton
              text="Save"
              oddTextStyle={styles.oddTextStyle}
              onPress={() => addAddressCall()}
            />
          )}
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default AddAnAddress;
