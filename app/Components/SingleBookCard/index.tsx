import React from "react";
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { icn } from "../../assets/icons";
import { img } from "../../assets/img";
import { styles } from "./style";
interface SingleBookCardProps {
  topIcnSource?: any;
  upperText?: any;
  upperPress?: () => void;
  middlePress?: () => void;
  bottomPress?: () => void;
  lowerText?: any;
  oddStyle?: any;
  deleteIcn?: any;
  deleteIcnOnPress?: () => void;
  backGroundColor?: any;
}
const SingleBookCard: React.FC<SingleBookCardProps> = ({
  topIcnSource,
  upperText,
  upperPress,
  middlePress,
  bottomPress,
  lowerText,
  oddStyle,
  deleteIcn,
  deleteIcnOnPress,
  backGroundColor,
}) => {
  return (
    <View style={styles.mainContainer}>
      {topIcnSource && (
        <Image source={topIcnSource} style={styles.dotedIcnStyle} />
      )}
      <ImageBackground
        resizeMode="stretch"
        tintColor={backGroundColor == "" ? null : backGroundColor}
        source={img.singleBookTester3}
        style={
          oddStyle
            ? styles.oddSingleBookImageStyle
            : styles.singleBookImageStyle
        }
      >
        {deleteIcn ? (
          <TouchableOpacity
            style={styles.deleteIcnViewStyle}
            onPress={deleteIcnOnPress}
          >
            <Image source={icn.deleteIcn} style={styles.deleteIcnStyle} />
          </TouchableOpacity>
        ) : (
          <View
            style={
              oddStyle
                ? styles.oddBackImgInnerContainer
                : styles.backImgInnerContainer
            }
          >
            <TouchableOpacity
              style={
                oddStyle
                  ? styles.oddUpperTouchableContainer
                  : styles.upperTouchableContainer
              }
              onPress={upperPress}
            >
              {upperText ? (
                <Text style={styles.plusTextStyle}>{upperText}</Text>
              ) : (
                <Image
                  source={icn.plusIcn}
                  style={
                    oddStyle ? styles.oddPlusIcnStyle : styles.plusIcnStyle
                  }
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={
                oddStyle
                  ? styles.oddMiddleTouchableStyle
                  : styles.middleTouchableStyle
              }
              onPress={middlePress}
            >
              <Image
                source={icn.plusIcn}
                style={oddStyle ? styles.oddPlusIcnStyle : styles.plusIcnStyle}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={
                oddStyle
                  ? styles.oddBottomTouchableContainer
                  : styles.bottomTouchableContainer
              }
              onPress={bottomPress}
            >
              {lowerText ? (
                <Text style={styles.plusTextStyle}>{lowerText}</Text>
              ) : (
                <Image
                  source={icn.plusIcn}
                  style={
                    oddStyle ? styles.oddPlusIcnStyle : styles.plusIcnStyle
                  }
                />
              )}
            </TouchableOpacity>
          </View>
        )}
      </ImageBackground>
    </View>
  );
};

export default SingleBookCard;
