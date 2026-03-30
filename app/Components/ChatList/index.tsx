import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import {
  View,
  Text,
  FlatList,
  ImageBackground,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import ViewShot, { captureRef } from "react-native-view-shot";
import QRCode from "react-native-qrcode-svg"; // For rendering QR codes
import { img } from "../../assets/img"; // Assuming you have this
import { icn } from "../../assets/icons";
import { hp, wp } from "../../utils/reponsiveness";
import { useMediaContext } from "rn-declarative";
import AddTextModal from "../AddTextModal";
import ImagePicker from "react-native-image-crop-picker";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import ImageEditor from "@react-native-community/image-editor";

const ChatList = forwardRef(
  (
    {
      chat,
      returnMaxPages,
      returnChat,
      deletion,
      returnDeletion,
      extendedView,
      returnIsLoading,
    }: any,
    ref: any
  ) => {
    const [maxMessagesPerSide, setMaxMessagesPerSide] = useState(3); // Initial value
    const [containerHeight, setContainerHeight] = useState(height * 0.5); // Adjusted height
    const { isPhone, isTablet, isDesktop } = useMediaContext();
    const [editItem, setEditItem] = useState<any>(null);
    const navigation = useNavigation<any>();
    const itemRefs = useRef<any>([]); // Array of refs for each item
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      returnIsLoading(isLoading);
    }, [isLoading]);

    const textureImage = [
      {
        text: true,
      },
      {
        image: img.colorModalImg1,
        path: "./../../assets/img/colorModalImg1.png",
        code: true,
      },
      {
        image: img.colorModalImg2,
        path: "./../../assets/img/colorModalImg2.png",
        code: true,
      },
      {
        image: img.colorModalImg3,
        path: "./../../assets/img/colorModalImg3.png",
        code: true,
      },
      {
        image: img.colorModalImg4,
        path: "./../../assets/img/colorModalImg4.png",
        code: true,
      },
    ];

    type ObjectType = any;

    const [tabletLeft] = useState(extendedView ? -wp(2.1) : -wp(4.3));
    const tabletLeftContainer = extendedView ? -wp(2.1) : -wp(4.3);
    const mobileLeft = -wp(3.6);
    const negativeMargin = -hp(15);
    const importPhotos = () => {
      console.log("sec", editItem);
    };

    useEffect(() => {
      if (editItem?.buttonIndex == 1) {
        importPhotos();
      }
    }, [editItem]);

    useImperativeHandle(ref, () => ({
      // each key is connected to `ref` as a method name
      // they can execute code directly, or call a local method
      setImageAt: (indexPage: any, image: any) => {
        const tempArr = chat;
        const newArr = editKeyValue(tempArr, indexPage, "second", image);
        returnChat(newArr);
      },

      captureScreenshotsSequentially: async () => {
        const urlArr: any = [];
        setIsLoading(true);
        for (let i = 0; i < itemRefs.current.length; i++) {
          const itemRef = itemRefs.current[i];
          if (itemRef) {
            try {
              const uri = await captureRef(itemRef, {
                format: "png",

                quality: 1.0, // Highest quality
                width: 8000,
                height: 4000, // Double the resolution; increase if needed
              });

              if (i != 0 && i != itemRefs.current.length - 1) {
                const uri = await captureRef(itemRef, {
                  format: "png",

                  quality: 1.0, // Highest quality
                  width: 8000,
                  height: 5000, // Double the resolution; increase if needed
                });
                const cropWidth = 4000; // Half the width for horizontal cropping

                // Define cropping regions for left and right halves
                const leftCropData = {
                  offset: { x: 0, y: 500 },
                  size: { width: cropWidth, height: 4000 },
                };

                const rightCropData = {
                  offset: { x: cropWidth, y: 500 },
                  size: { width: cropWidth, height: 4000 },
                };

                // Crop and save left half
                if (i == 1) {
                } else {
                  const leftUri = await ImageEditor.cropImage(
                    uri,
                    leftCropData
                  );
                  await CameraRoll.save(leftUri?.uri, { type: "photo" });
                  urlArr.push(leftUri?.uri);
                }
                // Crop and save right half
                if (i == itemRefs.current.length - 1) {
                } else {
                  const rightUri = await ImageEditor.cropImage(
                    uri,
                    rightCropData
                  );
                  await CameraRoll.save(rightUri?.uri, { type: "photo" });
                  urlArr.push(rightUri?.uri);
                }
              } else {
                await CameraRoll.save(uri, { type: "photo" });
                urlArr.push(uri);
              }
              await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for stability
            } catch (error) {
              console.error("Screenshot capture failed for index", i, error);
            }
          }
        }

        setIsLoading(false);
        return { images: urlArr, nonChat: groupedMessages };
      },
    }));

    const setImageAt = (
      indexPage: any,
      image: any,
      type: "first" | "second" | "third" | "firstR" | "secondR" | "thirdR"
    ) => {
      const tempArr = chat;
      const newArr = editKeyValue(
        tempArr,
        indexPage,
        type ? type : "second",
        image
      );
      returnChat(newArr);
    };

    function addAfter(array: any, index: any, newItem: any) {
      return [...array.slice(0, index), newItem, ...array.slice(index)];
    }

    const getImage = (item: any) => {
      if (item?.code == false) {
        return { uri: item?.path };
      } else {
        const res = textureImage?.filter((items) => {
          console.log("imte", items);
          return items?.image == item?.image;
        });

        if (res?.length > 0) {
          console.log("res", res[0]);
          return res[0]?.image;
        }
      }
    };

    function editKeyValue(
      arr: ObjectType[],
      index: number,
      type:
        | "first"
        | "second"
        | "third"
        | "firstR"
        | "secondR"
        | "thirdR"
        | any,
      text: string
    ): ObjectType[] {
      // Ensure the index is valid (index can be up to arr.length to allow adding at the end)

      if (index < 0 || index > arr.length) {
        console.error("Index out of bounds");
        return arr;
      }

      // If the object at the specified index is undefined, initialize it
      if (!arr[index]) {
        arr[index] = {};
      }

      // Set the value at the specified index and type
      arr[index][type] = text;

      // Return the updated array
      return arr;
    }

    //test screenshot capture and store in array
    useEffect(() => {
      const initiateRef = () => {
        itemRefs.current = groupedMessages.map(
          (_, i) => itemRefs?.current[i] || React.createRef<any>()
        );
      };

      initiateRef();
    }, [useIsFocused()]);

    useEffect(() => {
      const availableHeight = height * 0.17; // 50% of screen height
      const chatBubbleHeight = 80; // Approximate height of a chat message with QR code and padding
      const messagesPerSide = Math.floor(availableHeight / chatBubbleHeight); // Calculate how many messages can fit
      setMaxMessagesPerSide(messagesPerSide);
    }, []);

    // Split messages into groups, based on the new limit of messages per side
    const groupedMessages: Array<any> = [];
    for (let i = 0; i < chat?.length; i += maxMessagesPerSide * 2) {
      groupedMessages.push(chat.slice(i, i + maxMessagesPerSide * 2));
    }

    useEffect(() => {
      returnMaxPages(groupedMessages?.length);
    }, [groupedMessages]);

    const renderDeletion = ({ item, index }: any) => {
      let backgroundImage =
        index === 0 || index === groupedMessages.length - 1
          ? img.singleBookTester3 // Single page image
          : img.bookImg; // Double page image

      const isDoubleImage = backgroundImage === img.bookImg;

      if (backgroundImage == img.singleBookTester3) {
        return (
          <View>
            <ImageBackground
              source={backgroundImage}
              style={[
                styles.chatContainer,
                {
                  height: containerHeight * 0.85, // Adjusted height
                  width: isDoubleImage ? width * 0.85 : width * 0.425, // Adjusted width
                  alignSelf: "center", // Center first and last elements
                  alignItems: "center",
                  justifyContent: "center",
                },
              ]}
              resizeMode="stretch"
            >
              <TouchableOpacity
                onPress={() => {
                  const objectIndex = index != 0 ? chat?.length - 1 : 0;
                  const tempArr = chat;
                  editKeyValue(tempArr, objectIndex, "third", "");
                  editKeyValue(tempArr, objectIndex, "first", "");
                  const latest = editKeyValue(tempArr, index, "second", "");
                  returnChat(latest);
                  returnDeletion();
                }}
              >
                <Image
                  source={icn.deleteIcn}
                  style={{ width: 40, height: 40 }}
                  resizeMode="stretch"
                />
              </TouchableOpacity>
            </ImageBackground>
          </View>
        );
      }
      if (backgroundImage == img.bookImg) {
        return (
          <View>
            <ImageBackground
              source={backgroundImage}
              style={[
                styles.chatContainer,
                {
                  height: containerHeight * 0.85, // Reduced height
                  width: isDoubleImage ? width * 0.85 : width * 0.425, // Adjusted width
                  alignSelf: "center", // Center first and last elements
                },
              ]}
              resizeMode="stretch"
            >
              {/* left side delete button */}
              <TouchableOpacity
                onPress={() => {
                  const itemsOnLeft = item
                    .slice(0, maxMessagesPerSide)
                    .filter((chatItem: any, idx: any) => chatItem);
                  if (index == 1) {
                    returnDeletion();
                    return;
                  }
                  const tempChat = [...chat];

                  const filteredChat = tempChat.filter(
                    (chatItem: any) =>
                      !itemsOnLeft.some((item: any) => item.id === chatItem.id)
                  );

                  returnChat(filteredChat);
                  returnDeletion();
                }}
                style={{ position: "absolute", top: "50%", left: "21%" }}
              >
                <Image
                  source={icn.deleteIcn}
                  style={{
                    width: 40,
                    height: 40,
                  }}
                  resizeMode="stretch"
                />
              </TouchableOpacity>
              {/* right side delete button */}
              <TouchableOpacity
                onPress={() => {
                  const itemsOnRight = item
                    .slice(maxMessagesPerSide, maxMessagesPerSide * 2)
                    .filter((chatItem: any, idx: any) => chatItem);
                  if (index == groupedMessages?.length - 2) {
                    returnDeletion();
                    return;
                  }

                  const tempChat = [...chat];

                  const filteredChat = tempChat.filter(
                    (chatItem: any) =>
                      !itemsOnRight.some((item: any) => item.id === chatItem.id)
                  );

                  returnChat(filteredChat);
                  returnDeletion();
                }}
                style={{ position: "absolute", top: "50%", left: "76%" }}
              >
                <Image
                  source={icn.deleteIcn}
                  style={{
                    width: 40,
                    height: 40,
                  }}
                  resizeMode="stretch"
                />
              </TouchableOpacity>
            </ImageBackground>
          </View>
        );
      }
    };

    const renderItemMini = ({ item, index }: any) => {
      let backgroundImage =
        index === 0 || index === groupedMessages.length - 1
          ? img.singleBookTester3 // Single page image
          : img.bookImg; // Double page image

      const isDoubleImage = backgroundImage === img.bookImg;

      if (backgroundImage == img.singleBookTester3) {
        return (
          <View
            style={
              extendedView
                ? [
                    {
                      transform: [{ scale: 0.5 }],
                      // backgroundColor: "red",
                      marginTop: negativeMargin,
                    },
                    {
                      width: extendedView ? width * 0.45 : width * 0.85, // Adjusted width
                    },
                  ]
                : undefined
            }
          >
            <ImageBackground
              source={backgroundImage}
              style={[
                styles.chatContainer,

                {
                  height: containerHeight * 0.85, // Adjusted height
                  width: extendedView ? wp(30) : width * 0.425, // Adjusted width
                  alignSelf: "center", // Center first and last elements
                },
              ]}
              resizeMode="stretch"
            >
              {/* here is the background of single */}
              {item[0]?.chatBackground?.image ? (
                <Image
                  source={getImage(item[0]?.chatBackground)}
                  style={{
                    position: "absolute",
                    backgroundColor: item[0]?.chatBackground,
                    top: 5,
                    left: 5,
                    width:
                      extendedView && isTablet
                        ? width * 0.285
                        : extendedView
                        ? width * 0.27
                        : width * 0.425 - 10,
                    borderRadius: isTablet ? 20 : 10,
                    height: containerHeight * 0.85 - 11,
                  }}
                  resizeMode="stretch"
                />
              ) : (
                <View
                  style={{
                    position: "absolute",
                    backgroundColor: item[0]?.chatBackground,
                    top: 5,
                    left: 5,
                    width:
                      extendedView && isTablet
                        ? width * 0.285
                        : extendedView
                        ? width * 0.27
                        : width * 0.425 - 10,
                    borderRadius: isTablet ? 20 : 10,
                    height: containerHeight * 0.85 - 11,
                  }}
                />
              )}
              {/* Non-cover view with buttons */}
              <View style={styles.additionOfNonButtonContainer}>
                {["Button 1", "Button 2", "Button 3"].map(
                  (buttonLabel, idx) => {
                    return (
                      <>
                        <View
                          key={idx}
                          style={
                            idx == 1
                              ? styles.additionOfNonButtonWrapperAlt
                              : styles.additionOfNonButtonWrapper
                          }
                        >
                          <TouchableOpacity
                            style={styles.additionOfNonButton}
                            onPress={() => {
                              setEditItem({
                                item: item,
                                type: "cover",
                                buttonIndex: idx,
                                objectIndex: index != 0 ? item[0]?.id : 0,
                              });
                            }}
                          >
                            {idx == 1 && item[0]?.second ? (
                              <Image
                                source={{ uri: item[0]?.second }}
                                style={{
                                  width: 50,
                                  height: 50,
                                  position: "absolute",
                                }}
                              />
                            ) : null}
                            <Text
                              style={[
                                styles.additionOfNonButtonText,
                                {
                                  fontSize: item[0]?.fontSize,
                                  fontFamily: item[0]?.fontFamily,
                                  color: "black",
                                  textDecorationLine:
                                    item[0]?.fontStyle?.includes("underline")
                                      ? "underline"
                                      : "none",
                                  fontWeight: item[0]?.fontStyle?.includes(
                                    "bold"
                                  )
                                    ? "bold"
                                    : "normal",
                                  fontStyle: item[0]?.fontStyle?.includes(
                                    "italic"
                                  )
                                    ? "italic"
                                    : "normal",
                                },
                              ]}
                            >
                              {idx == 0 && item[0]?.first
                                ? item[0]?.first
                                : idx == 1 && item[0]?.second
                                ? ""
                                : idx == 1
                                ? "+"
                                : idx == 2 && item[0]?.third
                                ? item[0]?.third
                                : "+"}{" "}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    );
                  }
                )}
              </View>
            </ImageBackground>
            {/* Buttons outside the image */}
            {index == groupedMessages?.length - 1 ? null : (
              <View
                style={{
                  position: "absolute",
                  bottom: -30,
                  alignSelf: "center",
                  right: wp(15),
                  zIndex: 500,
                }}
              >
                {index == 0 || index == groupedMessages.length - 2 ? (
                  <TouchableOpacity style={styles.circularButton}>
                    <Image
                      source={icn.dotedLock}
                      style={{ height: 40, width: 40 }}
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.circularButton}
                    onPress={() => console.log("oress")}
                  >
                    <Image
                      source={icn.plusDotedIcn}
                      style={{ height: 40, width: 40 }}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}
            {/* <Text
              style={{
                color: "black",
                position: "absolute",
                right: wp(28),
                bottom: hp(1),
                fontWeight: "bold",
              }}
            >
              {index + 1}
            </Text> */}
          </View>
        );
      }

      if (backgroundImage == img.bookImg)
        return (
          <View
            style={[extendedView ? { transform: [{ scale: 0.5 }] } : undefined]}
          >
            <ImageBackground
              source={backgroundImage}
              style={[
                styles.chatContainer,
                {
                  height: containerHeight * 0.85, // Reduced height
                  width: extendedView ? width * 0.45 : width * 0.85, // Adjusted width
                  alignSelf: "center", // Center first and last elements
                  marginTop: negativeMargin - hp(3),
                },
              ]}
              resizeMode="stretch"
            >
              {/* Render the content */}
              {/* in case the index is 1 left should be locked */}
              {/* here is the background of left container */}

              {item[0]?.chatBackground?.image ? (
                <Image
                  source={getImage(item[0]?.chatBackground)}
                  style={{
                    position: "absolute",
                    backgroundColor: item[0]?.chatBackground,
                    top: 5,
                    zIndex: 2,
                    left: 5,
                    width:
                      extendedView && isTablet
                        ? width * 0.214
                        : extendedView
                        ? width * 0.2
                        : width * 0.425 - 10,
                    borderRadius: isTablet ? 25 : 10,
                    height: containerHeight * 0.85 - 11,
                  }}
                />
              ) : (
                <View
                  style={{
                    position: "absolute",
                    backgroundColor: item[0]?.chatBackground,
                    top: 5,
                    zIndex: 2,
                    left: 5,
                    width:
                      extendedView && isTablet
                        ? width * 0.214
                        : extendedView
                        ? width * 0.2
                        : width * 0.425 - 10,
                    borderRadius: isTablet ? 25 : 10,
                    height: containerHeight * 0.85 - 11,
                  }}
                />
              )}
              {index == 1 ? (
                <View
                  style={[
                    styles.leftContainer,
                    isDoubleImage && styles.leftMarginForDouble,
                    { zIndex: 200 },
                  ]}
                >
                  <Image
                    source={icn.simpleLockIcn}
                    style={{
                      height: 50,
                      width: 50,
                      marginTop: hp(3),
                      marginLeft: isTablet ? wp(14) : undefined,
                      alignSelf: isTablet ? undefined : "center",
                    }}
                  />
                </View>
              ) : (
                <View
                  style={[
                    styles.leftContainer,
                    isDoubleImage && styles.leftMarginForDouble,
                    { zIndex: 200 },
                  ]}
                >
                  <View
                    style={[
                      styles.additionOfNonButtonWrapper,
                      {
                        position: "absolute",
                        top: hp(-10),
                        width: "90%",
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.additionOfNonButton}
                      onPress={() => {
                        setEditItem({
                          item: item,
                          type: "noncover",
                          buttonIndex: 0,
                          objectIndex: item[0]?.id,
                        });
                      }}
                    >
                      <Text
                        style={[
                          styles.additionOfNonButtonText,
                          {
                            fontSize: item[0]?.fontSize,
                            fontFamily: item[0]?.fontFamily,
                            color: "black",
                            textDecorationLine: item[0]?.fontStyle?.includes(
                              "underline"
                            )
                              ? "underline"
                              : "none",
                            fontWeight: item[0]?.fontStyle?.includes("bold")
                              ? "bold"
                              : "normal",
                            fontStyle: item[0]?.fontStyle?.includes("italic")
                              ? "italic"
                              : "normal",
                          },
                        ]}
                      >
                        {item[0]?.first ? item[0]?.first : "+"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {item
                    .slice(0, maxMessagesPerSide)
                    .map((chatItem: any, idx: any) => (
                      <>
                        {/* if there is no sender message */}
                        {chatItem?.item?.senderMessage ? (
                          <View
                            key={chatItem?.id || idx}
                            style={[
                              styles.messageContainer,
                              {
                                flex: 1,
                                height: "30%",
                                marginBottom:
                                  idx === maxMessagesPerSide - 1 ? 20 : 5,
                              },
                            ]}
                          >
                            {!chatItem?.hideName && (
                              <Text
                                style={[
                                  styles.senderName,
                                  chatItem?.item?.isSender
                                    ? { color: "black" }
                                    : { color: "black" },
                                ]}
                              >
                                {chatItem?.item?.senderName}
                              </Text>
                            )}

                            {!chatItem?.item?.path ? (
                              <Text
                                style={[
                                  styles.messageText,
                                  isDoubleImage &&
                                    styles.doubleImageMessageText,
                                  {
                                    fontSize: chatItem?.fontSize,
                                    fontFamily: chatItem?.fontFamily,
                                    color: chatItem?.item?.sender
                                      ? chatItem?.senderTextColor
                                      : chatItem?.receiverTextColor,
                                    backgroundColor: chatItem?.item?.sender
                                      ? chatItem?.senderBackground
                                      : chatItem?.receiverBackground,
                                    textDecorationLine:
                                      chatItem?.fontStyle?.includes("underline")
                                        ? "underline"
                                        : "none",
                                    fontWeight: chatItem?.fontStyle?.includes(
                                      "bold"
                                    )
                                      ? "bold"
                                      : "normal",
                                    fontStyle: chatItem?.fontStyle?.includes(
                                      "italic"
                                    )
                                      ? "italic"
                                      : "normal",
                                  },
                                ]}
                              >
                                {chatItem?.item?.senderMessage}
                              </Text>
                            ) : (
                              <View style={styles.qrCodeContainer}>
                                <QRCode
                                  value={chatItem?.item?.path}
                                  size={60}
                                />
                              </View>
                            )}

                            <Text style={styles.timeText}>
                              {chatItem?.item?.sendingTime}
                            </Text>
                          </View>
                        ) : (
                          <View
                            style={[
                              styles.additionOfNonButtonWrapperAlt,
                              { width: "90%", height: "70%" },
                            ]}
                          >
                            <TouchableOpacity
                              style={styles.additionOfNonButton}
                              onPress={() => {
                                setEditItem({
                                  item: item,
                                  type: "noncover",
                                  buttonIndex: 1,
                                  objectIndex: item[0]?.id,
                                  field: "second",
                                });
                              }}
                            >
                              {item[0]?.second ? (
                                <Image
                                  source={{ uri: item[0]?.second }}
                                  style={{
                                    width: 50,
                                    height: 50,
                                    position: "absolute",
                                  }}
                                />
                              ) : (
                                <Text
                                  style={[
                                    styles.additionOfNonButtonText,
                                    {
                                      fontSize: item[0]?.fontSize,
                                      fontFamily: item[0]?.fontFamily,
                                      color: "black",
                                      textDecorationLine:
                                        item[0]?.fontStyle?.includes(
                                          "underline"
                                        )
                                          ? "underline"
                                          : "none",
                                      fontWeight: item[0]?.fontStyle?.includes(
                                        "bold"
                                      )
                                        ? "bold"
                                        : "normal",
                                      fontStyle: item[0]?.fontStyle?.includes(
                                        "italic"
                                      )
                                        ? "italic"
                                        : "normal",
                                    },
                                  ]}
                                >
                                  {item[0]?.second ? item[0]?.second : "+"}
                                </Text>
                              )}
                            </TouchableOpacity>
                          </View>
                        )}
                      </>
                    ))}
                  <View
                    style={[
                      styles.additionOfNonButtonWrapper,
                      { position: "absolute", bottom: hp(-8), width: "90%" },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.additionOfNonButton}
                      onPress={() => {
                        setEditItem({
                          item: item,
                          type: "noncover",
                          buttonIndex: 2,
                          objectIndex: item[0]?.id,
                        });
                      }}
                    >
                      <Text
                        style={[
                          styles.additionOfNonButtonText,
                          {
                            fontSize: item[0]?.fontSize,
                            fontFamily: item[0]?.fontFamily,
                            color: "black",
                            textDecorationLine: item[0]?.fontStyle?.includes(
                              "underline"
                            )
                              ? "underline"
                              : "none",
                            fontWeight: item[0]?.fontStyle?.includes("bold")
                              ? "bold"
                              : "normal",
                            fontStyle: item[0]?.fontStyle?.includes("italic")
                              ? "italic"
                              : "normal",
                          },
                        ]}
                      >
                        {item[0]?.third ? item[0]?.third : "+"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {isDoubleImage && (
                <>
                  {index == groupedMessages?.length - 2 ? (
                    <View
                      style={[
                        styles.rightContainer,
                        isDoubleImage && styles.leftMarginForDouble,
                      ]}
                    >
                      {item[0]?.chatBackground?.image ? (
                        <Image
                          source={getImage(item[0]?.chatBackground)}
                          style={
                            extendedView
                              ? {
                                  position: "absolute",
                                  backgroundColor: item[0]?.chatBackground,
                                  top: -hp(12.9),
                                  left: isTablet ? -wp(2) : -wp(1),
                                  width:
                                    extendedView && isTablet
                                      ? width * 0.212
                                      : extendedView
                                      ? width * 0.2
                                      : width * 0.425 - 10,
                                  borderRadius: isTablet ? 25 : 10,
                                  height: containerHeight * 0.85 - 11,
                                }
                              : {
                                  position: "absolute",
                                  backgroundColor: item[0]?.chatBackground,
                                  top: -hp(12.9),
                                  left: isTablet ? tabletLeft : mobileLeft,
                                  width: width * 0.425 - 10,
                                  borderRadius: isTablet ? 25 : 10,
                                  height: containerHeight * 0.85 - 11,
                                }
                          }
                        />
                      ) : (
                        <View
                          style={
                            extendedView
                              ? {
                                  position: "absolute",
                                  backgroundColor: item[0]?.chatBackground,
                                  top: -hp(12.9),
                                  left: isTablet ? -wp(2) : -wp(1),
                                  width:
                                    extendedView && isTablet
                                      ? width * 0.212
                                      : extendedView
                                      ? width * 0.2
                                      : width * 0.425 - 10,
                                  borderRadius: isTablet ? 25 : 10,
                                  height: containerHeight * 0.85 - 11,
                                }
                              : {
                                  position: "absolute",
                                  backgroundColor: item[0]?.chatBackground,
                                  top: -hp(12.9),
                                  left: isTablet ? tabletLeft : mobileLeft,
                                  width: extendedView
                                    ? width * 0.2
                                    : width * 0.425 - 10,
                                  borderRadius: isTablet ? 25 : 10,
                                  height: containerHeight * 0.85 - 11,
                                }
                          }
                        />
                      )}
                      <Image
                        source={icn.simpleLockIcn}
                        style={
                          extendedView
                            ? {
                                height: 50,
                                width: 50,
                                marginTop: hp(3),
                                marginLeft: isTablet ? wp(11) : wp(1),
                              }
                            : {
                                height: 50,
                                width: 50,
                                marginTop: hp(3),
                                marginLeft: isTablet ? wp(11) : wp(5),
                              }
                        }
                      />
                    </View>
                  ) : (
                    <View style={styles.rightContainer}>
                      {/* here is the background of right container */}
                      {item[0]?.chatBackground?.image ? (
                        <Image
                          source={getImage(item[0]?.chatBackground)}
                          style={
                            extendedView
                              ? {
                                  position: "absolute",
                                  backgroundColor: item[0]?.chatBackground,
                                  top: -hp(12.9),
                                  left: isTablet ? -wp(0.6) : -wp(0.4),
                                  width: isTablet
                                    ? width * 0.21
                                    : width * 0.425 - 86,
                                  borderRadius: isTablet ? 20 : 10,
                                  height: containerHeight * 0.85 - 11,
                                }
                              : {
                                  position: "absolute",
                                  backgroundColor: item[0]?.chatBackground,
                                  top: -hp(12.9),
                                  left: isTablet
                                    ? tabletLeftContainer
                                    : -wp(1.2),
                                  width: width * 0.425 - 10,
                                  borderRadius: isTablet ? 20 : 10,
                                  height: containerHeight * 0.85 - 11,
                                }
                          }
                        />
                      ) : (
                        <View
                          style={
                            extendedView
                              ? {
                                  position: "absolute",
                                  backgroundColor: item[0]?.chatBackground,
                                  top: -hp(12.9),
                                  left: isTablet ? -wp(0.6) : -wp(0.4),
                                  width: isTablet
                                    ? width * 0.21
                                    : width * 0.425 - 86,
                                  borderRadius: isTablet ? 20 : 10,
                                  height: containerHeight * 0.85 - 11,
                                }
                              : {
                                  position: "absolute",
                                  backgroundColor: item[0]?.chatBackground,
                                  top: -hp(12.9),
                                  left: isTablet ? -wp(2) : -wp(1.2),
                                  width: width * 0.425 - 10,
                                  borderRadius: isTablet ? 20 : 10,
                                  height: containerHeight * 0.85 - 11,
                                }
                          }
                        />
                      )}
                      <View
                        style={[
                          styles.additionOfNonButtonWrapper,
                          { position: "absolute", top: hp(-10), width: "90%" },
                        ]}
                      >
                        <TouchableOpacity
                          style={styles.additionOfNonButton}
                          onPress={() =>
                            setEditItem({
                              item: item,
                              type: "noncover",
                              buttonIndex: 3,
                              objectIndex: item[0]?.id,
                            })
                          }
                        >
                          <Text
                            style={[
                              styles.additionOfNonButtonText,
                              {
                                fontSize: item[0]?.fontSize,
                                fontFamily: item[0]?.fontFamily,
                                color: "black",
                                textDecorationLine:
                                  item[0]?.fontStyle?.includes("underline")
                                    ? "underline"
                                    : "none",
                                fontWeight: item[0]?.fontStyle?.includes("bold")
                                  ? "bold"
                                  : "normal",
                                fontStyle: item[0]?.fontStyle?.includes(
                                  "italic"
                                )
                                  ? "italic"
                                  : "normal",
                              },
                            ]}
                          >
                            {item[0]?.firstR ? item[0]?.firstR : "+"}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {item
                        .slice(maxMessagesPerSide, maxMessagesPerSide * 2)
                        .map((chatItem: any, idx: number) => (
                          <>
                            {chatItem?.item?.senderMessage ? (
                              <View
                                key={chatItem?.id || idx}
                                style={[
                                  styles.messageContainer,
                                  {
                                    flex: 1,
                                    marginBottom:
                                      idx === maxMessagesPerSide * 2 - 1
                                        ? 20
                                        : 5,
                                  },
                                ]}
                              >
                                {!chatItem?.hideName && (
                                  <Text
                                    style={[
                                      styles.senderName,
                                      chatItem?.item?.sender
                                        ? { color: "black" }
                                        : { color: "black" },
                                    ]}
                                  >
                                    {chatItem?.item?.senderName}
                                  </Text>
                                )}

                                {!chatItem?.item?.path ? (
                                  <Text
                                    style={[
                                      styles.messageText,
                                      isDoubleImage &&
                                        styles.doubleImageMessageText,
                                      {
                                        fontSize: chatItem?.fontSize,
                                        fontFamily: chatItem?.fontFamily,
                                        color: chatItem?.item?.sender
                                          ? chatItem?.senderTextColor
                                          : chatItem?.receiverTextColor,
                                        backgroundColor: chatItem?.item?.sender
                                          ? chatItem?.senderBackground
                                          : chatItem?.receiverBackground,
                                        textDecorationLine:
                                          chatItem?.fontStyle?.includes(
                                            "underline"
                                          )
                                            ? "underline"
                                            : "none",
                                        fontWeight:
                                          chatItem?.fontStyle?.includes("bold")
                                            ? "bold"
                                            : "normal",
                                        fontStyle:
                                          chatItem?.fontStyle?.includes(
                                            "italic"
                                          )
                                            ? "italic"
                                            : "normal",
                                      },
                                    ]}
                                  >
                                    {chatItem?.item?.senderMessage}
                                  </Text>
                                ) : (
                                  <View style={styles.qrCodeContainer}>
                                    <QRCode
                                      value={chatItem?.item?.path}
                                      size={60}
                                    />
                                  </View>
                                )}

                                <Text style={styles.timeText}>
                                  {chatItem?.item?.sendingTime}
                                </Text>
                              </View>
                            ) : (
                              <View
                                style={[
                                  styles.additionOfNonButtonWrapperAlt,
                                  { width: "90%", height: "70%" },
                                ]}
                              >
                                <TouchableOpacity
                                  style={styles.additionOfNonButton}
                                  onPress={() => {
                                    setEditItem({
                                      item: item,
                                      type: "noncover",
                                      buttonIndex: 1,
                                      objectIndex: item[0]?.id,
                                      field: "secondR",
                                    });
                                  }}
                                >
                                  {item[0]?.secondR ? (
                                    <Image
                                      source={{ uri: item[0]?.secondR }}
                                      style={{
                                        width: 50,
                                        height: 50,
                                        position: "absolute",
                                      }}
                                    />
                                  ) : (
                                    <Text
                                      style={[
                                        styles.additionOfNonButtonText,
                                        {
                                          fontSize: item[0]?.fontSize,
                                          fontFamily: item[0]?.fontFamily,
                                          color: "black",
                                          textDecorationLine:
                                            item[0]?.fontStyle?.includes(
                                              "underline"
                                            )
                                              ? "underline"
                                              : "none",
                                          fontWeight:
                                            item[0]?.fontStyle?.includes("bold")
                                              ? "bold"
                                              : "normal",
                                          fontStyle:
                                            item[0]?.fontStyle?.includes(
                                              "italic"
                                            )
                                              ? "italic"
                                              : "normal",
                                        },
                                      ]}
                                    >
                                      {item[0]?.secondR
                                        ? item[0]?.secondR
                                        : "+"}
                                    </Text>
                                  )}
                                </TouchableOpacity>
                              </View>
                            )}
                          </>
                        ))}
                      <View
                        style={[
                          styles.additionOfNonButtonWrapper,
                          {
                            position: "absolute",
                            bottom: hp(-8),
                            width: "90%",
                          },
                        ]}
                      >
                        <TouchableOpacity
                          style={styles.additionOfNonButton}
                          onPress={() =>
                            setEditItem({
                              item: item,
                              type: "noncover",
                              buttonIndex: 5,
                              objectIndex: item[0]?.id,
                            })
                          }
                        >
                          <Text
                            style={[
                              styles.additionOfNonButtonText,
                              {
                                fontSize: item[0]?.fontSize,
                                fontFamily: item[0]?.fontFamily,
                                color: "black",
                                textDecorationLine:
                                  item[0]?.fontStyle?.includes("underline")
                                    ? "underline"
                                    : "none",
                                fontWeight: item[0]?.fontStyle?.includes("bold")
                                  ? "bold"
                                  : "normal",
                                fontStyle: item[0]?.fontStyle?.includes(
                                  "italic"
                                )
                                  ? "italic"
                                  : "normal",
                              },
                            ]}
                          >
                            {item[0]?.thirdR ? item[0]?.thirdR : "+"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </>
              )}
            </ImageBackground>

            {/* <Text
              style={{
                color: "black",
                position: "absolute",
                right: wp(28),
                bottom: hp(1),
                fontWeight: "bold",
              }}
            >
              {index + 1}
            </Text> */}
            {index == groupedMessages?.length - 1 ? null : (
              <TouchableOpacity
                style={[
                  styles.iconsContainer,
                  {
                    position: "absolute",
                    bottom:
                      index == 1
                        ? 30
                        : index == groupedMessages?.length - 2
                        ? -30
                        : -35,
                    alignSelf: "center",
                    right: wp(15),
                    zIndex: 500,
                  },
                ]}
                onPress={() => {
                  if (index == 0 || index == groupedMessages.length - 2) {
                    const chatDetail = chat;
                    const checkItem = item[0];
                    const getitem = {
                      ...checkItem,
                      first: "",
                      second: "",
                      third: "",
                      firstR: "",
                      secondR: "",
                      thirdR: "",
                      item: { ...checkItem?.item, senderMessage: "" },
                    };

                    let tempArr = addAfter(
                      chatDetail,
                      getitem?.id + 2,
                      getitem
                    );
                    let tempArr2 = addAfter(tempArr, getitem?.id + 3, getitem);

                    returnChat(tempArr2);
                  }
                }}
              >
                {index == 0 || index == groupedMessages.length - 2 ? (
                  <TouchableOpacity style={styles.circularButton}>
                    <Image
                      source={icn.dotedLock}
                      style={{ height: 40, width: 40 }}
                    />
                  </TouchableOpacity>
                ) : (
                  // make changes here
                  <Pressable
                    style={[styles.circularButton, { zIndex: 500 }]}
                    onPress={() => {
                      const chatDetail = chat;
                      const checkItem = item[0];
                      const getitem = {
                        ...checkItem,
                        first: "",
                        second: "",
                        third: "",
                        firstR: "",
                        secondR: "",
                        thirdR: "",
                        item: { ...checkItem?.item, senderMessage: "" },
                      };

                      let tempArr = addAfter(
                        chatDetail,
                        getitem?.id + 2,
                        getitem
                      );
                      let tempArr2 = addAfter(
                        tempArr,
                        getitem?.id + 3,
                        getitem
                      );

                      returnChat(tempArr2);
                    }}
                  >
                    <Image
                      source={icn.plusDotedIcn}
                      style={{ height: 40, width: 40 }}
                    />
                  </Pressable>
                )}
              </TouchableOpacity>
            )}
          </View>
        );
    };

    const renderItem = ({ item, index }: any) => {
      let backgroundImage =
        index === 0 || index === groupedMessages.length - 1
          ? img.singleBookTester3 // Single page image
          : img.bookImg; // Double page image

      const isDoubleImage = backgroundImage === img.bookImg;

      if (backgroundImage == img.singleBookTester3) {
        return (
          <View
            style={
              extendedView
                ? [
                    { transform: [{ scale: 0.5 }] },
                    {
                      width: extendedView ? wp(32) : undefined,
                    },
                  ]
                : undefined
            }
          >
            <ViewShot ref={itemRefs?.current[index]}>
              <ImageBackground
                source={backgroundImage}
                style={[
                  styles.chatContainer,

                  {
                    height: containerHeight * 0.85, // Adjusted height
                    width: extendedView ? wp(30) : width * 0.425, // Adjusted width
                    alignSelf: "center", // Center first and last elements
                  },
                ]}
                resizeMode="stretch"
              >
                {/* here is the background of single */}

                {item[0]?.chatBackground?.image ? (
                  <Image
                    source={getImage(item[0]?.chatBackground)}
                    style={{
                      position: "absolute",
                      backgroundColor: item[0]?.chatBackground,
                      top: 5,
                      left: 5,
                      width: extendedView
                        ? wp(width * 0.0345)
                        : width * 0.425 - 10,
                      borderRadius: isTablet ? 20 : 10,
                      height: containerHeight * 0.85 - 11,
                    }}
                    resizeMode="stretch"
                  />
                ) : (
                  <View
                    style={{
                      position: "absolute",
                      backgroundColor: item[0]?.chatBackground,
                      top: 5,
                      left: 5,
                      width: extendedView
                        ? wp(width * 0.0345)
                        : width * 0.425 - 10,
                      borderRadius: isTablet ? 20 : 10,
                      height: containerHeight * 0.85 - 11,
                    }}
                  />
                )}
                {/* Non-cover view with buttons */}
                <View style={styles.additionOfNonButtonContainer}>
                  {["Button 1", "Button 2", "Button 3"].map(
                    (buttonLabel, idx) => {
                      return (
                        <View
                          key={idx}
                          style={
                            idx == 1
                              ? styles.additionOfNonButtonWrapperAlt
                              : styles.additionOfNonButtonWrapper
                          }
                        >
                          <TouchableOpacity
                            style={styles.additionOfNonButton}
                            onPress={() => {
                              setEditItem({
                                item: item,
                                type: "cover",
                                buttonIndex: idx,
                                objectIndex: index != 0 ? item[0]?.id : 0,
                              });
                            }}
                          >
                            {idx == 1 && item[0]?.second ? (
                              <Image
                                source={{ uri: item[0]?.second }}
                                style={{
                                  width: 100,
                                  height: 100,
                                  position: "absolute",
                                }}
                              />
                            ) : null}
                            <Text
                              style={[
                                styles.additionOfNonButtonText,
                                {
                                  fontSize: item[0]?.fontSize,
                                  fontFamily: item[0]?.fontFamily,
                                  color: "black",
                                  textDecorationLine:
                                    item[0]?.fontStyle?.includes("underline")
                                      ? "underline"
                                      : "none",
                                  fontWeight: item[0]?.fontStyle?.includes(
                                    "bold"
                                  )
                                    ? "bold"
                                    : "normal",
                                  fontStyle: item[0]?.fontStyle?.includes(
                                    "italic"
                                  )
                                    ? "italic"
                                    : "normal",
                                },
                              ]}
                            >
                              {idx == 0 && item[0]?.first
                                ? item[0]?.first
                                : idx == 1 && item[0]?.second
                                ? ""
                                : idx == 1
                                ? "+"
                                : idx == 2 && item[0]?.third
                                ? item[0]?.third
                                : "+"}{" "}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      );
                    }
                  )}
                </View>
              </ImageBackground>
            </ViewShot>

            {/* Buttons outside the image */}
            {index == groupedMessages?.length - 1 ? null : (
              <View style={styles.iconsContainer}>
                {index == 0 || index == groupedMessages.length - 2 ? (
                  <TouchableOpacity style={styles.circularButton}>
                    <Image
                      source={icn.dotedLock}
                      style={{ height: 40, width: 40 }}
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.circularButton}
                    onPress={() => console.log("oress")}
                  >
                    <Image
                      source={icn.plusDotedIcn}
                      style={{ height: 40, width: 40 }}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}
            <Text
              style={{
                color: "black",
                position: "absolute",
                right: wp(28),
                bottom: hp(1),
                fontWeight: "bold",
              }}
            >
              {index + 1}
            </Text>
          </View>
        );
      }

      if (backgroundImage == img.bookImg)
        return (
          <ViewShot
            ref={itemRefs.current[index]}
            style={[extendedView ? { transform: [{ scale: 0.5 }] } : undefined]}
          >
            <ImageBackground
              source={backgroundImage}
              style={[
                styles.chatContainer,
                {
                  height: containerHeight * 0.85, // Reduced height
                  width: extendedView ? width * 0.45 : width * 0.85, // Adjusted width
                  alignSelf: "center", // Center first and last elements
                },
              ]}
              resizeMode="stretch"
            >
              {/* Render the content */}
              {/* in case the index is 1 left should be locked */}
              {/* here is the background of left container */}
              {item[0]?.chatBackground?.image ? (
                <Image
                  source={getImage(item[0]?.chatBackground)}
                  style={{
                    position: "absolute",
                    backgroundColor: item[0]?.chatBackground,
                    top: 5,
                    left: 5,
                    width: extendedView ? width * 0.22 : width * 0.425 - 10,
                    borderRadius: isTablet ? 25 : 10,
                    height: containerHeight * 0.85 - 11,
                  }}
                />
              ) : (
                <View
                  style={{
                    position: "absolute",
                    backgroundColor: item[0]?.chatBackground,
                    top: 5,
                    left: 5,
                    width: extendedView ? width * 0.213 : width * 0.425 - 10,
                    borderRadius: isTablet ? 25 : 10,
                    height: containerHeight * 0.85 - 11,
                  }}
                />
              )}
              {index == 1 ? (
                <View
                  style={[
                    styles.leftContainer,
                    isDoubleImage && styles.leftMarginForDouble,
                  ]}
                >
                  <Image
                    source={icn.simpleLockIcn}
                    style={{
                      height: 50,
                      width: 50,
                      marginTop: hp(3),
                      marginLeft: isTablet ? wp(14) : undefined,
                      alignSelf: isTablet ? undefined : "center",
                    }}
                  />
                </View>
              ) : (
                <View
                  style={[
                    styles.leftContainer,
                    isDoubleImage && styles.leftMarginForDouble,
                  ]}
                >
                  <View
                    style={[
                      styles.additionOfNonButtonWrapper,
                      { position: "absolute", top: hp(-10), width: "90%" },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.additionOfNonButton}
                      onPress={() => {
                        setEditItem({
                          item: item,
                          type: "noncover",
                          buttonIndex: 0,
                          objectIndex: item[0]?.id,
                        });
                      }}
                    >
                      <Text
                        style={[
                          styles.additionOfNonButtonText,
                          {
                            fontSize: item[0]?.fontSize,
                            fontFamily: item[0]?.fontFamily,
                            color: "black",
                            textDecorationLine: item[0]?.fontStyle?.includes(
                              "underline"
                            )
                              ? "underline"
                              : "none",
                            fontWeight: item[0]?.fontStyle?.includes("bold")
                              ? "bold"
                              : "normal",
                            fontStyle: item[0]?.fontStyle?.includes("italic")
                              ? "italic"
                              : "normal",
                          },
                        ]}
                      >
                        {item[0]?.first ? item[0]?.first : "+"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {item
                    .slice(0, maxMessagesPerSide)
                    .map((chatItem: any, idx: any) => (
                      <>
                        {/* if there is no sender message */}
                        {chatItem?.item?.senderMessage ? (
                          <View
                            key={chatItem?.id || idx}
                            style={[
                              styles.messageContainer,
                              {
                                flex: 1,
                                height: "30%",
                                marginBottom:
                                  idx === maxMessagesPerSide - 1 ? 20 : 5,
                              },
                            ]}
                          >
                            {!chatItem?.hideName && (
                              <Text
                                style={[
                                  styles.senderName,
                                  chatItem?.item?.isSender
                                    ? { color: "black" }
                                    : { color: "black" },
                                ]}
                              >
                                {chatItem?.item?.senderName}
                              </Text>
                            )}

                            {!chatItem?.item?.path ? (
                              <Text
                                style={[
                                  styles.messageText,
                                  isDoubleImage &&
                                    styles.doubleImageMessageText,
                                  {
                                    fontSize: chatItem?.fontSize,
                                    fontFamily: chatItem?.fontFamily,
                                    color: chatItem?.item?.sender
                                      ? chatItem?.senderTextColor
                                      : chatItem?.receiverTextColor,
                                    backgroundColor: chatItem?.item?.sender
                                      ? chatItem?.senderBackground
                                      : chatItem?.receiverBackground,
                                    textDecorationLine:
                                      chatItem?.fontStyle?.includes("underline")
                                        ? "underline"
                                        : "none",
                                    fontWeight: chatItem?.fontStyle?.includes(
                                      "bold"
                                    )
                                      ? "bold"
                                      : "normal",
                                    fontStyle: chatItem?.fontStyle?.includes(
                                      "italic"
                                    )
                                      ? "italic"
                                      : "normal",
                                  },
                                ]}
                              >
                                {chatItem?.item?.senderMessage}
                              </Text>
                            ) : (
                              <View style={styles.qrCodeContainer}>
                                <QRCode
                                  value={chatItem?.item?.path}
                                  size={60}
                                />
                              </View>
                            )}

                            <Text style={styles.timeText}>
                              {chatItem?.item?.sendingTime}
                            </Text>
                          </View>
                        ) : (
                          <View
                            style={[
                              styles.additionOfNonButtonWrapperAlt,
                              { width: "90%", height: "70%" },
                            ]}
                          >
                            <TouchableOpacity
                              style={styles.additionOfNonButton}
                              onPress={() => {
                                setEditItem({
                                  item: item,
                                  type: "noncover",
                                  buttonIndex: 1,
                                  objectIndex: item[0]?.id,
                                  field: "second",
                                });
                              }}
                            >
                              {item[0]?.second ? (
                                <Image
                                  source={{ uri: item[0]?.second }}
                                  style={{
                                    width: 100,
                                    height: 100,
                                    position: "absolute",
                                  }}
                                />
                              ) : (
                                <Text
                                  style={[
                                    styles.additionOfNonButtonText,
                                    {
                                      fontSize: item[0]?.fontSize,
                                      fontFamily: item[0]?.fontFamily,
                                      color: "black",
                                      textDecorationLine:
                                        item[0]?.fontStyle?.includes(
                                          "underline"
                                        )
                                          ? "underline"
                                          : "none",
                                      fontWeight: item[0]?.fontStyle?.includes(
                                        "bold"
                                      )
                                        ? "bold"
                                        : "normal",
                                      fontStyle: item[0]?.fontStyle?.includes(
                                        "italic"
                                      )
                                        ? "italic"
                                        : "normal",
                                    },
                                  ]}
                                >
                                  {item[0]?.second ? item[0]?.second : "+"}
                                </Text>
                              )}
                            </TouchableOpacity>
                          </View>
                        )}
                      </>
                    ))}
                  <View
                    style={[
                      styles.additionOfNonButtonWrapper,
                      { position: "absolute", bottom: hp(-8), width: "90%" },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.additionOfNonButton}
                      onPress={() => {
                        setEditItem({
                          item: item,
                          type: "noncover",
                          buttonIndex: 2,
                          objectIndex: item[0]?.id,
                        });
                      }}
                    >
                      <Text
                        style={[
                          styles.additionOfNonButtonText,
                          {
                            fontSize: item[0]?.fontSize,
                            fontFamily: item[0]?.fontFamily,
                            color: "black",
                            textDecorationLine: item[0]?.fontStyle?.includes(
                              "underline"
                            )
                              ? "underline"
                              : "none",
                            fontWeight: item[0]?.fontStyle?.includes("bold")
                              ? "bold"
                              : "normal",
                            fontStyle: item[0]?.fontStyle?.includes("italic")
                              ? "italic"
                              : "normal",
                          },
                        ]}
                      >
                        {item[0]?.third ? item[0]?.third : "+"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {isDoubleImage && (
                <>
                  {index == groupedMessages?.length - 2 ? (
                    <View
                      style={[
                        styles.rightContainer,
                        isDoubleImage && styles.leftMarginForDouble,
                      ]}
                    >
                      {item[0]?.chatBackground?.image ? (
                        <Image
                          source={getImage(item[0]?.chatBackground)}
                          style={{
                            position: "absolute",
                            backgroundColor: item[0]?.chatBackground,
                            top: -hp(12.9),
                            left: isTablet ? tabletLeft : mobileLeft,
                            width: width * 0.425 - 10,
                            borderRadius: isTablet ? 25 : 10,
                            height: containerHeight * 0.85 - 11,
                          }}
                        />
                      ) : (
                        <View
                          style={{
                            position: "absolute",
                            backgroundColor: item[0]?.chatBackground,
                            top: -hp(12.9),
                            left: isTablet ? tabletLeft : mobileLeft,
                            width: extendedView
                              ? width * 0.213
                              : width * 0.425 - 10,
                            borderRadius: isTablet ? 25 : 10,
                            height: containerHeight * 0.85 - 11,
                          }}
                        />
                      )}
                      <Image
                        source={icn.simpleLockIcn}
                        style={{
                          height: 50,
                          width: 50,
                          marginTop: hp(3),
                          marginLeft: isTablet ? wp(11) : wp(5),
                        }}
                      />
                    </View>
                  ) : (
                    <View style={styles.rightContainer}>
                      {/* here is the background of right container */}
                      {item[0]?.chatBackground?.image ? (
                        <Image
                          source={getImage(item[0]?.chatBackground)}
                          style={{
                            position: "absolute",
                            backgroundColor: item[0]?.chatBackground,
                            top: -hp(12.9),
                            left: isTablet ? tabletLeftContainer : -wp(1.2),
                            width: width * 0.425 - 10,
                            borderRadius: isTablet ? 20 : 10,
                            height: containerHeight * 0.85 - 11,
                          }}
                        />
                      ) : (
                        <View
                          style={{
                            position: "absolute",
                            backgroundColor: item[0]?.chatBackground,
                            top: -hp(12.9),
                            left: isTablet ? -wp(2) : -wp(1.2),
                            width: width * 0.425 - 10,
                            borderRadius: isTablet ? 20 : 10,
                            height: containerHeight * 0.85 - 11,
                          }}
                        />
                      )}
                      <View
                        style={[
                          styles.additionOfNonButtonWrapper,
                          {
                            position: "absolute",
                            top: hp(-10),
                            width: "90%",
                          },
                        ]}
                      >
                        <TouchableOpacity
                          style={styles.additionOfNonButton}
                          onPress={() =>
                            setEditItem({
                              item: item,
                              type: "noncover",
                              buttonIndex: 3,
                              objectIndex: item[0]?.id,
                            })
                          }
                        >
                          <Text
                            style={[
                              styles.additionOfNonButtonText,
                              {
                                fontSize: item[0]?.fontSize,
                                fontFamily: item[0]?.fontFamily,
                                color: "black",
                                textDecorationLine:
                                  item[0]?.fontStyle?.includes("underline")
                                    ? "underline"
                                    : "none",
                                fontWeight: item[0]?.fontStyle?.includes("bold")
                                  ? "bold"
                                  : "normal",
                                fontStyle: item[0]?.fontStyle?.includes(
                                  "italic"
                                )
                                  ? "italic"
                                  : "normal",
                              },
                            ]}
                          >
                            {item[0]?.firstR ? item[0]?.firstR : "+"}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {item
                        .slice(maxMessagesPerSide, maxMessagesPerSide * 2)
                        .map((chatItem: any, idx: number) => (
                          <>
                            {chatItem?.item?.senderMessage ? (
                              <View
                                key={chatItem?.id || idx}
                                style={[
                                  styles.messageContainer,
                                  {
                                    flex: 1,
                                    marginBottom:
                                      idx === maxMessagesPerSide * 2 - 1
                                        ? 20
                                        : 5,
                                  },
                                ]}
                              >
                                {!chatItem?.hideName && (
                                  <Text
                                    style={[
                                      styles.senderName,
                                      chatItem?.item?.sender
                                        ? { color: "black" }
                                        : { color: "black" },
                                    ]}
                                  >
                                    {chatItem?.item?.senderName}
                                  </Text>
                                )}

                                {!chatItem?.item?.path ? (
                                  <Text
                                    style={[
                                      styles.messageText,
                                      isDoubleImage &&
                                        styles.doubleImageMessageText,
                                      {
                                        fontSize: chatItem?.fontSize,
                                        fontFamily: chatItem?.fontFamily,
                                        color: chatItem?.item?.sender
                                          ? chatItem?.senderTextColor
                                          : chatItem?.receiverTextColor,
                                        backgroundColor: chatItem?.item?.sender
                                          ? chatItem?.senderBackground
                                          : chatItem?.receiverBackground,
                                        textDecorationLine:
                                          chatItem?.fontStyle?.includes(
                                            "underline"
                                          )
                                            ? "underline"
                                            : "none",
                                        fontWeight:
                                          chatItem?.fontStyle?.includes("bold")
                                            ? "bold"
                                            : "normal",
                                        fontStyle:
                                          chatItem?.fontStyle?.includes(
                                            "italic"
                                          )
                                            ? "italic"
                                            : "normal",
                                      },
                                    ]}
                                  >
                                    {chatItem?.item?.senderMessage}
                                  </Text>
                                ) : (
                                  <View style={styles.qrCodeContainer}>
                                    <QRCode
                                      value={chatItem?.item?.path}
                                      size={60}
                                    />
                                  </View>
                                )}

                                <Text style={styles.timeText}>
                                  {chatItem?.item?.sendingTime}
                                </Text>
                              </View>
                            ) : (
                              <View
                                style={[
                                  styles.additionOfNonButtonWrapperAlt,
                                  { width: "90%", height: "70%" },
                                ]}
                              >
                                <TouchableOpacity
                                  style={styles.additionOfNonButton}
                                  onPress={() => {
                                    setEditItem({
                                      item: item,
                                      type: "noncover",
                                      buttonIndex: 1,
                                      objectIndex: item[0]?.id,
                                      field: "secondR",
                                    });
                                  }}
                                >
                                  {item[0]?.secondR ? (
                                    <Image
                                      source={{ uri: item[0]?.secondR }}
                                      style={{
                                        width: 100,
                                        height: 100,
                                        position: "absolute",
                                      }}
                                    />
                                  ) : (
                                    <Text
                                      style={[
                                        styles.additionOfNonButtonText,
                                        {
                                          fontSize: item[0]?.fontSize,
                                          fontFamily: item[0]?.fontFamily,
                                          color: "black",
                                          textDecorationLine:
                                            item[0]?.fontStyle?.includes(
                                              "underline"
                                            )
                                              ? "underline"
                                              : "none",
                                          fontWeight:
                                            item[0]?.fontStyle?.includes("bold")
                                              ? "bold"
                                              : "normal",
                                          fontStyle:
                                            item[0]?.fontStyle?.includes(
                                              "italic"
                                            )
                                              ? "italic"
                                              : "normal",
                                        },
                                      ]}
                                    >
                                      {item[0]?.secondR
                                        ? item[0]?.secondR
                                        : "+"}
                                    </Text>
                                  )}
                                </TouchableOpacity>
                              </View>
                            )}
                          </>
                        ))}
                      <View
                        style={[
                          styles.additionOfNonButtonWrapper,
                          {
                            position: "absolute",
                            bottom: hp(-8),
                            width: "90%",
                          },
                        ]}
                      >
                        <TouchableOpacity
                          style={styles.additionOfNonButton}
                          onPress={() =>
                            setEditItem({
                              item: item,
                              type: "noncover",
                              buttonIndex: 5,
                              objectIndex: item[0]?.id,
                            })
                          }
                        >
                          <Text
                            style={[
                              styles.additionOfNonButtonText,
                              {
                                fontSize: item[0]?.fontSize,
                                fontFamily: item[0]?.fontFamily,
                                color: "black",
                                textDecorationLine:
                                  item[0]?.fontStyle?.includes("underline")
                                    ? "underline"
                                    : "none",
                                fontWeight: item[0]?.fontStyle?.includes("bold")
                                  ? "bold"
                                  : "normal",
                                fontStyle: item[0]?.fontStyle?.includes(
                                  "italic"
                                )
                                  ? "italic"
                                  : "normal",
                              },
                            ]}
                          >
                            {item[0]?.thirdR ? item[0]?.thirdR : "+"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </>
              )}
            </ImageBackground>

            <Text
              style={{
                color: "black",
                position: "absolute",
                right: wp(28),
                bottom: hp(1),
                fontWeight: "bold",
              }}
            >
              {index + 1}
            </Text>
            {index == groupedMessages?.length - 1 ? null : (
              <TouchableOpacity
                style={[styles.iconsContainer, {}]}
                onPress={() => {
                  if (index == 0 || index == groupedMessages.length - 2) {
                    const chatDetail = chat;
                    const checkItem = item[0];
                    const getitem = {
                      ...checkItem,
                      first: "",
                      second: "",
                      third: "",
                      firstR: "",
                      secondR: "",
                      thirdR: "",
                      item: { ...checkItem?.item, senderMessage: "" },
                    };

                    let tempArr = addAfter(
                      chatDetail,
                      getitem?.id + 2,
                      getitem
                    );
                    let tempArr2 = addAfter(tempArr, getitem?.id + 3, getitem);

                    returnChat(tempArr2);
                  }
                }}
              >
                {index == 0 || index == groupedMessages.length - 2 ? (
                  <TouchableOpacity style={styles.circularButton}>
                    <Image
                      source={icn.dotedLock}
                      style={{ height: 40, width: 40 }}
                    />
                  </TouchableOpacity>
                ) : (
                  <Pressable
                    style={[styles.circularButton, { zIndex: 500 }]}
                    onPress={() => {
                      const chatDetail = chat;
                      const checkItem = item[0];
                      const getitem = {
                        ...checkItem,
                        first: "",
                        second: "",
                        third: "",
                        firstR: "",
                        secondR: "",
                        thirdR: "",
                        item: { ...checkItem?.item, senderMessage: "" },
                      };

                      let tempArr = addAfter(
                        chatDetail,
                        getitem?.id + 2,
                        getitem
                      );
                      let tempArr2 = addAfter(
                        tempArr,
                        getitem?.id + 3,
                        getitem
                      );

                      returnChat(tempArr2);
                    }}
                  >
                    <Image
                      source={icn.plusDotedIcn}
                      style={{ height: 40, width: 40 }}
                    />
                  </Pressable>
                )}
              </TouchableOpacity>
            )}
          </ViewShot>
        );
    };

    return (
      <>
        {isLoading ? (
          <View
            style={{
              position: "absolute",
              zIndex: 200,
              top: hp(20),
              alignSelf: "center",
              backgroundColor: "grey",
              padding: 10,
              borderRadius: 30,
            }}
          >
            <ActivityIndicator size={wp(4)} />
          </View>
        ) : null}
        {deletion ? (
          <TouchableOpacity
            style={{
              alignSelf: "flex-end",
              borderWidth: 1,
              borderColor: "#E2E2E2",
              padding: 5,
              borderRadius: 10,
            }}
            onPress={() => returnDeletion()}
          >
            <Text style={{ color: "grey", fontWeight: "bold", fontSize: 20 }}>
              Done
            </Text>
          </TouchableOpacity>
        ) : null}

        <FlatList
          maxToRenderPerBatch={3}
          numColumns={extendedView ? 2 : 1}
          data={groupedMessages}
          renderItem={
            deletion
              ? renderDeletion
              : extendedView
              ? (renderItemMini as any)
              : renderItem
          }
          // keyExtractor={(item, index) => index.toString()}
          key={extendedView}
        />

        <AddTextModal
          visible={editItem != null && editItem?.buttonIndex != 1}
          // characters={alterCharacters}
          alterView={true}
          // value={alterTextState}
          // onChangeText={(txt: any) => setAlterTextState(txt)}
          // withOutFeedbackPress={() => setShowAlterTextModal(false)}
          onSubmitPress={(text: any) => {
            // setEditItem({
            //   item: item,
            //   type: "cover",
            //   buttonIndex: idx,
            //   objectIndex: index,
            // })

            if (editItem?.type == "cover") {
              const { buttonIndex } = editItem;
              var tempArr = chat;

              switch (buttonIndex) {
                //first button of cover page

                case 0:
                  const newArr = editKeyValue(
                    tempArr,
                    editItem?.objectIndex,
                    "first",
                    text
                  );

                  returnChat(newArr);
                  break;
                //last button of cover page
                case 2:
                  const newArr2 = editKeyValue(
                    tempArr,
                    editItem?.objectIndex,
                    "third",
                    text
                  );

                  returnChat(newArr2);

                  break;
                case 3:
                  const newArr3 = editKeyValue(
                    tempArr,
                    editItem?.objectIndex,
                    "firstR",
                    text
                  );

                  returnChat(newArr3);

                  break;
                case 5:
                  const newArr4 = editKeyValue(
                    tempArr,
                    editItem?.objectIndex,
                    "thirdR",
                    text
                  );

                  returnChat(newArr4);

                  break;
                default:
                  break;
              }
            } else {
              const { buttonIndex } = editItem;

              var tempArr = chat;

              switch (buttonIndex) {
                //first button of cover page

                case 0:
                  const newArr = editKeyValue(
                    tempArr,
                    editItem?.objectIndex,
                    "first",
                    text
                  );

                  returnChat(newArr);
                  break;
                //last button of cover page
                case 2:
                  const newArr2 = editKeyValue(
                    tempArr,
                    editItem?.objectIndex,
                    "third",
                    text
                  );

                  returnChat(newArr2);

                  break;
                case 3:
                  const newArr3 = editKeyValue(
                    tempArr,
                    editItem?.objectIndex,
                    "firstR",
                    text
                  );

                  returnChat(newArr3);

                  break;
                case 5:
                  const newArr4 = editKeyValue(
                    tempArr,
                    editItem?.objectIndex,
                    "thirdR",
                    text
                  );

                  returnChat(newArr4);

                  break;
                default:
                  break;
              }
            }
            setEditItem(null);
          }}
          headerPress={() => setEditItem(null)}
        />
      </>
    );
  }
);

const { width, height } = Dimensions.get("window");

const styles: any = StyleSheet.create({
  chatContainer: {
    marginVertical: height * 0.05,
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    overflow: "hidden",
  },
  leftContainer: {
    height: "40%",
    width: "50%",
    alignSelf: "center",
    paddingRight: 10,
  },
  rightContainer: {
    height: "40%",
    width: "50%",
    alignSelf: "center",
    paddingLeft: 10,
  },
  leftMarginForDouble: {
    marginLeft: "3%",
  },
  messageContainer: {
    marginBottom: 5,
    width: "90%",
  },
  senderName: {
    fontWeight: "bold",
    marginBottom: 3,
  },
  messageText: {
    padding: 8,
    borderRadius: 10,
    marginTop: 3,
  },
  timeText: {
    fontSize: 10,
    color: "gray",
    textAlign: "right",
  },
  qrCodeContainer: {
    marginTop: 5,
    alignItems: "flex-start",
  },
  buttonContainer: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "black",
    borderStyle: "dashed",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
  },
  circularButton: {
    borderRadius: 50,
    // borderWidth: 1,
    borderColor: "black",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  iconsContainer: {
    position: "absolute",
    bottom: -30,
    alignSelf: "center",
    right: wp(37),
    zIndex: 500,
  },
  doublePageButton: {
    marginVertical: 10,
    alignItems: "center",
  },
  singlePageButton: {
    marginVertical: 10,
    flex: 1,
    alignItems: "center",
  },
  additionOfNonButtonContainer: {
    flexDirection: "column", // Arrange buttons in a column
    justifyContent: "space-around", // Space buttons equally
    alignItems: "center",
    height: "80%", // Adjust the height as needed to allow vertical spacing
    width: "100%", // Adjust the width as needed
    alignSelf: "center", // Center the container
  },
  additionOfNonButtonWrapper: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "black",
    borderStyle: "dashed",
    width: "100%", // Make it full width of the container
    alignItems: "center", // Center the button within the wrapper
    marginVertical: 5, // Space between button wrappers
  },
  additionOfNonButtonWrapperAlt: {
    borderRadius: 10,
    borderWidth: 1,
    height: "40%",
    justifyContent: "center",
    borderColor: "black",
    borderStyle: "dashed",
    width: "100%", // Make it full width of the container
    alignItems: "center", // Center the button within the wrapper
    marginVertical: 5, // Space between button wrappers
  },
  additionOfNonButton: {
    // Add padding to button

    width: "100%", // Full width of the wrapper
    alignItems: "center",
    justifyContent: "center",
  },
  additionOfNonButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
});

export default React.memo(ChatList);
