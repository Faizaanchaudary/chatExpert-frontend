import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import {useMediaContext} from 'rn-declarative';
import {icn} from '../../assets/icons';
import ChatViewer, {ChatViewerRef} from '../../Components/A4ChatViewer';
import AddTextModal from '../../Components/AddTextModal';
import ChooseImportModal from '../../Components/ChooseImportModal';
import ColorModal from '../../Components/ColorModal';
import CustomButton from '../../Components/CustomButton';
import FontsModal from '../../Components/FontsModal';
import ToggleButton from '../../Components/ToggleButton/inde';
import fonts from '../../utils/fonts';
import {hp, wp} from '../../utils/reponsiveness';
import {styles} from './style';
import {useSelector} from 'react-redux';
import {store, useAppSelector} from '../../store/Store';
import {IMessage, IMessageBubble} from '../../interfaces/IMessage';
import {IChat} from '../../interfaces/IChat';

interface BookListProps {
  navigation?: any;
  route?: any;
}

// Define a type for the Redux store state
type RootState = ReturnType<typeof store.getState>;

const BookList: React.FC<BookListProps> = ({navigation, route}) => {
  const isExtendedView = route?.params?.isExtendedView;

  const {currentChat, chatMessages} = useAppSelector(state => state.chats);

  const [selectedButton, setSelectedButton] = useState(0);
  const [showDeleteScreen, setShowDeleteScreen] = useState(false);
  const [showAlterTextModal, setShowAlterTextModal] = useState(false);
  const {isPhone, isTablet, isDesktop} = useMediaContext();
  const [showEditModal, setShowEditModal] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<any>([]);
  const [currentColor, setCurrentColor] = useState(null);
  const [fontFamily, setFontFamily] = useState(fonts.ROBOTO.Medium);
  const [fontStyle, setFontStyle] = useState('regular');
  const [pages, setPages] = useState(0);
  const a4Ref = useRef<ChatViewerRef>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentIndex, setCurrentIndex] = useState<number | any>({
    ind: null,
    cType: '',
  });
  const [uniqueId, setUniqueId] = useState<string | null>(null);
  const [uniqueIdCart, setUniqueIdCart] = useState<string | null>(null);
  const [addTextState, setAddTextState] = useState('');
  const [defaultTextState, setDefaultTextState] = useState('');
  const [alterTextState, setAlterTextState] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [defaultViewData, setDefaultViewData] = useState([
    {
      source: icn.dotedLock,
      leftSideLock: true,
      leftSideSource: icn.simpleLockIcn,
      showBottomNumbers: true,
      rightBottomText: '1',
    },
    {
      source: icn.plusDotedIcn,
      showBottomNumbers: true,
      leftBottomText: '2',
      rightBottomText: '3',
    },
    {
      source: icn.plusDotedIcn,
      rightSideLock: true,
      rightSideSource: icn.simpleLockIcn,
      showBottomNumbers: true,
      leftBottomText: '4',
    },
  ]);

  const [extendedViewData, setExtendedViewData] = useState([
    {
      leftSideLock: true,
      rightBottomText: '1',
      showBottomNumbers: true,

      leftSideSource: icn.simpleLockIcn,
    },
    {
      showBottomNumbers: true,
      leftBottomText: '2',
      rightBottomText: '3',
    },
    {
      showBottomNumbers: true,
      leftBottomText: '4',
      rightBottomText: '5',
    },
    {
      showBottomNumbers: true,
      leftBottomText: '6',
      rightBottomText: '7',
    },
    {
      showBottomNumbers: true,
      leftBottomText: '8',
      rightBottomText: '9',
    },
    {
      showBottomNumbers: true,
      leftBottomText: '10',
      rightBottomText: '11',
    },
    {
      showBottomNumbers: true,
      leftBottomText: '12',
      rightBottomText: '13',
    },
    {
      showBottomNumbers: true,
      leftBottomText: '14',
      rightBottomText: '15',
    },
    {
      showBottomNumbers: true,
      leftBottomText: '16',
      rightBottomText: '17',
    },
    {
      showBottomNumbers: true,
      leftBottomText: '18',
      rightSideLock: true,
      rightSideSource: icn.simpleLockIcn,
    },
  ]);
  const [showAddTextModal, setShowAddTextModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [showFontsModal, setShowFontsModal] = useState(false);
  const [showChooseImportModal, setShowChooseImportModal] = useState<null | {
    indexOfPage?: number;
    function?: (params: any) => void;
    params?: any;
  }>(null);
  const [characters, setCharacters] = useState(40);
  const [alterCharacters, setAlterCharacters] = useState(200);
  const chatlistRef = useRef<any>();
  const isFocused = useIsFocused();
  const savedChats = useSelector((state: RootState) => state.user.savedChats);
  const cartChats = useSelector((state: RootState) => state.user.cartChats);

  // useEffect(() => {
  //   if (chat?.chat?.length < 1 || chat?.chat?.length == undefined) {
  //     setShowChooseImportModal(true);
  //   } else {
  //     setShowChooseImportModal(false);
  //   }
  // }, [chat]);

  useEffect(() => {
    console.log('Current Chat', currentChat);
    console.log('Current Chat messages', chatMessages?.length);
    if (currentChat && chatMessages?.length) {
      addChatToPage(chatMessages, currentChat);
    }
  }, [currentChat, chatMessages]);

  // useEffect(() => {
  //   console.log('route?.params', route?.params);
  //   // Load from savedChats if uniqueId is present
  //   if (route?.params?.uniqueId) {
  //     setUniqueId(route?.params?.uniqueId);
  //     setUniqueIdCart(null);
  //     console.log('Setting uniqueId:', route?.params?.uniqueId);

  //     if (savedChats && savedChats.length > 0) {
  //       console.log('Searching through savedChats:', savedChats.length);
  //       const savedChat = savedChats.find(
  //         item => item.id === route?.params?.uniqueId,
  //       );
  //       console.log('Found savedChat:', savedChat?.id);

  //       if (savedChat && savedChat.chat) {
  //         console.log('Saved chat data found, pages:', savedChat.chat.length);
  //         setPages(savedChat.chat.length);

  //         setTimeout(() => {
  //           if (a4Ref.current) {
  //             console.log('Loading saved chat into A4ChatViewer');
  //             a4Ref.current.loadSavedChat(savedChat.chat);
  //             console.log('Chat loaded successfully from draft');
  //           } else {
  //             console.log('a4Ref.current is not available');
  //           }
  //         }, 1000);
  //       } else {
  //         console.log('No saved chat data found for this uniqueId');
  //       }
  //     }
  //   } else if (route?.params?.uniqueCartId) {
  //     // Load from cartChats if uniqueCartId is present
  //     setUniqueId(null);
  //     setUniqueIdCart(route?.params?.uniqueCartId);
  //     console.log('Setting uniqueIdCart:', route?.params?.uniqueCartId);

  //     if (cartChats && cartChats.length > 0) {
  //       const cartChat = cartChats.find(
  //         item => item.id === route?.params?.uniqueCartId,
  //       );
  //       console.log('Found cartChat:', cartChat?.id);

  //       if (cartChat && cartChat.chat) {
  //         console.log('Cart chat data found, pages:', cartChat.chat.length);
  //         setPages(cartChat.chat.length);

  //         setTimeout(() => {
  //           if (a4Ref.current) {
  //             console.log('Loading cart chat into A4ChatViewer');
  //             a4Ref.current.loadSavedChat(cartChat.chat);
  //             console.log('Chat loaded successfully from cart');
  //           } else {
  //             console.log('a4Ref.current is not available for cart chat');
  //           }
  //         }, 1000);
  //       } else {
  //         console.log('No cart chat data found for this uniqueCartId');
  //       }
  //     }
  //   } else {
  //     setUniqueId(null);
  //     setUniqueIdCart(null);
  //   }
  // }, [route?.params, savedChats, cartChats]);

  const showSelection = (data: any) => {
    setShowChooseImportModal(data);
  };

  const addChatToPage = (data: IMessage[], chat: IChat) => {
    console.log('Data>>>', data.length);

    const messageBubbles: IMessageBubble[] = data.map(
      msg =>
        ({
          item: msg,
          id: msg._id,
        } as IMessageBubble),
    );

    if (
      route.params?.bookspecs &&
      chat?.bookConfig &&
      showChooseImportModal?.indexOfPage
    ) {
      a4Ref?.current?.convertMessagesToPages(
        messageBubbles,
        route.params.bookspecs,
        chat.bookConfig,
        showChooseImportModal?.indexOfPage,
      );
    } else {
      Alert.alert(
        'Error',
        'Book specifications are missing. Please try again.',
      );
    }
    setShowChooseImportModal(null);
  };

  const updateFontProperties = (
    arr: any[],
    newFontFamily: string | undefined,
    newFontStyle: string | undefined,
    color?: any,
  ) => {
    try {
      if (color) {
        const tempArr = arr.map((item: any) => {
          return {
            ...item,
            chatBackground: color,
          };
        });

        return tempArr;
      }
      const tempArr = arr.map((item: any) => {
        return {
          ...item,
          fontFamily: newFontFamily,
          fontStyle: newFontStyle,
        };
      });

      return tempArr;
    } catch (err) {
      console.log('Error:', err);
    }
  };

  useEffect(() => {
    const changeFont = async () => {
      if (fontStyle && fontFamily) {
        a4Ref?.current?.changeFontSize(fontStyle, fontFamily);
      }
    };
    changeFont();
  }, [fontFamily, fontStyle]);

  useEffect(() => {
    const changeColor = async () => {
      console.log('Method called');
      if (currentColor) {
        a4Ref?.current?.addChatBackgroundValue(currentColor);
      }
    };
    changeColor();
  }, [currentColor]);

  useEffect(() => {
    if (isExtendedView) {
      setSelectedButton(1);
    }
  }, [isExtendedView]);

  // Add tracking for uniqueId changes to verify correct behavior
  useEffect(() => {
    if (uniqueId) {
      console.log('uniqueId state updated:', uniqueId);
      // This useEffect will run whenever uniqueId changes
      // Helps track if the uniqueId is properly being loaded and maintained
    }
  }, [uniqueId]);

  // Add tracking for uniqueIdCart changes
  useEffect(() => {
    if (uniqueIdCart) {
      console.log('uniqueIdCart state updated:', uniqueIdCart);
      // This helps track if the uniqueIdCart is properly being detected and maintained
    }
  }, [uniqueIdCart]);

  //ODD STYLE ON SUBMIT PRESS
  const onSubmitPress = (
    array: any,
    setArray: any,
    state: any,
    setState: any,
  ) => {
    const truncatedText =
      state.length > 10 ? state.substring(0, 10) + '…' : state;
    if (currentIndex?.ind !== null) {
      const extended = [...array];
      if (currentIndex?.cType == 'topLeftText') {
        extended[currentIndex?.ind].topLeftText = truncatedText;
        setArray(extended);
        setState('');
        setShowAddTextModal(false);
      } else if (currentIndex?.cType == 'downLeftText') {
        extended[currentIndex?.ind].downLeftText = truncatedText;
        setArray(extended);
        setState('');
        setShowAddTextModal(false);
      } else if (currentIndex?.cType == 'topUpperText') {
        extended[currentIndex?.ind].topUpperText = truncatedText;
        setArray(extended);
        setState('');
        setShowAddTextModal(false);
      } else if (currentIndex?.cType == 'downRightText') {
        extended[currentIndex?.ind].downRightText = truncatedText;
        setArray(extended);
        setState('');
        setShowAddTextModal(false);
      }
    }
  };

  const textModalSubmission = () => {
    selectedButton == 0
      ? onSubmitPress(
          defaultViewData,
          setDefaultViewData,
          defaultTextState,
          setDefaultTextState,
        )
      : onSubmitPress(
          extendedViewData,
          setExtendedViewData,
          addTextState,
          setAddTextState,
        );
  };

  const importPhotos = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      mediaType: 'photo',
      cropping: true,
    }).then(image => {
      setShowChooseImportModal(null);
      navigation.navigate('EditPhotos', {isImage: image});
    });
  };

  const removeDuplicateMessages = (messages: any[]) => {
    const seenTexts = new Set();
    if (!messages || messages?.length < 1) {
      return [];
    } else
      return messages.filter((message: any) => {
        const text = message?.item?.text || message?.text || null;

        if (text && seenTexts.has(text)) {
          return false; // Duplicate found, filter it out
        }

        if (text) {
          seenTexts.add(text); // Add new unique text
        }

        return true; // Keep this message
      });
  };

  const navigateToCarProducts = async () => {
    if (uniqueId) {
      console.log('Saving edits to existing draft:', uniqueId);
      // a4Ref?.current?.saveChat(uniqueId);

      // If the uniqueId is already in the cart, use that, otherwise add it
      if (uniqueIdCart) {
        console.log('Item already in cart, updating:', uniqueIdCart);
      } else {
        console.log('Adding new item to cart:', uniqueId);
        a4Ref?.current?.addToCart(uniqueId);
      }

      navigation.navigate('CartProducts');
    } else {
      const newUniqueId = Date.now().toString();
      console.log('Creating new draft with ID:', newUniqueId);
      setUniqueId(newUniqueId);
      // a4Ref?.current?.saveChat(newUniqueId);
      a4Ref?.current?.addToCart(newUniqueId);
      navigation.navigate('CartProducts');
    }
  };

  const returnChat = async (chatNew: Array<any>) => {
    let addedId = await Promise.all(
      chatNew.map((item: any, index: any) => {
        return {...item, id: index};
      }),
    );
    setChat({nonchat: addedId, chat: chat?.chat});
  };

  // Add cleanup for tooltip timeout
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  // Handle back button press
  useEffect(() => {
    const handleBackPress = () => {
      if (pages > 0) {
        // If uniqueId exists, save the chat before navigating
        Alert.alert(
          'Discard Changes?',
          'Are you sure you want to save your changes?',
          [
            {
              text: 'Cancel',
              onPress: () => {},
              style: 'cancel', // Optional: styles the button as a cancel button
            },
            {
              text: 'No',
              onPress: () => {
                navigation.navigate('BottomTab', {
                  screen: 'ShopTab',
                });
              },
              style: 'cancel', // Optional: styles the button as a cancel button
            },
            {
              text: 'Yes',
              onPress: () => {
                // Save the chat with the existing uniqueId if it exists (from drafts)
                // Otherwise create a new uniqueId
                if (uniqueId) {
                  console.log('Saving edits to existing draft:', uniqueId);
                  a4Ref?.current?.saveChat(uniqueId);

                  // Also update cart status if needed
                  if (uniqueIdCart) {
                    console.log('Item already in cart:', uniqueIdCart);
                  }
                } else {
                  const newUniqueId = Date.now().toString();
                  console.log('Creating new draft with ID:', newUniqueId);
                  setUniqueId(newUniqueId);
                  a4Ref?.current?.saveChat(newUniqueId);
                }

                navigation.navigate('BottomTab', {
                  screen: 'ShopTab',
                });
              },
            },
          ],
          {cancelable: true}, // Prevent dismissing by tapping outside the alert
        );
      } else {
        // Still save the chat even if there's no content
        if (uniqueId) {
          console.log('Saving empty chat to existing draft:', uniqueId);
          a4Ref?.current?.saveChat(uniqueId);

          // Also update cart status if needed
          if (uniqueIdCart) {
            console.log('Empty item already in cart:', uniqueIdCart);
          }
        } else {
          const newUniqueId = Date.now().toString();
          console.log('Creating new empty draft with ID:', newUniqueId);
          setUniqueId(newUniqueId);
          a4Ref?.current?.saveChat(newUniqueId);
        }

        navigation.navigate('BottomTab', {
          screen: 'ShopTab',
        });
      }
      return true; // Prevent default back behavior
    };

    // Add back handler when component mounts
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    // Clean up event listener when component unmounts
    return () => backHandler.remove();
  }, [navigation, pages, uniqueId]);

  return (
    <>
      <View style={styles.mainContainer}>
        <View style={styles.paddingStyle}>
          <View style={[styles.headerContainer, {paddingHorizontal: wp(5)}]}>
            <TouchableOpacity
              onPress={() => {
                if (pages > 0) {
                  // If uniqueId exists, save the chat before navigating
                  Alert.alert(
                    'Discard Changes?',
                    'Are you sure you want to save your changes?',
                    [
                      {
                        text: 'Cancel',
                        onPress: () => {},
                        style: 'cancel', // Optional: styles the button as a cancel button
                      },
                      {
                        text: 'No',
                        onPress: () => {
                          navigation.navigate('BottomTab', {
                            screen: 'ShopTab',
                          });
                        },
                        style: 'cancel', // Optional: styles the button as a cancel button
                      },
                      {
                        text: 'Yes',
                        onPress: () => {
                          // Save the chat with the existing uniqueId if it exists (from drafts)
                          // Otherwise create a new uniqueId
                          if (uniqueId) {
                            console.log(
                              'Saving edits to existing draft:',
                              uniqueId,
                            );
                            a4Ref?.current?.saveChat(uniqueId);

                            // Also update cart status if needed
                            if (uniqueIdCart) {
                              console.log(
                                'Item already in cart:',
                                uniqueIdCart,
                              );
                            }
                          } else {
                            const newUniqueId = Date.now().toString();
                            console.log(
                              'Creating new draft with ID:',
                              newUniqueId,
                            );
                            setUniqueId(newUniqueId);
                            a4Ref?.current?.saveChat(newUniqueId);
                          }

                          navigation.navigate('BottomTab', {
                            screen: 'ShopTab',
                          });
                        },
                      },
                    ],
                    {cancelable: true}, // Prevent dismissing by tapping outside the alert
                  );
                } else {
                  // Still save the chat even if there's no content
                  if (uniqueId) {
                    console.log(
                      'Saving empty chat to existing draft:',
                      uniqueId,
                    );
                    a4Ref?.current?.saveChat(uniqueId);

                    // Also update cart status if needed
                    if (uniqueIdCart) {
                      console.log('Empty item already in cart:', uniqueIdCart);
                    }
                  } else {
                    const newUniqueId = Date.now().toString();
                    console.log(
                      'Creating new empty draft with ID:',
                      newUniqueId,
                    );
                    setUniqueId(newUniqueId);
                    a4Ref?.current?.saveChat(newUniqueId);
                  }

                  navigation.navigate('BottomTab', {
                    screen: 'ShopTab',
                  });
                }
              }}>
              <Image source={icn.backArrowIcn} style={styles.backIcnStyle} />
            </TouchableOpacity>
            <Text style={styles.headerTitleTextStyle}>Your book</Text>
            <Text style={styles.pagesTextStyle}>{pages + ' Pages'}</Text>
          </View>
          <View style={styles.toggleButtonContainer}>
            <ToggleButton
              onPress={() => setSelectedButton(0)}
              title={'Default View'}
              oddContainerStyle={
                selectedButton == 0 && styles.selectedButtonStyle
              }
              oddTextStyle={selectedButton == 0 && styles.selectedTextStyle}
            />
            {showDeleteScreen ? null : (
              <ToggleButton
                onPress={() => setSelectedButton(1)}
                title={'Extended View'}
                oddContainerStyle={
                  selectedButton == 1 && styles.selectedButtonStyle
                }
                oddTextStyle={selectedButton == 1 && styles.selectedTextStyle}
              />
            )}
          </View>

          {/* {chat?.length < 1 ? (
            <Text
              style={{
                color: "grey",
                fontWeight: "bold",
                fontSize: 20,
                position: "absolute",
                alignSelf: "center",
                top: hp(40),
              }}
            >
              Import Whatsapp chat to continue
            </Text>
          ) : null} */}

          <ScrollView
            style={{flexGrow: 1}}
            contentContainerStyle={styles.scrollViewContainer}
            showsVerticalScrollIndicator={false}>
            {/* {chat?.nonchat?.length > 0 ? ( */}
            <ChatViewer
              stoploader={route?.params?.isExtendedView}
              bookSpecs={route?.params?.bookspecs}
              setCurrentPage={(page: any) => {
                console.log('Page', page);
                setCurrentPage(page);
              }}
              importTool={(data: any) => showSelection(data)}
              extendedView={selectedButton == 1 ? true : false}
              ref={a4Ref}
              messages={removeDuplicateMessages(chat?.nonchat)}
              // data={chat?.nonchat}
              returnChat={(chatNew: any) => {
                returnChat(chatNew);
              }}
              returnPages={(pages: any) => {
                setPages(pages?.length);
              }}
              startLoading={() => setIsLoading(true)}
              stopLoading={() => setIsLoading(false)}
              setExtendedView={(extendedView: boolean) => {
                setSelectedButton(extendedView ? 1 : 0);
              }}
            />
            {/* ) : null} */}
            {/* <ChatList
              returnIsLoading={setIsLoading}
              ref={chatlistRef}
              chat={chat?.nonchat}
              returnMaxPages={(val: any) => {
                setPages(val);
              }}
              extendedView={selectedButton == 1 ? true : false}
              returnChat={(chatNew: any) => {
                returnChat(chatNew);
              }}
              deletion={showDeleteScreen}
              returnDeletion={() => setShowDeleteScreen(false)}
            /> */}
          </ScrollView>
        </View>
        {isloading ? (
          <View
            style={{
              position: 'absolute',
              zIndex: 200,
              top: hp(50),
              alignSelf: 'center',
              padding: 10,
              borderRadius: 30,
              backgroundColor: 'white',
            }}>
            <ActivityIndicator style={{}} />
          </View>
        ) : null}
        {selectedButton == 0 && !showDeleteScreen && (
          <View style={styles.bottomIcnMainContainer}>
            <View style={styles.bottomIcnContainer}>
              {true ? null : (
                <TouchableOpacity
                  onPress={() => setShowChooseImportModal({params: {}})}>
                  <Image source={icn.upwardIcn} style={styles.bottomIcnStyle} />
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={() => setShowFontsModal(true)}>
                <Image source={icn.fontIcn} style={styles.bottomIcnStyle} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowColorModal(true)}>
                <Image source={icn.colorIcn} style={styles.bottomIcnStyle} />
              </TouchableOpacity>

              {/* {chat?.chat?.length > 0 ? (
                <TouchableOpacity onPress={() => setShowDeleteScreen(true)}>
                  <Image
                    source={icn.deleteIcn}
                    style={[styles.bottomIcnStyle, styles.deleteIcnStyle]}
                  />
                </TouchableOpacity>
              ) : null}
              {chat?.chat?.length > 0 ? (
                <TouchableOpacity onPress={() => a4Ref?.current?.zoomIn()}>
                  <Image
                    source={require("./../../assets/img/zi.png")}
                    style={[styles.bottomIcnStyle, styles.deleteIcnStyle]}
                  />
                </TouchableOpacity>
              ) : null}*/}

              <TouchableOpacity
                onPress={() => {
                  setShowTooltip(true);
                  // Clear any existing timeout to prevent issues
                  if (tooltipTimeoutRef.current) {
                    clearTimeout(tooltipTimeoutRef.current);
                  }
                  // Set new timeout and store the reference
                  tooltipTimeoutRef.current = setTimeout(
                    () => setShowTooltip(false),
                    3000,
                  );
                }}>
                <Image
                  source={require('./../../assets/icons/infoIcon.png')}
                  style={[styles.bottomIcnStyle, styles.deleteIcnStyle]}
                />
                <Modal
                  transparent={true}
                  visible={showTooltip}
                  animationType="fade"
                  onRequestClose={() => setShowTooltip(false)}>
                  <TouchableOpacity
                    style={{flex: 1}}
                    activeOpacity={1}
                    onPress={() => setShowTooltip(false)}>
                    <View
                      style={[
                        styles.tooltipContainer,
                        {
                          position: 'absolute',
                          bottom: hp(12),
                          left: wp(25),
                        },
                      ]}>
                      <View style={styles.tooltip}>
                        <Text style={styles.tooltipText}>
                          Press and hold the page to add or delete a page
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Modal>
              </TouchableOpacity>

              {/* <TouchableOpacity onPress={() => a4Ref?.current?.print()}>
                <Image
                  source={require("./../../assets/img/print.png")}
                  style={[styles.bottomIcnStyle, styles.deleteIcnStyle]}
                />
              </TouchableOpacity> */}
            </View>

            {/* {!chat?.chat || chat?.chat?.length < 1 || isloading ? null : ( */}
            {route?.params?.uniqueCartId ? null : (
              <View style={styles.customButtonContainer}>
                <CustomButton
                  text="Done"
                  oddTextStyle={styles.customBtnTextStyle}
                  oddContainerStyle={
                    chat?.chat?.length < 1 && styles.customBtnOddContainerStyle
                  }
                  onPress={navigateToCarProducts}
                  disable={chat?.chat?.length < 1 || isloading}
                />
              </View>
            )}
            {/* )} */}
          </View>
        )}
      </View>
      {/* // MODALS    */}
      <AddTextModal
        visible={showAddTextModal}
        characters={characters}
        withOutFeedbackPress={() => setShowAddTextModal(false)}
        value={selectedButton == 0 ? defaultTextState : addTextState}
        onChangeText={(txt: any) =>
          selectedButton == 0 ? setDefaultTextState(txt) : setAddTextState(txt)
        }
        headerPress={() => {
          setShowAddTextModal(false);
        }}
        onSubmitPress={() => {
          textModalSubmission();
        }}
      />

      <ChooseImportModal
        visible={showChooseImportModal != null}
        importChatPress={() => {
          navigation.navigate('Chat', {
            // setChat,
            // setFontStyle,
            // setFontFamily,
            // addChatToPage,
            // index: showChooseImportModal?.indexOfPage,
            // bookspecs: route?.params?.bookspecs,
          });
          setShowChooseImportModal(null);
        }}
        importPhotoPress={() => {
          if (
            showChooseImportModal?.function &&
            showChooseImportModal?.params
          ) {
            showChooseImportModal.function(showChooseImportModal.params);
          }
          setShowChooseImportModal(null);
        }}
        addTextPress={() => {
          setShowChooseImportModal(null);
          setShowAlterTextModal(true);
        }}
        withOutFeedBackPress={() => setShowChooseImportModal(null)}
      />

      <ColorModal
        visible={showColorModal}
        addImagePress={() => {
          setShowColorModal(false);
          // navigation.navigate("BookList");
        }}
        setCurrentColor={(color: any) => {
          setCurrentColor(color);
        }}
        setShowColorModal={setShowColorModal}
      />
      <FontsModal
        seeFontStyle={true}
        setShowFontsModal={setShowFontsModal}
        visible={showFontsModal}
        fontFamily={fontFamily}
        setShowEditModal={setShowEditModal}
        fontStyles={fontStyle}
        setFontFamily={setFontFamily}
        setFontStyles={setFontStyle}
      />
      <AddTextModal
        visible={showAlterTextModal}
        characters={alterCharacters}
        alterView={true}
        value={alterTextState}
        onChangeText={(txt: any) => setAlterTextState(txt)}
        withOutFeedbackPress={() => setShowAlterTextModal(false)}
        onSubmitPress={() => setShowAlterTextModal(false)}
        headerPress={() => setShowAlterTextModal(false)}
      />
    </>
  );
};

export default BookList;
