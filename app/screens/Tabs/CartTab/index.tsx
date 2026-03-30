import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import { styles } from "./style";
import CartCard from "../../../Components/CartCard";
import CustomButton from "../../../Components/CustomButton";
import AddressCard from "../../../Components/AddressCard";
import { hp, wp } from "../../../utils/reponsiveness";
import { COLORS } from "../../../utils/colors";
import { icn } from "../../../assets/icons";
import DiscountCard from "../../../Components/DiscountCard";
interface CartTabProps {
  navigation?: any;
}
const CartTab: React.FC<CartTabProps> = ({ navigation }) => {
  const [addressCardData, setAddressCardData] = useState([
    {
      country: "UAE",
      city: "Alnayab",
      name: "Jason Roy",
      phoneNumber: "+23567899456566",
      addressLine: "Address line 1",
    },
  ]);
  const [products, setProducts] = useState([
    {
      id: 1,
      bookTitle: "Photo Book #1",
      checkBoxWithImage: false,
      eBookCheckBox: true,
      bookCoverCheckBox: false,
      eBookOnlyCheckBox: true,
      quantity: 1,
    },
  ]);
  const onCheckBoxPress = (index: any) => {
    const updatedArr = [...products];

    updatedArr[index] = {
      ...updatedArr[index],
      checkBoxWithImage: !updatedArr[index].checkBoxWithImage,
    };

    setProducts(updatedArr);
  };
  const onIncludeEbookPress = (index: any) => {
    const updatedArr = [...products];

    updatedArr[index] = {
      ...updatedArr[index],
      eBookCheckBox: !updatedArr[index].eBookCheckBox,
    };

    setProducts(updatedArr);
  };
  const onBookCoverCheckBox = (index: any) => {
    const updatedArr = [...products];

    updatedArr[index] = {
      ...updatedArr[index],
      bookCoverCheckBox: !updatedArr[index].bookCoverCheckBox,
    };

    setProducts(updatedArr);
  };
  const onEbookOnlyCheckBox = (index: any) => {
    const updatedArr = [...products];

    updatedArr[index] = {
      ...updatedArr[index],
      eBookOnlyCheckBox: !updatedArr[index].eBookOnlyCheckBox,
    };

    setProducts(updatedArr);
  };

  const changeQuantity = (type?: any, index?: number) => {
    const updatedArr = [...products];

    updatedArr[index] = {
      ...updatedArr[index],
      quantity:
        type == "plus"
          ? updatedArr[index].quantity + 1
          : updatedArr[index].quantity > 0
          ? updatedArr[index].quantity - 1
          : 0,
    };

    setProducts(updatedArr);
  };
  const addressCardOnPress = (item) => {
    navigation.navigate("Addresses", { isProfileTab: false });
  };
  return (
    <View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.mainContainer}>
          <Text style={styles.textStyle}>Cart</Text>

          <FlatList
            data={products}
            keyExtractor={(item) => item?.id}
            renderItem={({ item, index }) => {
              return (
                <CartCard
                  item={item}
                  index={index}
                  onImageCheckBoxPress={() => onCheckBoxPress(index)}
                  onIncludeEbookCheckPress={() => onIncludeEbookPress(index)}
                  onBookCoverCheckPress={() => onBookCoverCheckBox(index)}
                  onEbookOnlyCheckBox={() => onEbookOnlyCheckBox(index)}
                  plusOnPress={() => changeQuantity("plus", index)}
                  minusOnPress={() => changeQuantity("minus", index)}
                  onPreViewPress={() => navigation.navigate("BookList")}
                />
              );
            }}
          />

          <CustomButton
            text="Add another Product"
            oddContainerStyle={styles.oddContainerStyle}
            oddTextStyle={styles.oddTextStyle}
            onPress={() =>
              navigation.navigate("BottomTab", { screen: "ShopTab" })
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
                key={index}
                item={item}
                cardOnPress={() => addressCardOnPress(item)}
              />
            );
          })}

          <TouchableOpacity onPress={() => navigation.navigate("Addresses")}>
            <Text style={styles.addAnotherTextStyle}>Add another Address</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.pricingMainContainer}>
          <DiscountCard
            discountPrice={"-$1.5"}
            yourSaving={"-$1.5"}
            totalPrice={"$29"}
          />
          <View style={styles.customButtonContainer}>
            <CustomButton
              text="Buy Now"
              oddTextStyle={styles.buyNowTextStyle}
              onPress={() => navigation.navigate("PayMentMethod")}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default CartTab;
