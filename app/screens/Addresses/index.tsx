import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import CustomHeader from "../../Components/CustomHeader";
import MyAddressCard from "../../Components/MyAddressCard";
import { getAddresses, removeAddress } from "../../services/calls";
import { styles } from "./style";
import { useSelector } from "react-redux";
import { store } from "../../store/Store";
import { setAddress } from "../../store/Slice/userSlice";
import { ScrollView } from "react-native-gesture-handler";
interface AddressesProps {
  navigation?: any;
  route?: any;
}
const Addresses: React.FC<AddressesProps> = ({ navigation, route }) => {
  const isAddAddress = route?.params?.isAddAddress;
  const isProfileTab = route?.params?.isProfileTab;
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const currentAddress = useSelector((state) => state?.user?.currentAddress);
  const [addressData, setAddressData] = useState([
    // {
    // name: "Jason Roy",
    // phoneNumber: "+23567899456566",
    // addressLine: "Address line 1",
    // country: "UAE",
    // city: "Alnayab",
    // },
  ]);

  const deleteAddress = async (id: any) => {
    try {
      setLoading(true);
      const response = await removeAddress(id);

      if (response?.status == 200 || response?.status == 201) {
        console.log("Addresses", response?.data);
        getAddress();
      } else {
        Alert.alert("Something went wrong");
      }
    } catch (err: any) {
      console.log("err", err?.response);
      if (err?.response?.data?.error) {
        Alert.alert("Failure", err?.response?.data?.error);
      } else {
        Alert.alert("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const getAddress = async () => {
    try {
      setLoading(true);
      const response = await getAddresses();
      console.log("Res", response?.data);
      if (response?.status == 200 || response?.status == 201) {
        console.log("Addresses", response?.data);
        setAddressData(response?.data?.addresses);
        if (!currentAddress) {
          if (response?.data?.addresses?.length > 0) {
            store.dispatch(setAddress(response?.data?.addresses[0]));
          }
        }
      } else {
        Alert.alert("Something went wrong");
      }
    } catch (err: any) {
      console.log("err", err?.response);
      if (err?.response?.data?.error) {
        Alert.alert("Failure", err?.response?.data?.error);
      } else {
        Alert.alert("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) getAddress();
  }, [isFocused]);

  const selectedCard = (item: any) => {
    store.dispatch(setAddress(item));
    Alert.alert("Success", "Added as your current address");
    if (route?.params?.back) {
      navigation.goBack();
    }
  };
  const customHeaderOnPress = () => {
    if (route?.params?.back) {
      navigation.goBack();
    } else {
      if (isProfileTab) {
        navigation.navigate("BottomTab", { screen: "ProfileTab" });
      } else {
        navigation.navigate("BottomTab", { screen: "ShopTab" });
      }
    }
  };

  return (
    <View style={styles.mainContainer}>
      <CustomHeader text="Addresses" onPress={customHeaderOnPress} />
      <ScrollView
        style={styles.innerContainer}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {!isProfileTab && (
          <Text style={styles.chooseAddressTextStyle}>
            Choose delivery address
          </Text>
        )}
        {addressData?.length > 0 ? (
          <>
            {addressData.map((item: any, index) => {
              return (
                <MyAddressCard
                  item={item}
                  key={index}
                  disabled={isProfileTab ? true : false}
                  cardOnPress={() => selectedCard(item)}
                  onRemovePress={() => deleteAddress(item?._id)}
                />
              );
            })}
          </>
        ) : (
          <Text style={styles.noAddressText}>No Address Found</Text>
        )}
        <TouchableOpacity onPress={() => navigation.navigate("AddAnAddress")}>
          <Text style={styles.addAnotherText}>Add Address</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Addresses;
