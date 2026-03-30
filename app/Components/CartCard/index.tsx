import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { img } from "../../assets/img";
import { styles } from "./style";
import { icn } from "../../assets/icons";
import { hp, rwp } from "../../utils/reponsiveness";
import { COLORS } from "../../utils/colors";

interface CartCardProps {
  item?: any;
  index?: number;
  onImageCheckBoxPress?: () => void;
  onIncludeEbookCheckPress?: () => void;
  onBookCoverCheckPress?: () => void;
  onEbookOnlyCheckBox?: () => void;
  plusOnPress?: () => void;
  minusOnPress?: () => void;
  onPreViewPress?: () => void;
  onDeletePress?: () => void;
  discountCode?: string;
  showShippingOptions?: boolean;
}

const CartCard: React.FC<CartCardProps> = ({
  item,
  index,
  onImageCheckBoxPress,
  onIncludeEbookCheckPress,
  onBookCoverCheckPress,
  onEbookOnlyCheckBox,
  plusOnPress,
  minusOnPress,
  onPreViewPress,
  onDeletePress,
  discountCode,
  showShippingOptions,
}) => {
  return (
    <View
      style={[
        styles.mainContainer,
        {
          backgroundColor: showShippingOptions ? "transparent" : COLORS.blue,
          paddingVertical: showShippingOptions ? 0 : hp(2),
          borderWidth: showShippingOptions ? 1 : 0,
          borderColor: "#D2D2D2",
        },
      ]}
    >
      <View style={styles.innerViewContainer}>
        <View style={styles.imgTextContainer}>
          <TouchableOpacity onPress={onImageCheckBoxPress}>
            <Image
              source={
                item?.details?.checkBoxWithImage
                  ? icn.circleFillCheckBox
                  : icn.circleCheckBox
              }
              style={styles.circleCheckBox}
            />
          </TouchableOpacity>
          <Image source={img.draftImg} style={styles.imgStyle} />
          <View style={styles.textContainer}>
            <Text style={styles.photoBookTextStyle}>
              {item?.details?.bookSpecs?.title || "Photo Book"}
              <Text style={styles.heightCmTextStyle}>
                {"\n"}
                {item?.details?.bookSpecs?.dimensions || "1*21*21cm"}
              </Text>
            </Text>
            <Text style={styles.priceTextStyle}>
              ${item?.details?.bookSpecs?.price || "29"}
            </Text>
            {discountCode ? (
              <Text
                style={{ color: "green", fontWeight: "bold", marginTop: 4 }}
              >
                Discount Code: {discountCode}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.touchAbleContainer}>
          <TouchableOpacity onPress={onDeletePress}>
            <Image source={icn.deleteIcn} style={styles.deleteIcnStyle} />
          </TouchableOpacity>
          <View style={styles.addMinusBtnCon}>
            <TouchableOpacity onPress={minusOnPress}>
              <Image source={icn.minusButton} style={styles.addButtonIcn} />
            </TouchableOpacity>
            <View style={styles.numberTextContainer}>
              <Text style={styles.numberTextStyle}>
                {item?.details?.quantity || 1}
              </Text>
            </View>
            <TouchableOpacity onPress={plusOnPress}>
              <Image source={icn.addButton} style={styles.addButtonIcn} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.previewTextContainer}
            onPress={onPreViewPress}
          >
            <Text style={styles.previewTextStyle}>Preview</Text>
          </TouchableOpacity>
        </View>
      </View>
      {showShippingOptions ? null : (
        <View style={styles.squareCheckBoxContainer}>
          <TouchableOpacity
            onPress={onIncludeEbookCheckPress}
            style={styles.squareCheckBoxTouchableStyle}
          >
            <Image
              source={
                item?.details?.eBookCheckBox
                  ? icn.squareCheckBoxFilled
                  : icn.squareCheckBox
              }
              style={styles.squareCheckBoxStyle}
            />
          </TouchableOpacity>
          <Text style={styles.includeEbookTextStyle}>Include E-book in $2</Text>
        </View>
      )}
      {showShippingOptions ? null : (
        <View style={styles.squareCheckBoxContainer}>
          <TouchableOpacity
            onPress={onBookCoverCheckPress}
            style={styles.squareCheckBoxTouchableStyle}
          >
            <Image
              source={
                item?.details?.bookCoverCheckBox
                  ? icn.squareCheckBoxFilled
                  : icn.squareCheckBox
              }
              style={styles.squareCheckBoxStyle}
            />
          </TouchableOpacity>
          <Text style={styles.includeEbookTextStyle}>
            Add Book Covers in $2
          </Text>
        </View>
      )}
      {showShippingOptions ? null : (
        <View style={styles.ebookContainerOnly}>
          <TouchableOpacity onPress={onEbookOnlyCheckBox}>
            <Image
              source={
                item?.details?.eBookOnlyCheckBox
                  ? icn.circleFillCheckBox
                  : icn.circleCheckBox
              }
              style={styles.circleCheckBox}
            />
          </TouchableOpacity>
          <Text style={styles.ebooKTextStyle}>
            E Book #{typeof index === "number" ? index + 1 : 1} Only
          </Text>
          <Text style={styles.ebookPriceTextStyle}>
            ${item?.details?.bookSpecs?.price || "29"}
          </Text>
        </View>
      )}
    </View>
  );
};

export default CartCard;
