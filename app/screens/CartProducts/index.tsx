import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { styles } from "./style";
import CustomHeader from "../../Components/CustomHeader";
import CartCard from "../../Components/CartCard";
import CustomButton from "../../Components/CustomButton";
import DiscountCard from "../../Components/DiscountCard";
import { hp } from "../../utils/reponsiveness";
import { icn } from "../../assets/icons";
import ApplyCodeModal from "../../Components/ApplyCodeModal";
import { useSelector, useDispatch } from "react-redux";
import { addCart, setCart } from "../../store/Slice/userSlice";
import AddressCard from "../../Components/AddressCard";
import moment from "moment";

interface CartProductsProps {
  navigation?: any;
}

interface BookSpecs {
  dimensions?: string;
  price?: string;
  title?: string;
}

interface ProductDetails {
  bookSpecs?: BookSpecs;
  checkBoxWithImage: boolean;
  eBookCheckBox: boolean;
  bookCoverCheckBox?: boolean;
  eBookOnlyCheckBox: boolean;
  quantity: number;
}

interface ProductType {
  id: string;
  chat: any[];
  details?: ProductDetails;
}

// Constants for additional prices
const EBOOK_PRICE = 2;
const BOOK_COVER_PRICE = 2;

const CartProducts: React.FC<CartProductsProps> = ({ navigation }) => {
  const [showApplyCodeModal, setShowApplyCodeModal] = useState(false);
  const [code, setCode] = useState("");
  const [showSuccessBar, setShowSuccessBar] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [showShippingOptions, setShowShippingOptions] = useState(false);

  // Get products and current address from redux state
  const cartChats = useSelector((state: any) => state?.user?.cartChats);
  const currentAddress = useSelector(
    (state: any) => state?.user?.currentAddress
  );
  const dispatch = useDispatch();
  const [validProducts, setValidProducts] = useState([]);
  // Filter products with bookSpecs

  useEffect(() => {
    console.log("cartChats", cartChats);
    const products =
      cartChats?.filter(
        (product: ProductType) =>
          product?.details?.bookSpecs &&
          Object.keys(product?.details?.bookSpecs).length > 0
      ) || [];

    setValidProducts(products);
  }, [cartChats]);

  // Calculate total price including options
  const calculateSubtotal = () => {
    return validProducts
      .reduce((total: number, product: ProductType) => {
        if (!product.details?.bookSpecs?.price) {
          return total;
        }

        const basePrice = parseFloat(product.details.bookSpecs.price);
        const quantity = product.details.quantity || 1;

        // Calculate base cost for the book
        let productPrice = basePrice * quantity;

        // Add e-book price if selected
        if (product.details.eBookCheckBox) {
          productPrice += EBOOK_PRICE;
        }

        // Add book cover price if selected
        if (product.details.bookCoverCheckBox) {
          productPrice += BOOK_COVER_PRICE;
        }

        return total + productPrice;
      }, 0)
      .toFixed(2);
  };

  const deleteProduct = (index: number) => {
    if (index < 0 || index >= validProducts.length) return;

    const productId = validProducts[index].id;
    console.log("prd", productId);

    Alert.alert(
      "Delete Product",
      "Are you sure you want to remove this product from your cart?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            const updatedCartChats = cartChats.filter(
              (product: ProductType) => product.id !== productId
            );
            dispatch(setCart(updatedCartChats));
          },
          style: "destructive",
        },
      ]
    );
  };

  const updateProductInCart = (
    productId: string,
    updatedDetails: Partial<ProductDetails>
  ) => {
    // Create a deep copy of the current cart items
    const updatedCartChats = JSON.parse(JSON.stringify(cartChats));

    // Find the index of the product to update
    const productIndex = updatedCartChats.findIndex(
      (p: ProductType) => p.id === productId
    );

    if (productIndex === -1) return; // Product not found

    // Get current product
    const product = updatedCartChats[productIndex];

    // Initialize details if they don't exist
    if (!product.details) {
      product.details = {
        bookSpecs: {},
        checkBoxWithImage: false,
        eBookCheckBox: false,
        eBookOnlyCheckBox: false,
        quantity: 1,
      };
    }

    // Handle special case for eBookOnlyCheckBox
    if (updatedDetails.eBookOnlyCheckBox === true) {
      product.details = {
        ...product.details,
        ...updatedDetails,
        checkBoxWithImage: false,
        eBookCheckBox: false,
        bookCoverCheckBox: false,
      };
    }
    // If checking other options, uncheck eBookOnlyCheckBox
    else if (
      updatedDetails.checkBoxWithImage === true ||
      updatedDetails.eBookCheckBox === true ||
      updatedDetails.bookCoverCheckBox === true
    ) {
      product.details = {
        ...product.details,
        ...updatedDetails,
        eBookOnlyCheckBox: false,
      };
    }
    // Regular update
    else {
      product.details = {
        ...product.details,
        ...updatedDetails,
      };
    }

    // Apply the update to Redux
    dispatch(setCart(updatedCartChats));
  };

  const onCheckBoxPress = (index: number) => {
    if (index < 0 || index >= validProducts.length) return;

    const product = validProducts[index];
    const currentValue = product.details?.checkBoxWithImage || false;

    updateProductInCart(product.id, {
      checkBoxWithImage: !currentValue,
    });
  };

  const onIncludeEbookPress = (index: number) => {
    if (index < 0 || index >= validProducts.length) return;

    const product = validProducts[index];
    const currentValue = product.details?.eBookCheckBox || false;

    updateProductInCart(product.id, {
      eBookCheckBox: !currentValue,
    });
  };

  const onBookCoverCheckBox = (index: number) => {
    if (index < 0 || index >= validProducts.length) return;

    const product = validProducts[index];
    const currentValue = product.details?.bookCoverCheckBox || false;

    updateProductInCart(product.id, {
      bookCoverCheckBox: !currentValue,
    });
  };

  const onEbookOnlyCheckBox = (index: number) => {
    if (index < 0 || index >= validProducts.length) return;

    const product = validProducts[index];
    const currentValue = product.details?.eBookOnlyCheckBox || false;

    console.log(
      "Toggling eBookOnlyCheckBox for",
      product.id,
      "from",
      currentValue,
      "to",
      !currentValue
    );

    updateProductInCart(product.id, {
      eBookOnlyCheckBox: !currentValue,
    });
  };

  const changeQuantity = (type: string, index: number) => {
    if (index < 0 || index >= validProducts.length) return;

    const product = validProducts[index];
    const currentQuantity = product.details?.quantity || 1;

    const newQuantity =
      type === "plus"
        ? currentQuantity + 1
        : currentQuantity > 1
        ? currentQuantity - 1
        : 1;

    updateProductInCart(product.id, {
      quantity: newQuantity,
    });
  };

  const checkAndNavigate = () => {
    setShowShippingOptions(true);
  };

  const RedeemPress = () => {
    // Apply a sample discount of $1.5
    setDiscount(1.5);
    setShowSuccessBar(true);
  };

  const subtotal = calculateSubtotal();
  const totalAfterDiscount = (parseFloat(subtotal) - discount).toFixed(2);

  // Debug the state to help identify issues
  console.log("asdasda", currentAddress);

  const addressCardOnPress = () => {
    navigation.navigate("Addresses", { back: true });
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <CustomHeader
          text="Products"
          onPress={() =>
            navigation.navigate("BottomTab", { screen: "ShopTab" })
          }
        />

        {validProducts.length > 0 ? (
          <>
            <FlatList
              data={validProducts}
              keyExtractor={(item) => item?.id}
              contentContainerStyle={{ marginTop: hp(2) }}
              renderItem={({ item, index }) => {
                return (
                  <CartCard
                    item={item}
                    showShippingOptions={showShippingOptions}
                    index={index}
                    onImageCheckBoxPress={() => onCheckBoxPress(index)}
                    onIncludeEbookCheckPress={() => onIncludeEbookPress(index)}
                    onBookCoverCheckPress={() => onBookCoverCheckBox(index)}
                    onEbookOnlyCheckBox={() => onEbookOnlyCheckBox(index)}
                    plusOnPress={() => changeQuantity("plus", index)}
                    minusOnPress={() => changeQuantity("minus", index)}
                    onPreViewPress={() =>
                      navigation.navigate("BookList", {
                        uniqueCartId: item?.id,
                        bookspecs: item?.details?.bookSpecs,
                        isExtendedView: true,
                        isFromCart: true,
                      })
                    }
                    onDeletePress={() => deleteProduct(index)}
                    discountCode={code}
                  />
                );
              }}
            />

            <View style={styles.subTotalContainer}>
              <CustomButton
                text="Add another Product"
                oddContainerStyle={styles.customButtonOddConStyle}
                oddTextStyle={styles.customButtonOddTxtStyle}
                onPress={() =>
                  navigation.navigate("BottomTab", { screen: "ShopTab" })
                }
              />
              <View style={styles.subtotalInnerContainer}>
                <Text style={styles.subtotalTextStyle}>Subtotal</Text>
                <Text style={styles.priceTextStyle}>${subtotal}</Text>
              </View>
            </View>
            {!showShippingOptions && (
              <CustomButton
                text="Apply Discount Code"
                oddTextStyle={styles.discountCodeTextStyle}
                oddContainerStyle={styles.discountCodeContainerStyle}
                source={icn.discountIcn}
                onPress={() => setShowApplyCodeModal(true)}
              />
            )}

            <View style={styles.deliverDateContainer}>
              <Text style={styles.deliveryDateTextStyle}>
                • Estimated delivery date{" "}
                {moment(new Date()).add(5, "days").format("DD")} -{" "}
                {moment(new Date()).add(9, "days").format("DD")}{" "}
                {moment(new Date()).format("MMM")}
              </Text>
            </View>
            {currentAddress && (
              <AddressCard
                item={currentAddress}
                // cardOnPress={addressCardOnPress}
                showNoDel={true}
              />
            )}
            <TouchableOpacity onPress={addressCardOnPress}>
              <Text style={styles.addAnotherTextStyle}>
                Add another Address
              </Text>
            </TouchableOpacity>

            <View style={styles.discountCardContainer}>
              <DiscountCard
                discountPrice={
                  discount > 0 ? `-$${discount.toFixed(2)}` : "$0.00"
                }
                yourSaving={discount > 0 ? `-$${discount.toFixed(2)}` : "$0.00"}
                totalPrice={`$${totalAfterDiscount}`}
              />
              <CustomButton
                text={
                  showShippingOptions ? "Buy Now" : "Go for Shipping Options"
                }
                oddTextStyle={styles.shippingTextStyle}
                onPress={() => {
                  if (showShippingOptions) {
                    // TODO: Implement buy now logic
                  } else {
                    checkAndNavigate();
                  }
                }}
              />
            </View>
          </>
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              marginTop: hp(10),
              marginBottom: hp(10),
            }}
          >
            <Text style={styles.subtotalTextStyle}>Your cart is empty</Text>
            <CustomButton
              text="Shop Now"
              oddTextStyle={styles.shippingTextStyle}
              onPress={() =>
                navigation.navigate("BottomTab", { screen: "ShopTab" })
              }
            />
          </View>
        )}
      </ScrollView>
      <ApplyCodeModal
        visible={showApplyCodeModal}
        withOutFeedbackPress={() => {
          setShowApplyCodeModal(false);
          setShowSuccessBar(false);
        }}
        redeemPress={() => RedeemPress()}
        tickIcn={showSuccessBar ? icn.tickIcn : null}
        showSuccessBar={showSuccessBar}
        value={code}
        onChangeText={(txt: any) => setCode(txt)}
      />
    </View>
  );
};

export default CartProducts;
