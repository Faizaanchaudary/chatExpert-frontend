import { StyleSheet, Text, View } from "react-native";
import React from "react";
import CustomHeader from "../../Components/CustomHeader";
import { styles } from "./style";
import ChooseFormatCard from "../../Components/ChooseFormatCard";
interface ChooseFormatProps {
  navigation?: any;
}
const ChooseFormat: React.FC<ChoseFormatProps> = ({ navigation }) => {
  return (
    <View style={styles.mainContainer}>
      <CustomHeader text="Choose Format" onPress={() => navigation.goBack()} />
      <View style={styles.innerContainer}>
        <ChooseFormatCard
          onPress={() =>
            navigation.navigate("CreateYourDesign", {
              format: "standard_14_8x21",
              bookspecs: {
                price: "34.99",
                title: "Standard Book",
                dimensions: "14.8 x 21 cm",
              },
            })
          }
          title={"Standard Book"}
          price={"34.99 $"}
          text={"14.8 x 21 cm"}
        />
        <ChooseFormatCard
          onPress={() =>
            navigation.navigate("CreateYourDesign", {
              format: "square_14x14",
              bookspecs: {
                price: "29.99",
                title: "Square Book",
                dimensions: "14 x 14 cm",
              },
            })
          }
          title={"Square Book"}
          price={"29.99 $"}
          text={"14 x 14 cm"}
        />
      </View>
    </View>
  );
};

export default ChooseFormat;
