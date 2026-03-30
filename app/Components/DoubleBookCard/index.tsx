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
interface DoubleBookCardProps {
  item?: any;
  oddStyle?: any;
  leftUpperTextPress?: () => void;
  LeftBottomTextPress?: () => void;
  rightUpperTextPress?: () => void;
  rightBottomTextPress?: () => void;
  upperTextState?: any;
  bottomTextState?: any;
  backGroundColor?: any;
  leftMiddlePress?: () => void;
  rightMiddlePress?: () => void;
  disableMiddlePress?: any;
}
const DoubleBookCard: React.FC<DoubleBookCardProps> = ({
  oddStyle,
  item,
  leftUpperTextPress,
  LeftBottomTextPress,
  rightUpperTextPress,
  rightBottomTextPress,
  backGroundColor,
  leftMiddlePress,
  disableMiddlePress,
  rightMiddlePress,
}) => {
  return (
    <View>
      {item?.source && (
        <Image source={item?.source} style={styles.dotedLockIcnStyle} />
      )}
      <ImageBackground
        resizeMode="stretch"
        tintColor={backGroundColor == "" ? null : backGroundColor}
        source={img.bookImg}
        style={oddStyle ? styles.oddBookImgStyle : styles.bookImgStyle}
      >
        <View style={styles.commonContainerStyle}>
          {item?.leftSideLock ? (
            <View
              style={
                oddStyle
                  ? styles.OddCommonContainerLockIcn
                  : styles.commonContainerLockIcn
              }
            >
              <Image
                source={item.leftSideSource}
                style={
                  oddStyle
                    ? styles.oddSimpleLockIcnStyle
                    : styles.simpleLockIcnStyle
                }
              />
            </View>
          ) : (
            <View>
              <TouchableOpacity
                onPress={leftUpperTextPress}
                style={
                  oddStyle
                    ? styles.OddUpperTouchableContainer
                    : styles.upperTouchableContainer
                }
              >
                {!item?.topLeftText ? (
                  <Image
                    source={icn.plusIcn}
                    style={
                      oddStyle ? styles.OddPlusIcnStyle : styles.plusIcnStyle
                    }
                  />
                ) : (
                  <Text
                    style={
                      oddStyle
                        ? styles.upperTextStateOddStyle
                        : styles.upperTextStateStyle
                    }
                  >
                    {item?.topLeftText}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                disabled={disableMiddlePress}
                onPress={leftMiddlePress}
                style={
                  oddStyle
                    ? styles.OddMiddleTouchableStyle
                    : styles.middleTouchableStyle
                }
              >
                <Image
                  source={icn.plusIcn}
                  style={
                    oddStyle ? styles.OddPlusIcnStyle : styles.plusIcnStyle
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={LeftBottomTextPress}
                style={
                  oddStyle
                    ? styles.oddBottomTouchableContainer
                    : styles.bottomTouchableContainer
                }
              >
                {!item?.downLeftText ? (
                  <Image
                    source={icn.plusIcn}
                    style={
                      oddStyle ? styles.OddPlusIcnStyle : styles.plusIcnStyle
                    }
                  />
                ) : (
                  <Text
                    style={
                      oddStyle
                        ? styles.upperTextStateOddStyle
                        : styles.upperTextStateStyle
                    }
                  >
                    {item?.downLeftText}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
          {item?.rightSideLock ? (
            <View
              style={
                oddStyle
                  ? styles.OddCommonContainerLockIcn
                  : styles.commonContainerLockIcn
              }
            >
              <Image
                source={item.rightSideSource}
                style={
                  oddStyle
                    ? styles.oddSimpleLockIcnStyle
                    : styles.simpleLockIcnStyle
                }
              />
            </View>
          ) : (
            <View>
              <TouchableOpacity
                onPress={rightUpperTextPress}
                style={
                  oddStyle
                    ? styles.OddUpperTouchableContainer
                    : styles.upperTouchableContainer
                }
              >
                {!item?.topUpperText ? (
                  <Image
                    source={icn.plusIcn}
                    style={
                      oddStyle ? styles.OddPlusIcnStyle : styles.plusIcnStyle
                    }
                  />
                ) : (
                  <Text
                    style={
                      oddStyle
                        ? styles.upperTextStateOddStyle
                        : styles.upperTextStateStyle
                    }
                  >
                    {item?.topUpperText}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={rightMiddlePress}
                style={
                  oddStyle
                    ? styles.OddMiddleTouchableStyle
                    : styles.middleTouchableStyle
                }
              >
                <Image
                  source={icn.plusIcn}
                  style={
                    oddStyle ? styles.OddPlusIcnStyle : styles.plusIcnStyle
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={rightBottomTextPress}
                style={
                  oddStyle
                    ? styles.oddBottomTouchableContainer
                    : styles.bottomTouchableContainer
                }
              >
                {!item?.downRightText ? (
                  <Image
                    source={icn.plusIcn}
                    style={
                      oddStyle ? styles.OddPlusIcnStyle : styles.plusIcnStyle
                    }
                  />
                ) : (
                  <Text
                    style={
                      oddStyle
                        ? styles.upperTextStateOddStyle
                        : styles.upperTextStateStyle
                    }
                  >
                    {item?.downRightText}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ImageBackground>

      {item?.showBottomNumbers && (
        <View
          style={
            oddStyle
              ? styles.OddLastNumberContainer
              : styles.lastNumberContainer
          }
        >
          <Text
            style={
              oddStyle
                ? styles.OddLastNumberTextStyle
                : styles.lastNumberTextStyle
            }
          >
            {item?.leftBottomText}
          </Text>

          <Text
            style={
              oddStyle
                ? styles.OddLastNumberTextStyle
                : styles.lastNumberText2Style
            }
          >
            {item?.rightBottomText}
          </Text>
        </View>
      )}
    </View>
  );
};

export default DoubleBookCard;
