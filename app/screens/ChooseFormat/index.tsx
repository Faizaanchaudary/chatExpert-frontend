import { StyleSheet, Text, View } from "react-native";
import React from "react";
import CustomHeader from "../../Components/CustomHeader";
import { styles } from "./style";
import ChooseFormatCard from "../../Components/ChooseFormatCard";
import { getBasePrice, getFormatInfo } from "../../utils/pricingUtils";

interface ChooseFormatProps {
  navigation?: any;
}

const ChooseFormat: React.FC<ChooseFormatProps> = ({ navigation }) => {
  // Get dynamic pricing for base page count (30 pages)
  const standardPrice = getBasePrice('standard_14_8x21', 30);
  const squarePrice = getBasePrice('square_14x14', 30);
  
  const standardInfo = getFormatInfo('standard_14_8x21');
  const squareInfo = getFormatInfo('square_14x14');

  return (
    <View style={styles.mainContainer}>
      <CustomHeader text="Choose Format" onPress={() => navigation.goBack()} />
      <View style={styles.innerContainer}>
        <ChooseFormatCard
          onPress={() =>
            navigation.navigate("CreateYourDesign", {
              format: "standard_14_8x21",
              bookspecs: {
                price: standardPrice.toFixed(2),
                title: standardInfo.title,
                dimensions: standardInfo.dimensions,
              },
            })
          }
          title={standardInfo.title}
          price={`${standardPrice.toFixed(2)} $`}
          text={standardInfo.dimensions}
        />
        <ChooseFormatCard
          onPress={() =>
            navigation.navigate("CreateYourDesign", {
              format: "square_14x14",
              bookspecs: {
                price: squarePrice.toFixed(2),
                title: squareInfo.title,
                dimensions: squareInfo.dimensions,
              },
            })
          }
          title={squareInfo.title}
          price={`${squarePrice.toFixed(2)} $`}
          text={squareInfo.dimensions}
        />
      </View>
    </View>
  );
};

export default ChooseFormat;
