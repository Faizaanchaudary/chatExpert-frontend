import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import CustomHeader from "../../Components/CustomHeader";
import { img } from "../../assets/img";
import { styles } from "./style";
import { hp, wp } from "../../utils/reponsiveness";
import IconTitle from "../../Components/IconTitle";
import { COLORS } from "../../utils/colors";
import { icn } from "../../assets/icons";
import CustomButton from "../../Components/CustomButton";
import LinearGradient from "react-native-linear-gradient";
import { useRoute } from "@react-navigation/native";
interface CreateYourDesignProps {
  navigation?: any;
}
const CreateYourDesign: React.FC<CreateYourDesignProps> = ({ navigation }) => {
  const route = useRoute<any>();
  const bookspecs = route?.params?.bookspecs;
  const bookTitle = bookspecs?.title || 'Square Book';
  const bookPrice = bookspecs?.price || '28.90';
  return (
    <>
      <View style={styles.customHeaderContainer}>
        <CustomHeader text="Little Book" onPress={() => navigation.goBack()} />
      </View>
      <ScrollView style={styles.scrollViewStyle}>
        <ImageBackground source={img.photoBook} style={styles.imageStyle}>
          <View
            style={[
              styles.solarIcnContainer,
              { backgroundColor: "rgba(0,0,0,0.3)" },
            ]}
          >
            <Image source={icn.solarStarIcn} style={styles.solarIcnStyle} />
            <Text style={styles.freeDeliveriesTextStyle}>
              We are making FREE Deliveries in this week
            </Text>
          </View>
        </ImageBackground>
        <View style={styles.InnerContainer}>
          <Text style={styles.hardCoverTextStyle}>
            {`Hard Cover ${bookTitle}\n`}
            <Text style={styles.priceTextStyle}>Price (${bookPrice})</Text>
          </Text>
          <Text style={styles.detailTextStyle}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incidiut labore et dolore magna aliqua. Ut enim ad
            minim veniam, quis knostrud exercitation
          </Text>
          <Text style={styles.whatWillTextStyle}>What You will Get?</Text>
          <View style={styles.pointContainer}>
            <Text style={styles.pointTextStyle}>• Modern Design pages</Text>
            <Text style={styles.pointTextStyle}>• Stylish Cover</Text>
            <Text style={styles.pointTextStyle}>• 11*18 cm Page</Text>
            <Text style={styles.pointTextStyle}>
              • Premium Paper Quality 200gsm
            </Text>
            <Image
              source={img.shoppingBagImg}
              style={styles.shoppingBagImgStyle}
            />
          </View>
          <Text style={styles.deliverTextStyle}>Delivery</Text>
          <IconTitle
            source={icn.deliveryIcn}
            text={"Standard Delivery"}
            price={"4.99$"}
          />
          <IconTitle
            source={icn.rocketIcn}
            text={"Boost Delivery"}
            price={"14.99$"}
          />
          <View style={styles.customButtonContainer}>
            <CustomButton
              text="Let’s Create Your Design"
              oddTextStyle={styles.oddTextStyle}
              onPress={() => {
                // Navigate to BookList first to import chat, then to PageSelection
                navigation.navigate("BookList", {
                  bookspecs: route?.params?.bookspecs,
                  format: route?.params?.format,
                  photoBookFlow: true, // Flag to indicate we're in photo book flow
                });
              }}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default CreateYourDesign;
