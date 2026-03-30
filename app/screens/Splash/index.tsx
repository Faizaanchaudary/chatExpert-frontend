import {
  Alert,
  Image,
  ImageBackground,
  NativeEventEmitter,
  NativeModules,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect } from "react";
import { styles } from "./style";
import { img } from "../../assets/img";
import { COLORS } from "../../utils/colors";
import { icn } from "../../assets/icons";
import { hp } from "../../utils/reponsiveness";
import { useSelector } from "react-redux";
interface SplashProps {
  navigation?: any;
}
const Splash: React.FC<SplashProps> = ({ navigation }) => {
  const user = useSelector((state: any) => state?.user?.user);
  useEffect(() => {
    const timer = setTimeout(() => {}, 2000);

    return () => clearTimeout(timer);
  });

  const onPress = () => {
    if (user) {
      navigation.replace("BottomTab");
    } else {
      navigation.replace("LogIn");
    }
  };

  //handle intent

  return (
    <ImageBackground source={img.splashImg} style={styles.splashImageStyle}>
      <View style={styles.mainContainer}>
        <View style={styles.innerContainer}>
          <Text style={styles.turnChatTextStyle}>
            Turn Chats into Keepsakes
          </Text>
          <Text style={styles.rawTextStyle}>
            Choose a Chat Book format that fits your style: Classic, Layflat,
            Mini, or Premium.
          </Text>
          <TouchableOpacity
            onPress={onPress}
            style={styles.buttonContainerStyle}
          >
            <Image source={icn.forwardIcn} style={styles.forwardIcnStyle} />
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default Splash;
